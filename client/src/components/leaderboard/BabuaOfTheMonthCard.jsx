import React from 'react';
import { Crown, Flame, Clock, Medal, Star, Sparkles } from 'lucide-react';

export default function BabuaOfTheMonthCard({ data }) {
    if (!data) return null;

    const { periodLabel, user, stats, archivedAt } = data;

    // Format focus time
    const formatFocusTime = (minutes) => {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours}h ${mins}m`;
        }
        return `${minutes}m`;
    };

    return (
        <div className="relative mb-8 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-amber-500/20 to-orange-500/10 blur-3xl" />

            <div className="relative bg-gradient-to-br from-yellow-900/30 via-amber-900/20 to-orange-900/30 border-2 border-yellow-600/40 rounded-2xl p-6 shadow-2xl shadow-yellow-500/10">
                {/* Crown Animation */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce">
                    <Crown className="w-10 h-10 text-yellow-400 drop-shadow-lg" fill="currentColor" />
                </div>

                {/* Badge */}
                <div className="flex justify-center mb-4 mt-2">
                    <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/40 rounded-full px-4 py-1.5">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 text-sm font-bold">👑 Babua of {periodLabel}</span>
                    </div>
                </div>

                {/* Winner Profile */}
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="relative mb-4">
                        {/* Avatar with glow */}
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-1 shadow-xl shadow-yellow-500/30">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-amber-900 flex items-center justify-center text-white text-2xl font-bold">
                                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                            )}
                        </div>
                        {/* Medal */}
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-yellow-300 shadow-lg">
                            <Medal className="w-4 h-4 text-yellow-900" />
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-1">{user.name}</h3>
                    {user.activeTitle && (
                        <span className="text-yellow-400 text-sm font-medium">{user.activeTitle}</span>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-amber-950/50 rounded-xl p-3 text-center border border-amber-800/20">
                        <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-white">{stats.maxStreak}</div>
                        <div className="text-xs text-amber-100/50">Max Streak</div>
                    </div>
                    <div className="bg-amber-950/50 rounded-xl p-3 text-center border border-amber-800/20">
                        <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-white">{formatFocusTime(stats.monthlyFocusMinutes)}</div>
                        <div className="text-xs text-amber-100/50">Focus Time</div>
                    </div>
                    <div className="bg-amber-950/50 rounded-xl p-3 text-center border border-amber-800/20">
                        <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-white">{stats.focusMastersScore}</div>
                        <div className="text-xs text-amber-100/50">Score</div>
                    </div>
                </div>

                {/* Motivational Text */}
                <p className="text-center text-amber-100/40 text-xs mt-4 italic">
                    "Iss mahine ka sabse tez Babua! 🚀"
                </p>
            </div>
        </div>
    );
}
