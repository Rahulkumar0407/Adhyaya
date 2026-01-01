import Progress from '../models/Progress.js';
import User from '../../models/User.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Service to handle progress tracking and analytics
 */
class ProgressService {
    /**
     * Get or create daily progress document for a user
     */
    static async getOrCreateDailyProgress(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let progress = await Progress.findOne({
            user: userId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (!progress) {
            progress = await Progress.create({
                user: userId,
                date: today
            });
        }

        return progress;
    }

    /**
     * Record a problem solved by user
     */
    static async recordProblemSolved(userId, problemId) {
        const progress = await this.getOrCreateDailyProgress(userId);
        const user = await User.findById(userId);

        progress.problemsSolved += 1;
        progress.xpEarned += 50; // Standard XP for problem

        // Update user XP and Badge/Level logic
        const leveledUp = user.addXP(50);
        user.updateStreak();

        await Promise.all([progress.save(), user.save()]);

        return { progress, leveledUp };
    }

    /**
     * Record a topic completed
     */
    static async recordTopicCompleted(userId, topicId) {
        const progress = await this.getOrCreateDailyProgress(userId);
        const user = await User.findById(userId);

        if (!progress.topicsCompleted.includes(topicId)) {
            progress.topicsCompleted.push(topicId);
            progress.xpEarned += 20; // Standard XP for topic

            const leveledUp = user.addXP(20);
            user.updateStreak();

            await Promise.all([progress.save(), user.save()]);
            return { progress, leveledUp };
        }

        return { progress, leveledUp: false };
    }

    /**
     * Track video watch duration
     */
    static async recordVideoWatched(userId, topicId, durationInSeconds) {
        const progress = await this.getOrCreateDailyProgress(userId);

        // Find if video already tracked for today
        const videoIndex = progress.videosWatched.findIndex(v => v.topic.toString() === topicId.toString());

        if (videoIndex > -1) {
            progress.videosWatched[videoIndex].duration += durationInSeconds;
        } else {
            progress.videosWatched.push({ topic: topicId, duration: durationInSeconds });
        }

        progress.timeSpent.video += Math.floor(durationInSeconds / 60);
        progress.timeSpent.total += Math.floor(durationInSeconds / 60);

        await progress.save();
        return progress;
    }
}

export default ProgressService;
