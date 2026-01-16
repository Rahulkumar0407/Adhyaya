import React from 'react';
import { Crown, Medal, Award, ArrowUp, ArrowDown, Minus, Flame, Clock, Target, TrendingUp } from 'lucide-react';
import RankChangeIndicator from './RankChangeIndicator';
import BabuaTitleBadge from './BabuaTitleBadge';

export default function LeaderboardTable({ rankings, category, loading, currentUserId }) {
    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!rankings || rankings.length === 0) {
        const emptyMessages = {
            'max-streak': {
                emoji: '🔥',
                title: 'Streak toh banta nahi, board pe kya aayega!',
                subtitle: 'Roz focus session karo aur streak banao'
            },
            'focus-masters': {
                emoji: '☕',
                title: 'Koi Babua abhi race mein nahi hai!',
                subtitle: 'Focus session complete karo aur board pe aao'
            },
            'consistency': {
                emoji: '🎯',
                title: 'Consistency abhi zero hai bhai!',
                subtitle: 'Regular sessions complete karo aur score badao'
            },
            'weekly-climbers': {
                emoji: '🚀',
                title: 'Is hafte koi naya climber nahi aaya!',
                subtitle: 'Extra sessions daalo aur ranking improve karo'
            }
        };

        const msg = emptyMessages[category] || emptyMessages['focus-masters'];

        return (
            <div className="p-8 text-center">
                <div className="text-4xl mb-3">{msg.emoji}</div>
                <p className="text-amber-100/50">{msg.title}</p>
                <p className="text-amber-100/30 text-sm mt-1">{msg.subtitle}</p>
            </div>
        );
    }


    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400 fill-current" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
        if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
        return null;
    };

    const getRankBg = (rank) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-900/30 to-amber-900/20 border-l-2 border-yellow-500';
        if (rank === 2) return 'bg-gradient-to-r from-gray-800/30 to-gray-900/20 border-l-2 border-gray-400';
        if (rank === 3) return 'bg-gradient-to-r from-amber-900/30 to-orange-900/20 border-l-2 border-amber-600';
        return '';
    };

    const getScoreLabel = () => {
        switch (category) {
            case 'max-streak': return 'Days';
            case 'focus-masters': return 'Minutes';
            case 'consistency': return 'Score';
            case 'weekly-climbers': return 'Rank ↑';
            default: return 'Score';
        }
    };

    const formatScore = (entry) => {
        switch (category) {
            case 'max-streak':
                return `${entry.score} 🔥`;
            case 'focus-masters':
                if (entry.score >= 60) {
                    return `${Math.floor(entry.score / 60)}h ${entry.score % 60}m`;
                }
                return `${entry.score}m`;
            case 'consistency':
                return `${entry.score}%`;
            case 'weekly-climbers':
                return `+${entry.rankImprovement}`;
            default:
                return entry.score;
        }
    };

    return (
        <div className="divide-y divide-amber-800/20">
            {rankings.map((entry, index) => {
                const isCurrentUser = entry.user?._id === currentUserId;
                const rankIcon = getRankIcon(entry.rank);
                const rankBg = getRankBg(entry.rank);

                return (
                    <div
                        key={entry.user?._id || index}
                        className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-amber-900/10 ${rankBg} ${isCurrentUser ? 'bg-amber-500/10 ring-1 ring-amber-500/30' : ''
                            }`}
                    >
                        {/* Rank */}
                        <div className="w-10 text-center flex-shrink-0">
                            {rankIcon || (
                                <span className="text-lg font-bold text-amber-100/70">
                                    {entry.rank}
                                </span>
                            )}
                        </div>

                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full ${entry.rank <= 3 ? 'ring-2 ring-offset-2 ring-offset-transparent' : ''
                                } ${entry.rank === 1 ? 'ring-yellow-400' :
                                    entry.rank === 2 ? 'ring-gray-400' :
                                        entry.rank === 3 ? 'ring-amber-600' : ''
                                }`}>
                                {entry.user?.avatar ? (
                                    <img
                                        src={entry.user.avatar}
                                        alt={entry.user.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                                        {entry.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Name & Title */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={`font-medium truncate ${isCurrentUser ? 'text-amber-400' : 'text-white'}`}>
                                    {entry.user?.name || 'Anonymous Babua'}
                                </span>
                                {isCurrentUser && (
                                    <span className="px-1.5 py-0.5 bg-amber-500 text-black text-[10px] font-bold rounded uppercase">
                                        You
                                    </span>
                                )}
                            </div>
                            {entry.activeTitle && (
                                <BabuaTitleBadge title={entry.activeTitle} size="sm" />
                            )}
                        </div>

                        {/* Score */}
                        <div className="text-right flex-shrink-0">
                            <div className="text-lg font-bold text-white">
                                {formatScore(entry)}
                            </div>
                            {entry.rankChange && category !== 'weekly-climbers' && (
                                <RankChangeIndicator
                                    direction={entry.rankChange.direction}
                                    amount={entry.rankChange.amount}
                                />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
