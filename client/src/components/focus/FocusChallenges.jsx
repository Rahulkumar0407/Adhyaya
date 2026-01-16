import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Trophy, Flame, Target, Users, Clock, Star,
    ChevronRight, Lock, CheckCircle, TrendingUp
} from 'lucide-react';

/**
 * Focus Challenges Component
 * Controlled gamification - discipline support, not dopamine loops
 */
const FocusChallenges = ({ settings }) => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    // Default weekly challenges
    const defaultChallenges = [
        {
            id: 'weekly_sessions',
            title: '5 Focus Sessions',
            description: 'Complete 5 focus sessions this week',
            target: 5,
            current: 0,
            unit: 'sessions',
            icon: Target,
            reward: 'Unlock streak protection',
            difficulty: 'beginner'
        },
        {
            id: 'total_focus_time',
            title: '5 Hours Focus',
            description: 'Accumulate 5 hours of focused work',
            target: 300,
            current: 0,
            unit: 'minutes',
            icon: Clock,
            reward: 'Focus badge',
            difficulty: 'intermediate'
        },
        {
            id: 'high_score_sessions',
            title: 'Laser Focus',
            description: 'Achieve 3 sessions with 80%+ focus score',
            target: 3,
            current: 0,
            unit: 'sessions',
            icon: Star,
            reward: 'Profile highlight',
            difficulty: 'advanced'
        },
        {
            id: 'streak_days',
            title: '7-Day Streak',
            description: 'Maintain a focus streak for 7 days',
            target: 7,
            current: settings?.focusStreak || 0,
            unit: 'days',
            icon: Flame,
            reward: 'Streak master badge',
            difficulty: 'advanced'
        }
    ];

    useEffect(() => {
        fetchChallengeProgress();
    }, []);

    const fetchChallengeProgress = async () => {
        try {
            // Fetch this week's analytics to calculate progress
            const { data } = await axios.get('/api/focus/analytics?days=7');
            if (data.success) {
                const summary = data.data.summary;

                // Update challenge progress
                const updatedChallenges = defaultChallenges.map(challenge => {
                    let current = 0;
                    switch (challenge.id) {
                        case 'weekly_sessions':
                            current = summary.totalSessions || 0;
                            break;
                        case 'total_focus_time':
                            current = summary.totalMinutes || 0;
                            break;
                        case 'high_score_sessions':
                            // This would need more detailed tracking
                            current = summary.completedSessions || 0;
                            break;
                        case 'streak_days':
                            current = settings?.focusStreak || 0;
                            break;
                    }
                    return { ...challenge, current };
                });

                setChallenges(updatedChallenges);
            }
        } catch (error) {
            console.error('Error fetching challenges:', error);
            setChallenges(defaultChallenges);
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'text-emerald-400 bg-emerald-500/10';
            case 'intermediate': return 'text-yellow-400 bg-yellow-500/10';
            case 'advanced': return 'text-red-400 bg-red-500/10';
            default: return 'text-gray-400 bg-white/5';
        }
    };

    const getProgress = (challenge) => {
        if (challenge.unit === 'minutes') {
            return Math.min(100, (challenge.current / challenge.target) * 100);
        }
        return Math.min(100, (challenge.current / challenge.target) * 100);
    };

    const formatProgress = (challenge) => {
        if (challenge.unit === 'minutes') {
            const currentHours = Math.floor(challenge.current / 60);
            const currentMins = challenge.current % 60;
            const targetHours = challenge.target / 60;
            return `${currentHours}h ${currentMins}m / ${targetHours}h`;
        }
        return `${challenge.current} / ${challenge.target} ${challenge.unit}`;
    };

    if (!settings?.enableChallenges) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <Lock className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Challenges are disabled</p>
                <p className="text-gray-500 text-xs mt-1">Enable in Focus Settings</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Weekly Challenges
                </h3>
                <span className="text-xs text-gray-500">Resets every Monday</span>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-white/5 rounded-xl"></div>
                    ))}
                </div>
            ) : (
                challenges.map(challenge => {
                    const Icon = challenge.icon;
                    const progress = getProgress(challenge);
                    const isComplete = progress >= 100;

                    return (
                        <div
                            key={challenge.id}
                            className={`p-4 rounded-xl border transition-all ${isComplete
                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-xl ${isComplete ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
                                    {isComplete ? (
                                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                                    ) : (
                                        <Icon className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-white">{challenge.title}</h4>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                                            {challenge.difficulty}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-2">{challenge.description}</p>

                                    {/* Progress bar */}
                                    <div className="mb-2">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-gray-500">{formatProgress(challenge)}</span>
                                            <span className={isComplete ? 'text-emerald-400' : 'text-gray-400'}>
                                                {Math.round(progress)}%
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'
                                                    }`}
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Reward */}
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Star className="w-3 h-3" />
                                        Reward: {challenge.reward}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

/**
 * Focus Streak Display Component
 */
export const FocusStreakDisplay = ({ streak = 0, longestStreak = 0 }) => {
    return (
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                    <Flame className={`w-6 h-6 ${streak > 0 ? 'text-orange-400' : 'text-gray-500'}`} />
                </div>
                <div>
                    <p className="text-2xl font-black text-white">{streak}</p>
                    <p className="text-xs text-gray-500">Day Streak</p>
                </div>
            </div>
            <div className="h-12 w-px bg-white/10"></div>
            <div>
                <p className="text-lg font-bold text-gray-400">{longestStreak}</p>
                <p className="text-xs text-gray-500">Best Streak</p>
            </div>
        </div>
    );
};

/**
 * Silent Peer Accountability
 * No chat, no pressure - just shared visibility
 */
export const PeerAccountability = ({ enabled }) => {
    if (!enabled) return null;

    // Placeholder for peer group feature
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white">Accountability Circle</h3>
            </div>

            <p className="text-sm text-gray-400 mb-4">
                Silent accountability with peers. No chat during focus. Just shared streak visibility.
            </p>

            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <p className="text-sm text-center text-purple-300">
                    Coming in Phase 5
                </p>
            </div>
        </div>
    );
};

export default FocusChallenges;
