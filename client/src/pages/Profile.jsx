import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Profile() {
    const { user, token } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [leetcodeUsername, setLeetcodeUsername] = useState('');
    const [linkingLeetcode, setLinkingLeetcode] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const updatedProfile = data.data;
                setProfile(updatedProfile);

                if (updatedProfile.codingProfiles?.leetcode?.username) {
                    setLeetcodeUsername(updatedProfile.codingProfiles.leetcode.username);

                    // Auto-sync if last synced > 5 minutes ago or never synced
                    const lastSynced = updatedProfile.codingProfiles.leetcode.lastSynced;
                    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

                    if (!lastSynced || new Date(lastSynced) < fiveMinutesAgo) {
                        // Trigger sync in background without blocking UI
                        handleBackgroundSync();
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBackgroundSync = async () => {
        // Don't set global loading or syncing state to avoid UI flicker, just visual indicator if needed
        setSyncing(true);
        try {
            const res = await fetch(`${API_URL}/profile/leetcode/sync`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                // Update just the leetcode part of profile
                setProfile(prev => ({
                    ...prev,
                    codingProfiles: {
                        ...prev.codingProfiles,
                        leetcode: data.data
                    }
                }));
            }
        } catch (error) {
            console.error('Background sync failed:', error);
        } finally {
            setSyncing(false);
        }
    };

    const handleLinkLeetcode = async (e) => {
        e.preventDefault();
        if (!leetcodeUsername.trim()) return;

        setLinkingLeetcode(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch(`${API_URL}/profile/leetcode/link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ username: leetcodeUsername.trim() })
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: data.message });
                fetchProfile();
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to link LeetCode account' });
        } finally {
            setLinkingLeetcode(false);
        }
    };

    const handleSyncLeetcode = async () => {
        setSyncing(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch(`${API_URL}/profile/leetcode/sync`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'LeetCode stats synced!' });
                fetchProfile();
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to sync LeetCode stats' });
        } finally {
            setSyncing(false);
        }
    };

    const handleUnlinkLeetcode = async () => {
        if (!confirm('Are you sure you want to unlink your LeetCode account?')) return;

        try {
            const res = await fetch(`${API_URL}/profile/leetcode/unlink`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'LeetCode account unlinked' });
                setLeetcodeUsername('');
                fetchProfile();
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to unlink LeetCode account' });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const leetcode = profile?.codingProfiles?.leetcode;
    const isLeetcodeLinked = leetcode?.username && leetcode?.verified;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Profile Header */}
            <div className="glass-panel rounded-xl p-6 mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="size-24 rounded-full bg-gradient-to-tr from-primary to-secondary p-1">
                        <div className="size-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                            {profile?.avatar ? (
                                <img src={profile.avatar} alt={profile.name} className="size-full object-cover" />
                            ) : (
                                <span className="text-4xl font-bold text-white">
                                    {profile?.name?.charAt(0) || 'B'}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bebas tracking-wide text-white mb-1">
                            {profile?.name || 'Babua'}
                        </h1>
                        <p className="text-gray-400 text-sm mb-2">{profile?.email}</p>
                        <p className="text-gray-300 text-sm">{profile?.bio || 'No bio yet. Add one to tell others about yourself!'}</p>
                    </div>
                    <Link
                        to="/settings"
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm font-bold text-white transition-colors"
                    >
                        Edit Profile
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="glass-panel rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-white">{profile?.streakCount || 0}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Day Streak</p>
                </div>
                <div className="glass-panel rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{profile?.babuaCoins || 0}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Samosa Points</p>
                </div>
                <div className="glass-panel rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-secondary">{profile?.xpPoints || 0}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">XP Earned</p>
                </div>
                <div className="glass-panel rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-white">Lvl {profile?.level || 1}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Current Level</p>
                </div>
            </div>

            {/* Message Display */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-red-500/20 border border-red-500/30 text-red-400'}`}>
                    {message.text}
                </div>
            )}

            {/* LeetCode Integration */}
            <div className="glass-panel rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="size-10 bg-[#FFA116] rounded-lg flex items-center justify-center">
                        <span className="text-black font-bold text-lg">LC</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bebas tracking-wide text-white">LeetCode Integration</h2>
                        <p className="text-xs text-gray-400">Sync your LeetCode progress to track your problem-solving journey</p>
                    </div>
                </div>

                {isLeetcodeLinked ? (
                    <div>
                        {/* Linked Account Info */}
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-400">check_circle</span>
                                    <span className="text-green-400 font-bold">Connected: @{leetcode.username}</span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Last synced: {leetcode.lastSynced ? new Date(leetcode.lastSynced).toLocaleDateString() : 'Never'}
                                </p>
                            </div>
                        </div>

                        {/* LeetCode Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-[#2a2a2a] rounded-lg p-4 text-center border border-[#333]">
                                <p className="text-3xl font-bold text-white">{leetcode.stats?.totalSolved || 0}</p>
                                <p className="text-xs text-gray-400">Total Solved</p>
                            </div>
                            <div className="bg-[#2a2a2a] rounded-lg p-4 text-center border border-green-500/30">
                                <p className="text-3xl font-bold text-green-400">{leetcode.stats?.easySolved || 0}</p>
                                <p className="text-xs text-gray-400">Easy</p>
                            </div>
                            <div className="bg-[#2a2a2a] rounded-lg p-4 text-center border border-yellow-500/30">
                                <p className="text-3xl font-bold text-yellow-400">{leetcode.stats?.mediumSolved || 0}</p>
                                <p className="text-xs text-gray-400">Medium</p>
                            </div>
                            <div className="bg-[#2a2a2a] rounded-lg p-4 text-center border border-red-500/30">
                                <p className="text-3xl font-bold text-red-400">{leetcode.stats?.hardSolved || 0}</p>
                                <p className="text-xs text-gray-400">Hard</p>
                            </div>
                        </div>

                        {/* Additional Stats */}
                        {(leetcode.stats?.ranking || leetcode.stats?.contestRating) && (
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {leetcode.stats?.ranking && (
                                    <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#333]">
                                        <p className="text-xs text-gray-400 uppercase mb-1">Global Ranking</p>
                                        <p className="text-xl font-bold text-white">#{leetcode.stats.ranking.toLocaleString()}</p>
                                    </div>
                                )}
                                {leetcode.stats?.contestRating && (
                                    <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#333]">
                                        <p className="text-xs text-gray-400 uppercase mb-1">Contest Rating</p>
                                        <p className="text-xl font-bold text-primary">{leetcode.stats.contestRating}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleSyncLeetcode}
                                disabled={syncing}
                                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-black font-bold rounded transition-colors disabled:opacity-50"
                            >
                                <span className={`material-symbols-outlined text-sm ${syncing ? 'animate-spin' : ''}`}>
                                    {syncing ? 'refresh' : 'sync'}
                                </span>
                                {syncing ? 'Syncing...' : 'Sync Now'}
                            </button>
                            <button
                                onClick={handleUnlinkLeetcode}
                                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded transition-colors"
                            >
                                Unlink Account
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleLinkLeetcode}>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={leetcodeUsername}
                                onChange={(e) => setLeetcodeUsername(e.target.value)}
                                placeholder="Enter your LeetCode username"
                                className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                            />
                            <button
                                type="submit"
                                disabled={linkingLeetcode || !leetcodeUsername.trim()}
                                className="px-6 py-3 bg-[#FFA116] hover:bg-[#FFB340] text-black font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {linkingLeetcode ? (
                                    <>
                                        <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                                        Linking...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">link</span>
                                        Link Account
                                    </>
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Your LeetCode profile must be public for stats to sync properly.
                        </p>
                    </form>
                )}
            </div>

            {/* Other Platforms (Coming Soon) */}
            <div className="glass-panel rounded-xl p-6 opacity-60">
                <h2 className="text-xl font-bebas tracking-wide text-white mb-4">More Platforms Coming Soon</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-[#1a1a1a] rounded-lg p-4 flex items-center gap-3 border border-[#333]">
                        <div className="size-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">CF</div>
                        <div>
                            <p className="text-white font-bold">CodeForces</p>
                            <p className="text-xs text-gray-500">Coming Soon</p>
                        </div>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-lg p-4 flex items-center gap-3 border border-[#333]">
                        <div className="size-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">HR</div>
                        <div>
                            <p className="text-white font-bold">HackerRank</p>
                            <p className="text-xs text-gray-500">Coming Soon</p>
                        </div>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-lg p-4 flex items-center gap-3 border border-[#333]">
                        <div className="size-10 bg-gray-600 rounded-lg flex items-center justify-center text-white font-bold">GH</div>
                        <div>
                            <p className="text-white font-bold">GitHub</p>
                            <p className="text-xs text-gray-500">Coming Soon</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
