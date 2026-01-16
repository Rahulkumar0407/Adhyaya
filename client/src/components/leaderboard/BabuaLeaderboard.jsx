import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
    Trophy, Flame, Clock, Target, TrendingUp, Crown,
    ChevronDown, ChevronUp, Coffee, Brain, Star, Medal,
    ArrowUp, ArrowDown, Minus, Users, Sparkles
} from 'lucide-react';
import BabuaOfTheMonthCard from './BabuaOfTheMonthCard';
import LeaderboardTable from './LeaderboardTable';
import UserRankCard from './UserRankCard';

const CATEGORIES = [
    { id: 'max-streak', label: '🔥 Max Streak', icon: Flame, color: 'from-orange-500 to-red-500' },
    { id: 'focus-masters', label: '⏱️ Focus Masters', icon: Clock, color: 'from-blue-500 to-cyan-500' },
    { id: 'consistency', label: '🎯 Consistency', icon: Target, color: 'from-green-500 to-emerald-500' },
    { id: 'weekly-climbers', label: '🚀 Weekly Climbers', icon: TrendingUp, color: 'from-purple-500 to-pink-500' }
];

const PERIODS = [
    { id: 'weekly', label: 'This Week' },
    { id: 'monthly', label: 'This Month' },
    { id: 'all-time', label: 'All Time' }
];

export default function BabuaLeaderboard() {
    const { token, user } = useAuth();
    const [activeCategory, setActiveCategory] = useState('focus-masters');
    const [activePeriod, setActivePeriod] = useState('all-time');
    const [leaderboard, setLeaderboard] = useState(null);
    const [babuaOfMonth, setBabuaOfMonth] = useState(null);
    const [myRank, setMyRank] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [page, setPage] = useState(1);

    // Fetch Babua of the Month
    useEffect(() => {
        const fetchBabuaOfMonth = async () => {
            try {
                const response = await api.get('/leaderboard/babua-of-month');
                if (response.data.success) {
                    setBabuaOfMonth(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching Babua of Month:', error);
            }
        };
        fetchBabuaOfMonth();
    }, []);

    // Fetch leaderboard data
    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                let endpoint = `/leaderboard/${activeCategory}`;
                const params = new URLSearchParams();
                params.append('limit', expanded ? 100 : 10);
                params.append('page', page);

                if (activeCategory === 'focus-masters') {
                    params.append('period', activePeriod);
                }

                const response = await api.get(`${endpoint}?${params}`);
                if (response.data.success) {
                    setLeaderboard(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [activeCategory, activePeriod, expanded, page]);

    // Fetch user's rank
    useEffect(() => {
        if (!token) return;

        const fetchMyRank = async () => {
            try {
                const response = await api.get(`/leaderboard/my-rank?category=${activeCategory}`);
                if (response.data.success) {
                    setMyRank(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching my rank:', error);
            }
        };
        fetchMyRank();
    }, [activeCategory, token]);

    const getCategoryInfo = () => CATEGORIES.find(c => c.id === activeCategory);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a1410] via-[#1e1814] to-[#1a1410] py-6 px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-amber-900/30 border border-amber-700/30 rounded-full px-4 py-2 mb-4">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-400 text-sm font-medium">Babua Board</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        🏆 <span className="text-amber-400">Asli Babuas</span> of Adhyaya
                    </h1>
                    <p className="text-amber-100/50 text-sm">
                        "Aaj chai kam, padhai zyada" ☕
                    </p>
                </div>

                {/* Babua of the Month */}
                {babuaOfMonth && <BabuaOfTheMonthCard data={babuaOfMonth} />}

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {CATEGORIES.map(category => {
                        const Icon = category.icon;
                        const isActive = activeCategory === category.id;
                        return (
                            <button
                                key={category.id}
                                onClick={() => {
                                    setActiveCategory(category.id);
                                    setPage(1);
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isActive
                                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                                        : 'bg-amber-900/20 text-amber-100/60 hover:bg-amber-900/40 hover:text-amber-100'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{category.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Period Toggle (only for Focus Masters) */}
                {activeCategory === 'focus-masters' && (
                    <div className="flex gap-2 mb-6">
                        {PERIODS.map(period => (
                            <button
                                key={period.id}
                                onClick={() => setActivePeriod(period.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activePeriod === period.id
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        : 'text-amber-100/50 hover:text-amber-100 hover:bg-amber-900/30'
                                    }`}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Leaderboard Table */}
                <div className="bg-gradient-to-br from-amber-900/20 to-amber-950/30 border border-amber-800/30 rounded-2xl overflow-hidden mb-6">
                    <div className="px-4 py-3 border-b border-amber-800/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {(() => {
                                const info = getCategoryInfo();
                                const Icon = info?.icon || Trophy;
                                return (
                                    <>
                                        <Icon className="w-5 h-5 text-amber-400" />
                                        <span className="font-bold text-white">{info?.label || 'Leaderboard'}</span>
                                    </>
                                );
                            })()}
                        </div>
                        <div className="flex items-center gap-2 text-amber-100/40 text-xs">
                            <Users className="w-4 h-4" />
                            <span>{leaderboard?.total || 0} Babuas</span>
                        </div>
                    </div>

                    <LeaderboardTable
                        rankings={leaderboard?.rankings || []}
                        category={activeCategory}
                        loading={loading}
                        currentUserId={user?._id}
                    />

                    {/* Expand/Collapse */}
                    {leaderboard?.total > 10 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="w-full py-3 flex items-center justify-center gap-2 text-amber-400 hover:text-amber-300 transition-colors border-t border-amber-800/20 bg-amber-900/10"
                        >
                            {expanded ? (
                                <>
                                    <ChevronUp className="w-4 h-4" />
                                    <span className="text-sm">Show Top 10</span>
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-4 h-4" />
                                    <span className="text-sm">Show Top 100</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* User's Rank Card (sticky on mobile) */}
                {myRank && (
                    <UserRankCard
                        data={myRank}
                        category={activeCategory}
                    />
                )}
            </div>
        </div>
    );
}
