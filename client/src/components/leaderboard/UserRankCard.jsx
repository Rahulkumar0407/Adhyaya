import React from 'react';
import { Trophy, ArrowUp, ArrowDown, Minus, ChevronRight, Sparkles } from 'lucide-react';
import RankChangeIndicator from './RankChangeIndicator';
import { BabuaTitleList } from './BabuaTitleBadge';

export default function UserRankCard({ data, category }) {
    if (!data || !data.userRank) return null;

    const { userRank, surrounding } = data;

    const getCategoryLabel = () => {
        switch (category) {
            case 'max-streak': return '🔥 Streak Rank';
            case 'focus-masters': return '⏱️ Focus Rank';
            case 'consistency': return '🎯 Consistency Rank';
            case 'weekly-climbers': return '🚀 Climber Rank';
            default: return 'Your Rank';
        }
    };

    const formatScore = (score) => {
        switch (category) {
            case 'max-streak':
                return `${score} days`;
            case 'focus-masters':
                if (score >= 60) {
                    return `${Math.floor(score / 60)}h ${score % 60}m`;
                }
                return `${score}m`;
            case 'consistency':
                return `${score}%`;
            default:
                return score;
        }
    };

    const getMotivationalMessage = () => {
        const rank = userRank.rank;
        if (rank === 1) return "🏆 Babua, tum sabse tez ho!";
        if (rank <= 3) return "💪 Podium pe ho, Babua! Keep it up!";
        if (rank <= 10) return "🔥 Top 10 mein ho! Thoda aur push karo!";
        if (rank <= 50) return "⚡ Accha chal raha hai, Babua!";
        return "🚀 Focus karo, Babua! Upar ao!";
    };

    return (
        <div className="sticky bottom-4 z-40">
            <div className="bg-gradient-to-br from-amber-900/95 via-[#1e1814]/95 to-amber-950/95 backdrop-blur-xl border border-amber-600/40 rounded-2xl p-4 shadow-2xl shadow-amber-900/50">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white">{getCategoryLabel()}</div>
                            <div className="text-[10px] text-amber-100/50">Your Babua Position</div>
                        </div>
                    </div>
                    {userRank.titles && userRank.titles.length > 0 && (
                        <BabuaTitleList titles={userRank.titles} maxDisplay={2} />
                    )}
                </div>

                {/* Main Rank Display */}
                <div className="flex items-center gap-4 mb-3">
                    {/* Rank Number */}
                    <div className="flex items-center gap-2">
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                            #{userRank.rank}
                        </div>
                        <RankChangeIndicator
                            direction={userRank.rankChange > 0 ? 'up' : userRank.rankChange < 0 ? 'down' : 'same'}
                            amount={Math.abs(userRank.rankChange)}
                            size="md"
                        />
                    </div>

                    {/* Score */}
                    <div className="flex-1 text-right">
                        <div className="text-xl font-bold text-white">
                            {formatScore(userRank.score)}
                        </div>
                        <div className="text-[10px] text-amber-100/40">Your Score</div>
                    </div>
                </div>

                {/* Surrounding Context (optional - can show nearby ranks) */}
                {(surrounding?.above?.length > 0 || surrounding?.below?.length > 0) && (
                    <div className="flex items-center gap-2 text-xs text-amber-100/40 border-t border-amber-800/30 pt-2">
                        <Sparkles className="w-3 h-3" />
                        {surrounding.above?.[0] && (
                            <span>
                                Beat <span className="text-amber-400">{surrounding.above[0].user.name}</span> to reach #{surrounding.above[0].rank}
                            </span>
                        )}
                    </div>
                )}

                {/* Motivational Message */}
                <div className="text-center mt-2 pt-2 border-t border-amber-800/30">
                    <p className="text-xs text-amber-100/60 italic">
                        {getMotivationalMessage()}
                    </p>
                </div>
            </div>
        </div>
    );
}
