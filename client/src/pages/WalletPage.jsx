import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, CreditCard, History, TrendingUp, DollarSign, AlertCircle, ArrowUpRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const WalletPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [amount, setAmount] = useState('');
    const [processing, setProcessing] = useState(false);

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

    const handleAddFunds = async (e) => {
        e.preventDefault();
        if (!amount || isNaN(amount) || amount < 50) {
            alert('Please enter a valid amount (min ₹50)');
            return;
        }

        try {
            setProcessing(true);
            // Simulate Razorpay/Gateway flow for demo

            // 1. Create test order (in production this would generate Razorpay order)
            // Using the test endpoint for now as per wallet.js mock
            const response = await api.post('/wallet/topup/test', {
                amount: parseInt(amount)
            });

            if (response.data.success) {
                // Success animation/toast here
                setWallet(prev => ({
                    ...prev,
                    balance: response.data.data.newBalance
                }));
                setAmount('');
                alert(`Successfully added ₹${amount}`);
                fetchWalletData(); // Refresh history
            }
        } catch (error) {
            console.error('Payment failed:', error);
            alert('Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <Loader />;

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

                        {/* Add Funds Form */}
                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-cyan-400" />
                                Add Funds
                            </h3>
                            <form onSubmit={handleAddFunds}>
                                <div className="mb-4">
                                    <label className="block text-slate-400 text-sm font-bold mb-2">Amount (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">₹</span>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="500"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white font-bold text-lg focus:outline-none focus:border-cyan-500 placeholder-slate-600 transition-colors"
                                            min="50"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Minimum deposit amount is ₹50
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mb-6">
                                    {[100, 500, 1000].map(val => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setAmount(val.toString())}
                                            className="py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-all text-sm"
                                        >
                                            +₹{val}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing || !amount}
                                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-black rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {processing ? 'Processing...' : 'Proceed to Pay'}
                                    {!processing && <ArrowUpRight className="w-5 h-5" />}
                                </button>
                            </form>
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
                                <button className="text-sm text-cyan-400 hover:text-cyan-300 font-bold">
                                    View All
                                </button>
                            </div>

                            <div className="divide-y divide-white/5">
                                {transactions.length === 0 ? (
                                    <div className="p-12 text-center text-slate-500">
                                        No recent transactions found.
                                    </div>
                                ) : transactions.map((tx) => (
                                    <div key={tx._id} className="p-5 hover:bg-white/5 transition-colors flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tx.type === 'credit'
                                                    ? 'bg-emerald-500/10 text-emerald-400'
                                                    : 'bg-rose-500/10 text-rose-400'
                                                }`}>
                                                {tx.type === 'credit' ? <ArrowUpRight className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-sm">
                                                    {tx.description || (tx.type === 'credit' ? 'Wallet Top-up' : 'Service Payment')}
                                                </h4>
                                                <p className="text-slate-500 text-xs mt-1">
                                                    {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-black text-lg ${tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'
                                                }`}>
                                                {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount}
                                            </p>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${tx.status === 'completed'
                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                    : 'bg-amber-500/10 text-amber-500'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
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
        </div>
    );
};

export default WalletPage;
