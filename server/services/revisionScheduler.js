/**
 * Revision Scheduler Service
 * Core logic for generating adaptive revision schedules based on understanding
 */

import AdaptiveRevision from '../models/AdaptiveRevision.js';
import LectureProgress from '../models/LectureProgress.js';

// Spaced repetition intervals based on understanding level
const INTERVALS = {
    confused: [1, 3, 7, 14, 21, 30],    // Extra revisions for struggling students
    partial: [1, 3, 7, 14],             // Standard spaced repetition
    clear: [3, 7, 14],                // Less frequent, student understands
    crystal: [7, 14]                     // Minimal, just for long-term retention
};

// Revision types for each understanding level
const REVISION_TYPES = {
    confused: ['notes', 'quiz', 'quiz', 'recall', 'quiz', 'recall'],
    partial: ['quiz', 'quiz', 'recall', 'recall'],
    clear: ['recall', 'quiz', 'recall'],
    crystal: ['recall', 'recall']
};

// Priority mapping
const PRIORITY_MAP = {
    confused: 'critical',
    partial: 'high',
    clear: 'medium',
    crystal: 'low'
};

// Estimated time in minutes for each revision type
const ESTIMATED_TIME = {
    notes: 5,
    quiz: 10,
    recall: 8,
    coding: 15,
    explain: 12
};

// Generate "why scheduled" message
const generateWhyScheduled = (intervalDay, understandingLevel, revisionType) => {
    const levelMessages = {
        confused: "You marked this as confusing - extra practice helps!",
        partial: "You had some doubts - this will reinforce the concept.",
        clear: "Quick recall to keep it fresh in memory.",
        crystal: "Long-term retention check."
    };

    const typeMessages = {
        notes: "Review your notes",
        quiz: "Test your knowledge",
        recall: "Recall without hints",
        coding: "Practice with code",
        explain: "Explain in your words"
    };

    return `Day ${intervalDay} revision: ${levelMessages[understandingLevel]} ${typeMessages[revisionType]}.`;
};

/**
 * Generate revision schedule for a completed lecture
 */
export async function generateRevisionSchedule(lectureProgressId) {
    const lectureProgress = await LectureProgress.findById(lectureProgressId);

    if (!lectureProgress) {
        throw new Error('Lecture progress not found');
    }

    if (lectureProgress.revisionGenerated) {
        return { message: 'Revisions already generated', revisions: [] };
    }

    const {
        user,
        course,
        topicId,
        topicTitle,
        lessonId,
        lessonTitle,
        understandingLevel,
        completedAt
    } = lectureProgress;

    const intervals = INTERVALS[understandingLevel];
    const types = REVISION_TYPES[understandingLevel];
    const priority = PRIORITY_MAP[understandingLevel];
    const baseDate = new Date(completedAt);

    const revisions = [];

    for (let i = 0; i < intervals.length; i++) {
        const intervalDay = intervals[i];
        const revisionType = types[i] || 'recall';

        const scheduledDate = new Date(baseDate);
        scheduledDate.setDate(scheduledDate.getDate() + intervalDay);

        const revision = await AdaptiveRevision.create({
            user,
            course,
            topicId,
            topicTitle,
            lessonId,
            lessonTitle,
            lectureProgress: lectureProgressId,
            initialUnderstanding: understandingLevel,
            scheduledDate,
            intervalDay,
            revisionType,
            priority,
            whyScheduled: generateWhyScheduled(intervalDay, understandingLevel, revisionType),
            estimatedMinutes: ESTIMATED_TIME[revisionType]
        });

        revisions.push(revision);
    }

    // Mark lecture as revision-generated
    lectureProgress.revisionGenerated = true;
    await lectureProgress.save();

    return { message: 'Revisions generated successfully', revisions };
}

/**
 * Adjust revision schedule based on quiz performance
 */
export async function adjustScheduleBasedOnPerformance(userId, topicId, course, accuracy) {
    const now = new Date();

    // Find pending revisions for this topic
    const pendingRevisions = await AdaptiveRevision.find({
        user: userId,
        topicId,
        course,
        status: 'pending',
        scheduledDate: { $gt: now }
    }).sort({ scheduledDate: 1 });

    if (pendingRevisions.length === 0) {
        return { adjusted: false, message: 'No pending revisions to adjust' };
    }

    let adjustment = 'maintain';
    let adjustmentDays = 0;

    if (accuracy < 50) {
        // Poor performance: Add extra revisions
        adjustment = 'accelerate';

        // Create additional revision in 3 days
        const additionalDate = new Date(now);
        additionalDate.setDate(additionalDate.getDate() + 3);

        await AdaptiveRevision.create({
            user: userId,
            course,
            topicId,
            topicTitle: pendingRevisions[0].topicTitle,
            lessonId: pendingRevisions[0].lessonId,
            lessonTitle: pendingRevisions[0].lessonTitle,
            lectureProgress: pendingRevisions[0].lectureProgress,
            initialUnderstanding: 'confused', // Downgrade understanding
            scheduledDate: additionalDate,
            intervalDay: 3,
            revisionType: 'quiz',
            priority: 'critical',
            whyScheduled: `Extra practice needed - accuracy was ${accuracy}%`,
            estimatedMinutes: 10,
            triggedAdditionalRevisions: true
        });

    } else if (accuracy >= 85) {
        // Great performance: Delay next revision by 50%
        adjustment = 'delay';

        for (const revision of pendingRevisions) {
            const currentInterval = (revision.scheduledDate - now) / (1000 * 60 * 60 * 24);
            const newInterval = Math.ceil(currentInterval * 1.5);
            adjustmentDays = newInterval - currentInterval;

            const newDate = new Date(now);
            newDate.setDate(newDate.getDate() + newInterval);

            revision.scheduledDate = newDate;
            revision.whyScheduled += ` (Delayed: strong recall - ${accuracy}% accuracy)`;
            await revision.save();
        }
    }
    // 50-85%: maintain schedule, no changes

    return { adjusted: true, adjustment, adjustmentDays };
}

/**
 * Generate smart catch-up plan for missed revisions
 */
export async function generateCatchupPlan(userId) {
    const overdueRevisions = await AdaptiveRevision.getOverdueRevisions(userId);

    if (overdueRevisions.length === 0) {
        return { message: 'No missed revisions', plan: [] };
    }

    // Group by priority and topic
    const critical = overdueRevisions.filter(r => r.priority === 'critical');
    const high = overdueRevisions.filter(r => r.priority === 'high');
    const medium = overdueRevisions.filter(r => r.priority === 'medium');
    const low = overdueRevisions.filter(r => r.priority === 'low');

    // Create compressed catch-up schedule
    const plan = [];
    const now = new Date();
    let dayOffset = 0;

    // Spread revisions over the next few days (max 5 per day)
    const allSorted = [...critical, ...high, ...medium, ...low];

    for (let i = 0; i < allSorted.length; i++) {
        if (i > 0 && i % 5 === 0) dayOffset++;

        const revision = allSorted[i];
        const newDate = new Date(now);
        newDate.setDate(newDate.getDate() + dayOffset);

        // Mark old as missed and create new catch-up entry
        revision.status = 'missed';
        await revision.save();

        const catchupRevision = await AdaptiveRevision.create({
            user: userId,
            course: revision.course,
            topicId: revision.topicId,
            topicTitle: revision.topicTitle,
            lessonId: revision.lessonId,
            lessonTitle: revision.lessonTitle,
            lectureProgress: revision.lectureProgress,
            initialUnderstanding: revision.initialUnderstanding,
            scheduledDate: newDate,
            intervalDay: revision.intervalDay,
            revisionType: revision.revisionType,
            priority: revision.priority,
            whyScheduled: `Catch-up: ${revision.whyScheduled}`,
            estimatedMinutes: revision.estimatedMinutes
        });

        plan.push(catchupRevision);
    }

    return {
        message: `Catch-up plan created for ${allSorted.length} missed revisions`,
        originalMissed: allSorted.length,
        daysToComplete: dayOffset + 1,
        plan
    };
}

/**
 * Get smart suggestions for weak topics
 */
export async function getSmartSuggestions(userId) {
    // Get weak topics from lecture progress
    const weakFromUnderstanding = await LectureProgress.getWeakTopics(userId);

    // Get topics not revised for long
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const staleTopics = await AdaptiveRevision.find({
        user: userId,
        status: 'completed',
        completedAt: { $lt: thirtyDaysAgo }
    })
        .sort({ completedAt: 1 })
        .limit(5);

    // Get frequently missed topics
    const missedStats = await AdaptiveRevision.aggregate([
        { $match: { user: userId, status: 'missed' } },
        { $group: { _id: { topicId: '$topicId', course: '$course' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);

    return {
        weakTopics: weakFromUnderstanding,
        staleTopics,
        frequentlyMissed: missedStats
    };
}

export default {
    generateRevisionSchedule,
    adjustScheduleBasedOnPerformance,
    generateCatchupPlan,
    getSmartSuggestions,
    INTERVALS,
    REVISION_TYPES,
    PRIORITY_MAP,
    ESTIMATED_TIME
};
