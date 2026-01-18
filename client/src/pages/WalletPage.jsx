import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, CreditCard, History, TrendingUp, DollarSign, AlertCircle, ArrowUpRight, ArrowDownLeft, Banknote, Building2, CheckCircle2, Clock, BadgeCheck, Maximize2, X, Tag } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import { toast } from 'react-hot-toast';
import TransactionHistoryModal from '../components/common/TransactionHistoryModal';

// Helper to check if transaction is a credit (money in)
const isCreditTransaction = (type) => ['topup', 'bonus', 'refund'].includes(type);

const WalletPage = () => {
    const { user } = useAuth();
    const isMentor = user?.role === 'mentor';
    const [loading, setLoading] = useState(true);
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [amount, setAmount] = useState('');
    const [processing, setProcessing] = useState(false);
    const [showFullQr, setShowFullQr] = useState(false);
    const [sendingNotification, setSendingNotification] = useState(false);
    const [utrNumber, setUtrNumber] = useState('');

    // Coupon & Payment states
    const [couponCode, setCouponCode] = useState('');
    const [couponDetails, setCouponDetails] = useState(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [paymentStep, setPaymentStep] = useState('input'); // input, confirm, notify
    const [paymentOrder, setPaymentOrder] = useState(null);

    // Mentor withdrawal states
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [bankDetails, setBankDetails] = useState({
        accountNumber: '',
        ifscCode: '',
        accountHolderName: ''
    });

    const [showHistoryModal, setShowHistoryModal] = useState(false);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            const [walletRes, transactionsRes] = await Promise.all([
                api.get('/wallet'),
                api.get('/wallet/transactions?limit=10')
            ]);

            if (walletRes.data.success) {
                setWallet(walletRes.data.data);
            }
            if (transactionsRes.data.success) {
                setTransactions(transactionsRes.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch wallet data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        if (!amount || amount < 50) {
            toast.error('Please enter a valid amount first (Min ₹50)');
            return;
        }

        try {
            setIsValidatingCoupon(true);
            const response = await api.post('/wallet/check-coupon', {
                code: couponCode,
                amount: parseInt(amount)
            });

            if (response.data.success) {
                setCouponDetails(response.data.data);
                toast.success(`Coupon applied! You save ₹${response.data.data.discount}`);
            }
        } catch (error) {
            console.error('Coupon error:', error);
            setCouponDetails(null);
            toast.error(error.response?.data?.message || 'Invalid coupon');
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handleInitiatePayment = async () => {
        if (!amount || isNaN(amount) || amount < 50) {
            toast.error('Please enter a valid amount (min ₹50)');
            return;
        }

        try {
            setProcessing(true);
            const response = await api.post('/wallet/topup/create-order', {
                amount: parseInt(amount),
                couponCode: couponDetails ? couponCode : null
            });

            if (response.data.success) {
                // Check if it was an instant success (100% discount)
                if (response.data.data.instantSuccess) {
                    setWallet(prev => ({
                        ...prev,
                        balance: response.data.data.newBalance
                    }));
                    toast.success(response.data.message || `Successfully added ₹${amount}`);
                    setAmount('');
                    setCouponCode('');
                    setCouponDetails(null);
                    setPaymentStep('input');
                    setShowFullQr(false);
                    fetchWalletData();
                } else {
                    setPaymentOrder(response.data.data);
                    setPaymentStep('confirm');
                    setShowFullQr(true);
                }
            }
        } catch (error) {
            console.error('Payment initiation failed:', error);
            toast.error(error.response?.data?.message || 'Failed to initiate payment');
        } finally {
            setProcessing(false);
        }
    };

    const handleVerifyPayment = async () => {
        try {
            setProcessing(true);
            const response = await api.post('/wallet/topup/verify', {
                orderId: paymentOrder.orderId,
                paymentId: `pay_${Date.now()}`, // Mock payment ID
                signature: 'mock_signature',
                amount: parseInt(amount), // Original amount to credit
                couponCode: couponDetails ? couponCode : null
            });

            if (response.data.success) {
                setWallet(prev => ({
                    ...prev,
                    balance: response.data.data.newBalance
                }));
                toast.success(`Successfully added ₹${amount}`);
                setAmount('');
                setCouponCode('');
                setCouponDetails(null);
                setPaymentStep('input');
                setShowFullQr(false);
                fetchWalletData();
            }
        } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error(error.response?.data?.message || 'Payment verification failed. Please contact support.');
        } finally {
            setProcessing(false);
        }
    };

    // Notify admin about manual payment
    const handleNotifyAdmin = async () => {
        if (!amount || parseInt(amount) < 50) {
            toast.error('Please enter a valid amount (min ₹50)');
            return;
        }
        if (!utrNumber.trim()) {
            toast.error('Please enter UTR/Transaction ID');
            return;
        }

        try {
            setSendingNotification(true);
            const response = await api.post('/wallet/notify-payment', {
                amount: parseInt(amount),
                utrNumber: utrNumber.trim(),
                orderId: paymentOrder?.orderId || `manual_${Date.now()}`,
                couponCode: couponDetails ? couponCode : null
            });

            if (response.data.success) {
                toast.success('Payment notification sent! Admin will verify and credit your wallet within 24 hours.');
                setAmount('');
                setUtrNumber('');
                setCouponCode('');
                setCouponDetails(null);
                setPaymentStep('input');
                setShowFullQr(false);
                setPaymentOrder(null);
            }
        } catch (error) {
            console.error('Failed to send notification:', error);
            toast.error(error.response?.data?.message || 'Failed to send notification. Please try again.');
        } finally {
            setSendingNotification(false);
        }
    };

    const handleWithdrawRequest = async (e) => {
        e.preventDefault();
        const withdrawAmt = parseInt(withdrawAmount);

        if (!withdrawAmount || isNaN(withdrawAmt) || withdrawAmt < 100) {
            alert('Minimum withdrawal amount is ₹100');
            return;
        }

        if (withdrawAmt > (wallet?.balance || 0)) {
            alert('Insufficient balance');
            return;
        }

        if (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountHolderName) {
            alert('Please fill all bank details');
            return;
        }

        try {
            setProcessing(true);
            // For now, simulate withdrawal request
            // In production, this would call a real withdrawal API
            alert(`Withdrawal request for ₹${withdrawAmt} submitted successfully! Amount will be credited to your bank account within 3-5 business days.`);
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            setBankDetails({ accountNumber: '', ifscCode: '', accountHolderName: '' });
        } catch (error) {
            console.error('Withdrawal failed:', error);
            alert('Withdrawal request failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <Loader />;

    // Mentor Wallet View
    if (isMentor) {
        return (
            <div className="min-h-screen bg-[#020617] pt-8 pb-20">
                <div className="container mx-auto px-4 max-w-6xl">
                    <header className="mb-8">
                        <h1 className="text-3xl font-black text-white flex items-center gap-3">
                            <Wallet className="w-8 h-8 text-emerald-500" />
                            Mentor Earnings
                        </h1>
                        <p className="text-slate-400 mt-2">Track your earnings and withdraw to your bank account</p>
                    </header>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column: Balance & Withdraw */}
                        <div className="space-y-6">
                            {/* Earnings Balance Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-8 border border-indigo-500/30 relative overflow-hidden"
                            >
                                <div className="relative z-10">
                                    <p className="text-indigo-400 font-bold mb-1 flex items-center gap-2">
                                        <Banknote className="w-4 h-4" />
                                        Total Earnings
                                    </p>
                                    <h2 className="text-5xl font-black text-white mb-2 tracking-tight">
                                        ₹{wallet?.balance || 0}
                                    </h2>
                                    <p className="text-indigo-300/60 text-sm mb-6">Available for withdrawal</p>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => setShowWithdrawModal(true)}
                                            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <ArrowDownLeft className="w-5 h-5" />
                                            Withdraw to Bank
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute top-[-50%] right-[-20%] w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[80px]" />
                            </motion.div>

                            {/* Earnings Stats */}
                            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                                    Earnings Summary
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                                        <span className="text-slate-400">This Month</span>
                                        <span className="text-emerald-400 font-bold">₹{wallet?.balance || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                                        <span className="text-slate-400">Pending Withdrawal</span>
                                        <span className="text-amber-400 font-bold">₹0</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                                        <span className="text-slate-400">Total Withdrawn</span>
                                        <span className="text-slate-300 font-bold">₹0</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Transaction History */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
                                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <History className="w-5 h-5 text-violet-400" />
                                        Earnings History
                                    </h3>
                                    <button className="text-sm text-cyan-400 hover:text-cyan-300 font-bold">
                                        View All
                                    </button>
                                </div>

                                <div className="divide-y divide-white/5">
                                    {transactions.length === 0 ? (
                                        <div className="p-12 text-center text-slate-500">
                                            <Banknote className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>No earnings yet. Start resolving doubts to earn!</p>
                                        </div>
                                    ) : transactions.map((tx) => {
                                        const isCredit = isCreditTransaction(tx.type) || tx.amount > 0;
                                        return (
                                            <div key={tx._id} className="p-5 hover:bg-white/5 transition-colors flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCredit
                                                        ? 'bg-emerald-500/10 text-emerald-400'
                                                        : 'bg-amber-500/10 text-amber-400'
                                                        }`}>
                                                        {isCredit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-bold text-sm">
                                                            {tx.description || (isCredit ? 'Doubt Resolution Earning' : 'Withdrawal')}
                                                        </h4>
                                                        <p className="text-slate-500 text-xs mt-1">
                                                            {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-black text-lg ${isCredit ? 'text-emerald-400' : 'text-amber-400'
                                                        }`}>
                                                        {isCredit ? '+' : '-'} ₹{Math.abs(tx.amount)}
                                                    </p>
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${tx.status === 'completed'
                                                        ? 'bg-emerald-500/10 text-emerald-500'
                                                        : 'bg-amber-500/10 text-amber-500'
                                                        }`}>
                                                        {tx.status}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Info Banner for Mentors */}
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 relative overflow-hidden">
                                <div className="relative z-10 max-w-lg">
                                    <h3 className="text-2xl font-black text-white mb-2">💰 Withdrawal Info</h3>
                                    <ul className="text-indigo-100 space-y-2 text-sm">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Minimum withdrawal: ₹100
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Processing time: 3-5 business days
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4" />
                                            Direct bank transfer (IMPS/NEFT)
                                        </li>
                                    </ul>
                                </div>
                                <div className="absolute right-[-10%] bottom-[-40%] w-[300px] h-[300px] bg-white/10 rounded-full blur-[60px]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Withdrawal Modal */}
                {showWithdrawModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-white/10"
                        >
                            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                                <Building2 className="w-6 h-6 text-emerald-400" />
                                Withdraw to Bank
                            </h3>

                            <form onSubmit={handleWithdrawRequest}>
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-slate-400 text-sm font-bold mb-2">Withdrawal Amount (₹)</label>
                                        <input
                                            type="number"
                                            value={withdrawAmount}
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                                            min="100"
                                            max={wallet?.balance || 0}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Available: ₹{wallet?.balance || 0} | Min: ₹100</p>
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 text-sm font-bold mb-2">Account Holder Name</label>
                                        <input
                                            type="text"
                                            value={bankDetails.accountHolderName}
                                            onChange={(e) => setBankDetails(prev => ({ ...prev, accountHolderName: e.target.value }))}
                                            placeholder="As per bank records"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 text-sm font-bold mb-2">Bank Account Number</label>
                                        <input
                                            type="text"
                                            value={bankDetails.accountNumber}
                                            onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                                            placeholder="Enter account number"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 text-sm font-bold mb-2">IFSC Code</label>
                                        <input
                                            type="text"
                                            value={bankDetails.ifscCode}
                                            onChange={(e) => setBankDetails(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
                                            placeholder="e.g., SBIN0001234"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white uppercase focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowWithdrawModal(false)}
                                        className="flex-1 py-4 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition-all"
                                    >
                                        {processing ? 'Processing...' : 'Confirm Withdrawal'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </div>
        );
    }

    // Student Wallet View (original)
    return (
        <div className="min-h-screen bg-[#020617] pt-8 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                <header className="mb-8">
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-emerald-500" />
                        My Wallet
                    </h1>
                    <p className="text-slate-400 mt-2">Manage your funds and transactions securely</p>
                </header>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Balance & Topup */}
                    <div className="space-y-6">
                        {/* Balance Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-900 rounded-3xl p-8 border border-emerald-500/30 relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <p className="text-emerald-400 font-bold mb-1 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    Available Balance
                                </p>
                                <h2 className="text-5xl font-black text-white mb-6 tracking-tight">
                                    ₹{wallet?.balance || 0}
                                </h2>
                                <div className="flex items-center gap-4 text-xs font-mono text-emerald-600/60 uppercase">
                                    <span>Secure Encrypted</span>
                                    <span>•</span>
                                    <span>Instant Top-up</span>
                                </div>
                            </div>
                            {/* Decorative glow */}
                            <div className="absolute top-[-50%] right-[-20%] w-[300px] h-[300px] bg-emerald-500/20 rounded-full blur-[80px]" />
                        </motion.div>

                        {/* Add Funds Section */}
                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-cyan-400" />
                                Add Funds
                            </h3>

                            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                {paymentStep === 'input' ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => setShowFullQr(true)}
                                                className="w-full text-xs flex items-center justify-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-400/10 px-4 py-3 rounded-xl border border-emerald-400/20 transition-all hover:bg-emerald-400/20"
                                            >
                                                <Maximize2 className="w-4 h-4" />
                                                Scan QR to Pay
                                            </button>
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 text-sm font-bold mb-2">Enter Amount</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => {
                                                        setAmount(e.target.value);
                                                        setCouponDetails(null); // Reset coupon on amount change
                                                    }}
                                                    placeholder="500"
                                                    min="50"
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white font-bold focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                                                />
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">Min deposit: ₹50</p>
                                        </div>

                                        <div>
                                            <label className="block text-slate-400 text-sm font-bold mb-2">Coupon Code</label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        value={couponCode}
                                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                        placeholder="PROMO10"
                                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white font-mono uppercase focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleApplyCoupon}
                                                    disabled={isValidatingCoupon || !couponCode}
                                                    className="px-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                                                >
                                                    {isValidatingCoupon ? '...' : 'Apply'}
                                                </button>
                                            </div>
                                            {couponDetails && (
                                                <div className="mt-2 text-sm flex items-center justify-between text-emerald-400 bg-emerald-500/10 p-2 rounded-lg">
                                                    <span>🎉 Code Applied!</span>
                                                    <span className="font-bold">-₹{couponDetails.discount}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-white/5">
                                            <div className="flex justify-between items-center mb-4 text-sm">
                                                <span className="text-slate-400">Payable Amount</span>
                                                <span className="text-xl font-black text-white">
                                                    ₹{couponDetails ? couponDetails.finalAmount : (amount || 0)}
                                                </span>
                                            </div>
                                            <button
                                                onClick={handleInitiatePayment}
                                                disabled={processing || !amount || amount < 50}
                                                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                {processing ? (
                                                    <span className="animate-spin group-hover:block">⚪</span>
                                                ) : (
                                                    <>
                                                        <TrendingUp className="w-5 h-5" />
                                                        Add Money
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="bg-white p-2 rounded-xl inline-block mb-4 cursor-pointer" onClick={() => setShowFullQr(true)}>
                                            <img
                                                src="/assets/payment-qr.png"
                                                alt="Payment QR Code"
                                                className="w-40 h-40 object-contain"
                                            />
                                        </div>
                                        <h4 className="text-lg font-bold text-white mb-1">Scan to Pay</h4>
                                        <div className="text-2xl font-black text-emerald-400 mb-4">
                                            ₹{paymentOrder?.amount / 100}
                                        </div>
                                        <p className="text-slate-400 text-xs mb-4">
                                            Scan using any UPI app.
                                        </p>

                                        <button
                                            onClick={handleVerifyPayment}
                                            disabled={processing}
                                            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {processing ? 'Verifying...' : 'I Have Paid'}
                                        </button>
                                        <button
                                            onClick={() => setPaymentStep('input')}
                                            className="mt-3 text-slate-500 hover:text-white text-xs underline"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Transaction History */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <History className="w-5 h-5 text-violet-400" />
                                    Transaction History
                                </h3>
                                <button
                                    className="text-sm text-cyan-400 hover:text-cyan-300 font-bold"
                                    onClick={() => setShowHistoryModal(true)}
                                >
                                    View All
                                </button>
                            </div>

                            <div className="divide-y divide-white/5">
                                {transactions.length === 0 ? (
                                    <div className="p-12 text-center text-slate-500">
                                        No recent transactions found.
                                    </div>
                                ) : transactions.map((tx) => {
                                    const isCredit = isCreditTransaction(tx.type) || tx.amount > 0;
                                    return (
                                        <div key={tx._id} className="p-5 hover:bg-white/5 transition-colors flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCredit
                                                    ? 'bg-emerald-500/10 text-emerald-400'
                                                    : 'bg-rose-500/10 text-rose-400'
                                                    }`}>
                                                    {isCredit ? <ArrowUpRight className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold text-sm">
                                                        {tx.description || (isCredit ? 'Wallet Top-up' : 'Service Payment')}
                                                    </h4>
                                                    <p className="text-slate-500 text-xs mt-1">
                                                        {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-black text-lg ${isCredit ? 'text-emerald-400' : 'text-rose-400'
                                                    }`}>
                                                    {isCredit ? '+' : '-'} ₹{Math.abs(tx.amount)}
                                                </p>
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${tx.status === 'completed'
                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                    : 'bg-amber-500/10 text-amber-500'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Promo Banner */}
                        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 relative overflow-hidden">
                            <div className="relative z-10 max-w-lg">
                                <h3 className="text-2xl font-black text-white mb-2">Get 10% Extra Credits</h3>
                                <p className="text-violet-100 mb-6">Top up with ₹2000 or more and get a 10% bonus added to your wallet instantly.</p>
                                <button className="px-6 py-3 bg-white text-violet-700 font-bold rounded-xl hover:bg-violet-50 transition-colors">
                                    Add ₹2000 Now
                                </button>
                            </div>
                            <div className="absolute right-[-10%] bottom-[-40%] w-[300px] h-[300px] bg-white/10 rounded-full blur-[60px]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Screen QR Modal */}
            <AnimatePresence>
                {showFullQr && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowFullQr(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white p-6 rounded-3xl max-w-lg w-full relative max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowFullQr(false)}
                                className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <h3 className="text-xl font-bold text-center mb-4 text-gray-900">Scan to Pay</h3>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col items-center justify-center">
                                <img
                                    src="/assets/payment-qr.png"
                                    alt="Payment QR Code"
                                    className="w-64 h-64 object-contain"
                                />
                                {paymentOrder && (
                                    <div className="mt-4 text-center">
                                        <p className="text-gray-500 text-sm">Payable Amount</p>
                                        <p className="text-3xl font-bold text-emerald-600">₹{paymentOrder.amount / 100}</p>
                                    </div>
                                )}
                            </div>

                            <p className="text-center text-gray-500 mt-4 text-sm">Scan with any UPI app and complete payment</p>

                            {/* Amount and UTR Input for Manual Verification */}
                            <div className="mt-4 space-y-3">
                                <div>
                                    <label className="block text-gray-600 text-sm font-medium mb-1">
                                        Amount Paid (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Enter amount you paid"
                                        min="50"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-800 font-bold focus:outline-none focus:border-emerald-500 placeholder-gray-400"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Min: ₹50</p>
                                </div>
                                <div>
                                    <label className="block text-gray-600 text-sm font-medium mb-1">
                                        UTR / Transaction ID <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={utrNumber}
                                        onChange={(e) => setUtrNumber(e.target.value)}
                                        placeholder="Enter UPI transaction ID"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-800 font-mono focus:outline-none focus:border-emerald-500 placeholder-gray-400"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Find this in your payment app's transaction history</p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-4">
                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-sm space-y-2 text-left">
                                    <h4 className="font-bold text-blue-900 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        Important Instructions:
                                    </h4>
                                    <ul className="list-disc list-inside text-blue-800 space-y-1 ml-1">
                                        <li>Please verify the account holder name: <strong>Rahul Kumar</strong></li>
                                        <li>Add your <strong>registered email ID</strong> in the payment note/remarks.</li>
                                        <li>Take a screenshot of the payment for your records.</li>
                                    </ul>
                                </div>

                                <div className="space-y-2">
                                    <button
                                        onClick={handleNotifyAdmin}
                                        disabled={sendingNotification || !utrNumber.trim() || !amount || parseInt(amount) < 50}
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {sendingNotification ? (
                                            <>
                                                <span className="animate-spin">⏳</span>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-5 h-5" />
                                                Notify Admin - I Have Paid
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center text-gray-400 text-xs">
                                        Admin will verify payment and credit your wallet within 24 hours
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Transaction History Modal */}
            <TransactionHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
            />
        </div>
    );
};

export default WalletPage;
