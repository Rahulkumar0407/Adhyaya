/**
 * Focus AI Service
 * 
 * Provides intelligent recommendations for:
 * - Adaptive Pomodoro durations based on past performance
 * - Smart break suggestions based on fatigue signals
 * - Session optimization recommendations
 */

class FocusAIService {
    constructor() {
        this.sessionHistory = [];
        this.fatigueIndicators = {
            lowGazeCount: 0,
            drowsinessEvents: 0,
            sessionDuration: 0
        };
        this.metricsHistory = [];
    }

    /**
     * Add metrics to history for aggregation
     */
    addMetrics(metrics) {
        this.metricsHistory.push({
            ...metrics,
            timestamp: Date.now()
        });
    }

    /**
     * Get aggregated metrics from the current session
     * @returns {Object} Aggregated metrics
     */
    getAggregatedMetrics() {
        if (this.metricsHistory.length === 0) {
            return {
                avgGazeScore: 75,
                blinkRatePerMin: 15,
                lookAwayCount: 0,
                drowsinessEvents: 0
            };
        }

        const sum = this.metricsHistory.reduce((acc, m) => ({
            gazeScore: acc.gazeScore + (m.gazeScore || 0),
            blinkCount: acc.blinkCount + (m.blinkCount || 0),
            lookAwayCount: acc.lookAwayCount + (m.lookAwayCount || 0),
            drowsinessEvents: acc.drowsinessEvents + (m.drowsinessEvents || 0)
        }), { gazeScore: 0, blinkCount: 0, lookAwayCount: 0, drowsinessEvents: 0 });

        const count = this.metricsHistory.length;
        const durationMinutes = count > 0 ? (Date.now() - this.metricsHistory[0].timestamp) / 60000 : 1;

        return {
            avgGazeScore: Math.round(sum.gazeScore / count) || 75,
            blinkRatePerMin: Math.round(sum.blinkCount / Math.max(1, durationMinutes)),
            lookAwayCount: sum.lookAwayCount,
            drowsinessEvents: sum.drowsinessEvents
        };
    }

    /**
     * Reset metrics for a new session
     */
    resetMetrics() {
        this.metricsHistory = [];
    }

    /**
     * Analyze session history to recommend optimal work duration
     * @param {Array} sessions - Array of past focus sessions
     * @param {Object} settings - User settings
     * @returns {Object} Recommended work/break durations
     */
    getAdaptiveDurations(sessions, settings) {
        if (!sessions || sessions.length < 3) {
            // Not enough data, use defaults
            return {
                workDuration: settings?.defaultWorkDuration || 25,
                breakDuration: settings?.defaultBreakDuration || 5,
                confidence: 'low',
                reason: 'Need more session history for personalized recommendations'
            };
        }

        // Analyze recent sessions (last 10)
        const recentSessions = sessions.slice(0, 10);

        // Calculate average performance by duration
        const durationPerformance = {};
        recentSessions.forEach(session => {
            const duration = session.plannedDuration;
            if (!durationPerformance[duration]) {
                durationPerformance[duration] = { totalScore: 0, count: 0, completed: 0 };
            }
            durationPerformance[duration].totalScore += session.focusScore || 0;
            durationPerformance[duration].count += 1;
            if (session.status === 'completed') {
                durationPerformance[duration].completed += 1;
            }
        });

        // Find best performing duration
        let bestDuration = settings?.defaultWorkDuration || 25;
        let bestScore = 0;

        for (const [duration, stats] of Object.entries(durationPerformance)) {
            const avgScore = stats.totalScore / stats.count;
            const completionRate = stats.completed / stats.count;
            const adjustedScore = avgScore * (0.7 + completionRate * 0.3);

            if (adjustedScore > bestScore && stats.count >= 2) {
                bestScore = adjustedScore;
                bestDuration = parseInt(duration);
            }
        }

        // Calculate average focus score
        const avgScore = recentSessions.reduce((sum, s) => sum + (s.focusScore || 0), 0) / recentSessions.length;

        // Adjust based on fatigue patterns
        let recommendedDuration = bestDuration;
        let recommendedBreak = settings?.defaultBreakDuration || 5;

        if (avgScore < 50) {
            // Low performance - suggest shorter sessions
            recommendedDuration = Math.max(15, bestDuration - 5);
            recommendedBreak = Math.min(10, recommendedBreak + 2);
        } else if (avgScore > 80) {
            // High performance - can try longer sessions
            recommendedDuration = Math.min(60, bestDuration + 5);
        }

        return {
            workDuration: recommendedDuration,
            breakDuration: recommendedBreak,
            confidence: avgScore > 70 ? 'high' : 'medium',
            reason: `Based on ${recentSessions.length} sessions, avg score: ${Math.round(avgScore)}%`,
            insights: {
                averageFocusScore: Math.round(avgScore),
                bestPerformingDuration: bestDuration,
                completionRate: Math.round((recentSessions.filter(s => s.status === 'completed').length / recentSessions.length) * 100)
            }
        };
    }

    /**
     * Determine if a break is recommended based on current signals
     * @param {Object} metrics - Current attention metrics
     * @param {number} elapsedMinutes - Time elapsed in current session
     * @param {Object} settings - User settings
     * @returns {Object|null} Break recommendation or null
     */
    getBreakRecommendation(metrics, elapsedMinutes, settings) {
        // Don't recommend breaks in first 15 mins
        if (elapsedMinutes < 15) {
            return null;
        }

        let breakRecommended = false;
        let breakType = 'other';
        let urgency = 'low';
        let reason = '';

        // Check fatigue indicators
        if (metrics.gazeScore < 50) {
            breakRecommended = true;
            breakType = 'eye_rest';
            urgency = 'medium';
            reason = 'Your attention seems to be dropping. A short break might help.';
        }

        if (metrics.drowsinessEvents > 2) {
            breakRecommended = true;
            breakType = 'walk';
            urgency = 'high';
            reason = 'You seem tired. Consider a short walk to refresh.';
        }

        if (metrics.blinkCount > 30 && elapsedMinutes > 25) {
            breakRecommended = true;
            breakType = 'eye_rest';
            urgency = 'medium';
            reason = 'Your eyes might be strained. Try the 20-20-20 rule.';
        }

        // Hydration reminder after 45 mins
        if (elapsedMinutes >= 45 && !breakRecommended) {
            breakRecommended = true;
            breakType = 'hydration';
            urgency = 'low';
            reason = 'You\'ve been focused for a while. Stay hydrated!';
        }

        // Stretch reminder after extended sitting
        if (elapsedMinutes >= 55 && !breakRecommended) {
            breakRecommended = true;
            breakType = 'stretch';
            urgency = 'medium';
            reason = 'Time for a quick stretch to maintain productivity.';
        }

        if (!breakRecommended) {
            return null;
        }

        return {
            recommended: true,
            type: breakType,
            urgency,
            reason,
            suggestedDuration: this.getBreakDuration(breakType, urgency),
            activity: this.getBreakActivity(breakType)
        };
    }

    /**
     * Get recommended break duration based on type and urgency
     */
    getBreakDuration(type, urgency) {
        const baseDurations = {
            eye_rest: 2,
            stretch: 3,
            hydration: 2,
            walk: 5,
            other: 5
        };

        const duration = baseDurations[type] || 5;
        return urgency === 'high' ? duration + 2 : duration;
    }

    /**
     * Get specific break activity suggestion
     */
    getBreakActivity(type) {
        const activities = {
            eye_rest: {
                title: '20-20-20 Rule',
                description: 'Look at something 20 feet away for 20 seconds'
            },
            stretch: {
                title: 'Quick Stretch',
                description: 'Stand up, stretch your arms and neck'
            },
            hydration: {
                title: 'Hydration Break',
                description: 'Drink some water to stay focused'
            },
            walk: {
                title: 'Short Walk',
                description: 'Walk around for a few minutes to refresh'
            },
            other: {
                title: 'Rest Break',
                description: 'Step away from the screen briefly'
            }
        };

        return activities[type] || activities.other;
    }

    /**
     * Get AI recommendation for current session
     * @returns {Object} Session recommendation
     */
    getSessionRecommendation(metrics, elapsedSeconds, settings) {
        const elapsedMinutes = elapsedSeconds / 60;

        // Should continue, take break, or stop?
        if (metrics.gazeScore >= 70) {
            return {
                action: 'continue',
                message: 'Stay focused! You\'re doing great.',
                confidence: metrics.gazeScore >= 85 ? 'high' : 'medium'
            };
        }

        if (metrics.gazeScore < 40 && elapsedMinutes > 20) {
            return {
                action: 'break',
                message: 'Your focus is dropping. Consider a short break.',
                breakRecommendation: this.getBreakRecommendation(metrics, elapsedMinutes, settings),
                confidence: 'high'
            };
        }

        if (metrics.drowsinessEvents > 3) {
            return {
                action: 'stop',
                message: 'You seem tired. Maybe it\'s time to stop for now.',
                confidence: 'medium'
            };
        }

        return {
            action: 'continue',
            message: 'Keep going, you can do this!',
            confidence: 'low'
        };
    }

    /**
     * Analyze best focus time from session history
     */
    analyzeBestFocusTime(sessions) {
        if (!sessions || sessions.length < 5) {
            return null;
        }

        const hourScore = {};
        const dayScore = {};

        sessions.forEach(session => {
            const date = new Date(session.startTime);
            const hour = date.getHours();
            const day = date.toLocaleDateString('en-US', { weekday: 'lowercase' });

            if (!hourScore[hour]) hourScore[hour] = { total: 0, count: 0 };
            if (!dayScore[day]) dayScore[day] = { total: 0, count: 0 };

            hourScore[hour].total += session.focusScore || 0;
            hourScore[hour].count += 1;
            dayScore[day].total += session.focusScore || 0;
            dayScore[day].count += 1;
        });

        // Find best hour
        let bestHour = null;
        let bestHourScore = 0;
        for (const [hour, stats] of Object.entries(hourScore)) {
            const avg = stats.total / stats.count;
            if (avg > bestHourScore && stats.count >= 2) {
                bestHour = parseInt(hour);
                bestHourScore = avg;
            }
        }

        // Find best day
        let bestDay = null;
        let bestDayScore = 0;
        for (const [day, stats] of Object.entries(dayScore)) {
            const avg = stats.total / stats.count;
            if (avg > bestDayScore && stats.count >= 2) {
                bestDay = day;
                bestDayScore = avg;
            }
        }

        return {
            bestHour,
            bestHourScore: Math.round(bestHourScore),
            bestDay,
            bestDayScore: Math.round(bestDayScore)
        };
    }
}

const focusAIService = new FocusAIService();
export default focusAIService;
