import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Check, Zap, Brain, Calendar, TrendingUp, Wallet, AlertCircle, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const UpgradeModal = ({ isOpen, onClose, onUpgrade, subscription }) => {
    const [walletBalance, setWalletBalance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchingWallet, setFetchingWallet] = useState(true);
    const navigate = useNavigate();

    const PREMIUM_PRICE = 60; // ₹60 per month

    useEffect(() => {
        if (isOpen) {
            fetchWalletBalance();
        }
    }, [isOpen]);

    const fetchWalletBalance = async () => {
        try {
            setFetchingWallet(true);
            const res = await api.get('/wallet');
            if (res.data.success) {
                setWalletBalance(res.data.data.balance || 0);
            }
        } catch (error) {
            console.error('Failed to fetch wallet:', error);
            setWalletBalance(0);
        } finally {
            setFetchingWallet(false);
        }
    };

    const handleUpgradeWithWallet = async () => {
        if (walletBalance < PREMIUM_PRICE) {
            toast.error('Insufficient wallet balance. Please add funds first.');
            return;
        }

        try {
            setLoading(true);

            // Deduct from wallet and upgrade subscription
            const res = await api.post('/adaptive-revision/subscribe-with-wallet', {
                amount: PREMIUM_PRICE
            });

            if (res.data.success) {
                toast.success('🎉 Upgraded to Premium successfully!');
                onUpgrade && onUpgrade();
                onClose();
            }
        } catch (error) {
            console.error('Upgrade failed:', error);
            toast.error(error.response?.data?.message || 'Upgrade failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoToWallet = () => {
        onClose();
        navigate('/wallet');
    };

    if (!isOpen) return null;

    const benefits = [
        { icon: Brain, text: 'Unlimited lecture tracking' },
        { icon: Calendar, text: 'AI-powered revision schedules' },
        { icon: TrendingUp, text: 'Advanced retention analytics' },
        { icon: Zap, text: 'Priority support' }
    ];

    const hasSufficientBalance = walletBalance >= PREMIUM_PRICE;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-8 max-w-xl w-full border border-white/10 relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
                {/* Decorative glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-r from-violet-500/30 to-cyan-500/30 rounded-full blur-3xl -z-10" />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white">
                            Upgrade to Premium
                        </h2>
                        <p className="text-slate-400 text-sm">
                            Unlock unlimited adaptive revision
                        </p>
                    </div>
                </div>

                {/* Free trial status */}
                {subscription && subscription.plan !== 'premium' && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <span className="text-orange-400 font-medium">
                                {subscription.plan === 'expired' ? 'Subscription Expired' : 'Free Trial'}
                            </span>
                            <span className="text-white font-bold">
                                {subscription.lecturesUsed || 0}/{subscription.maxFreeLectures || 3} lectures used
                            </span>
                        </div>
                        <div className="h-2 bg-orange-950 rounded-full mt-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                                style={{ width: `${((subscription.lecturesUsed || 0) / (subscription.maxFreeLectures || 3)) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Benefits */}
                <div className="space-y-3 mb-6">
                    {benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                <Check className="w-4 h-4 text-emerald-400" />
                            </div>
                            <span className="text-slate-300 font-medium">{benefit.text}</span>
                        </div>
                    ))}
                </div>

                {/* Pricing */}
                <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-white/5 mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-black text-white">₹{PREMIUM_PRICE}</span>
                        <span className="text-slate-400 text-lg">/month</span>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">Cancel anytime</p>
                </div>

                {/* Wallet Balance Section */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-emerald-400" />
                            <span className="text-slate-300 font-medium">Wallet Balance</span>
                        </div>
                        {fetchingWallet ? (
                            <div className="animate-pulse w-16 h-6 bg-slate-700 rounded"></div>
                        ) : (
                            <span className={`font-bold text-lg ${hasSufficientBalance ? 'text-emerald-400' : 'text-red-400'}`}>
                                ₹{walletBalance}
                            </span>
                        )}
                    </div>

                    {!fetchingWallet && !hasSufficientBalance && (
                        <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-300 text-sm font-medium">Insufficient Balance</p>
                                <p className="text-red-400/70 text-xs mt-1">
                                    You need ₹{PREMIUM_PRICE - walletBalance} more to upgrade. Add funds to your wallet first.
                                </p>
                            </div>
                        </div>
                    )}

                    {!fetchingWallet && hasSufficientBalance && (
                        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <Check className="w-5 h-5 text-emerald-400" />
                            <p className="text-emerald-300 text-sm font-medium">
                                ₹{PREMIUM_PRICE} will be deducted from your wallet
                            </p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {hasSufficientBalance ? (
                        <button
                            onClick={handleUpgradeWithWallet}
                            disabled={loading || fetchingWallet}
                            className="w-full py-4 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Pay ₹{PREMIUM_PRICE} & Upgrade
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleGoToWallet}
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
                        >
                            <Wallet className="w-5 h-5" />
                            Add Funds to Wallet
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
                    >
                        Maybe Later
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default UpgradeModal;
