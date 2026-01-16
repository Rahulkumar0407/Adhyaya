import React, { useState, useEffect } from 'react';
import { Copy, Check, Gift, Users, Trophy, ChevronRight, Zap, Coins } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ReferralSection = () => {
    const [referralData, setReferralData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [claimCode, setClaimCode] = useState('');
    const [claiming, setClaiming] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchReferralData();
    }, []);

    const fetchReferralData = async () => {
        try {
            const { data } = await api.get('/referral');
            if (data.success) {
                setReferralData(data.data);
            }
        } catch (error) {
            console.error('Error fetching referral data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!referralData?.referralCode) return;
        navigator.clipboard.writeText(referralData.referralCode);
        setCopied(true);
        toast.success('Referral code copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClaim = async () => {
        if (!claimCode.trim()) {
            toast.error('Please enter a code');
            return;
        }

        setClaiming(true);
        try {
            const { data } = await api.post('/referral/claim', { code: claimCode });
            if (data.success) {
                toast.success(data.message);
                setClaimCode('');
                // Refresh data to show updated stats if needed (though claiming mostly affects the claimer)
                fetchReferralData();
                window.location.reload(); // Reload to update header points
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to claim referral');
        } finally {
            setClaiming(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-white/50">Loading rewards...</div>;
    }

    return (
        <div className="mb-12 relative overflow-hidden">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Refer & Earn</h2>
                    <p className="text-purple-200/50 text-sm">Invite friends, earn together!</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {/* Invite Card */}
                <div className="bg-gradient-to-br from-indigo-950/40 to-purple-900/20 backdrop-blur-xl rounded-2xl p-6 border border-indigo-500/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-24 h-24 text-indigo-400" />
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-lg font-bold text-white mb-2">Invite Friends</h3>
                        <p className="text-indigo-200/70 text-sm mb-6 max-w-sm">
                            Share your code with friends. Both you and your friend get <span className="text-amber-400 font-bold">200 Babua Points</span> when they verify!
                        </p>

                        <div className="space-y-4">
                            <div className="bg-indigo-950/50 rounded-xl p-4 border border-indigo-500/20 flex flex-col gap-2">
                                <label className="text-xs text-indigo-300 uppercase tracking-wider font-semibold">Your Unique Code</label>
                                <div className="flex items-center justify-between gap-3">
                                    <code className="text-2xl font-mono font-bold text-white tracking-wider">
                                        {referralData?.referralCode || '------'}
                                    </code>
                                    <button
                                        onClick={handleCopy}
                                        className="p-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 hover:text-white transition-colors"
                                        title="Copy Code"
                                    >
                                        {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm bg-indigo-950/30 rounded-lg p-3 border border-indigo-500/10">
                                <span className="text-indigo-200/60">Total Earned</span>
                                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                                    <Coins className="w-4 h-4" />
                                    <span>{referralData?.totalEarned || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Claim Card */}
                <div className="bg-gradient-to-br from-purple-950/40 to-pink-900/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy className="w-24 h-24 text-purple-400" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-white">Have a Code?</h3>
                            {referralData?.referralClaimed && (
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Claimed
                                </span>
                            )}
                        </div>
                        <p className="text-purple-200/70 text-sm mb-6 max-w-sm">
                            Enter a friend's referral code to instantly unlock your <span className="text-amber-400 font-bold">200 Babua Points</span> reward.
                        </p>

                        {!referralData?.referralClaimed ? (
                            <div className="flex flex-col gap-3">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={claimCode}
                                        onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                                        placeholder="ENTER CODE"
                                        maxLength={6}
                                        className="w-full bg-purple-950/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder:text-purple-400/30 focus:outline-none focus:border-purple-400 transition-colors uppercase font-mono tracking-wider"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Zap className="w-4 h-4 text-purple-400/50" />
                                    </div>
                                </div>
                                <button
                                    onClick={handleClaim}
                                    disabled={claiming || !claimCode}
                                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {claiming ? (
                                        <span className="animate-pulse">Verifying...</span>
                                    ) : (
                                        <>
                                            Claim Reward
                                            <ChevronRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Trophy className="w-6 h-6 text-green-400" />
                                </div>
                                <h4 className="text-white font-bold mb-1">Reward Unlocked!</h4>
                                <p className="text-green-200/70 text-sm">You've successfully claimed your referral bonus.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferralSection;
