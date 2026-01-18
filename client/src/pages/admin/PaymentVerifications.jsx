import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle,
    XCircle,
    Search,
    AlertCircle,
    Clock,
    IndianRupee,
    User,
    Calendar,
    Copy,
    ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import GlassCard from '../../components/admin/GlassCard';

const PaymentVerifications = () => {
    const [filter, setFilter] = useState('');
    const queryClient = useQueryClient();

    // Fetch pending transactions
    const { data: transactionsData, isLoading } = useQuery({
        queryKey: ['admin-pending-transactions'],
        queryFn: async () => {
            const res = await api.get('/admin/transactions/pending');
            return res.data;
        },
        refetchInterval: 10000 // Refresh every 10 seconds
    });

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: async (transactionId) => {
            const res = await api.post(`/admin/transactions/${transactionId}/approve`);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Payment approved successfully');
            queryClient.invalidateQueries(['admin-pending-transactions']);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to approve payment');
        }
    });

    // Reject mutation
    const rejectMutation = useMutation({
        mutationFn: async (transactionId) => {
            const res = await api.post(`/admin/transactions/${transactionId}/reject`);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Payment rejected successfully');
            queryClient.invalidateQueries(['admin-pending-transactions']);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to reject payment');
        }
    });

    const handleApprove = (id) => {
        if (window.confirm('Are you sure you want to approve this payment? Funds will be added to user wallet.')) {
            approveMutation.mutate(id);
        }
    };

    const handleReject = (id) => {
        if (window.confirm('Are you sure you want to reject this payment?')) {
            rejectMutation.mutate(id);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const transactions = transactionsData?.transactions || [];
    const filteredTransactions = transactions.filter(tx =>
        tx.utrNumber.toLowerCase().includes(filter.toLowerCase()) ||
        tx.user?.name?.toLowerCase().includes(filter.toLowerCase()) ||
        tx.user?.email?.toLowerCase().includes(filter.toLowerCase())
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Payment Verifications</h1>
                    <p className="text-gray-400">Manage manual payment requests</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search UTR, Name..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 min-w-[300px]"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                </div>
            ) : filteredTransactions.length === 0 ? (
                <GlassCard className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="p-4 rounded-full bg-gray-800/50 mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">All Caught Up!</h3>
                    <p className="text-gray-400">No pending payment verifications found.</p>
                </GlassCard>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence>
                        {filteredTransactions.map((tx) => (
                            <motion.div
                                key={tx._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="group"
                            >
                                <GlassCard padding="p-0" className="overflow-hidden border-gray-800/50 hover:border-gray-700 transition-colors">
                                    <div className="p-6 flex items-start gap-6">
                                        <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                            <Clock className="w-6 h-6 text-orange-400" />
                                        </div>

                                        <div className="flex-1 min-w-0 grid grid-cols-2 lg:grid-cols-4 gap-6">
                                            {/* User Info */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                                    <User className="w-3 h-3" /> User
                                                </p>
                                                <p className="font-medium text-white truncate">{tx.user?.name || 'Unknown User'}</p>
                                                <p className="text-sm text-gray-500 truncate">{tx.user?.email}</p>
                                            </div>

                                            {/* Amount */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                                    <IndianRupee className="w-3 h-3" /> Amount
                                                </p>
                                                <p className="text-xl font-bold text-white">₹{tx.amount}</p>
                                                <p className="text-xs text-orange-400">Pending Verification</p>
                                            </div>

                                            {/* Transaction Details */}
                                            <div className="lg:col-span-2">
                                                <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                                    <Copy className="w-3 h-3" /> UTR / Transaction ID
                                                </p>
                                                <div className="flex items-center gap-2 group/copy cursor-pointer" onClick={() => copyToClipboard(tx.utrNumber)}>
                                                    <code className="font-mono text-sm text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded">
                                                        {tx.utrNumber}
                                                    </code>
                                                    <Copy className="w-3 h-3 text-gray-600 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {formatDate(tx.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 self-center">
                                            <button
                                                onClick={() => handleReject(tx._id)}
                                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                                                title="Reject Payment"
                                                disabled={rejectMutation.isLoading}
                                            >
                                                {rejectMutation.isLoading && rejectMutation.variables === tx._id ? (
                                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <XCircle className="w-5 h-5" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleApprove(tx._id)}
                                                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium flex items-center gap-2 shadow-lg shadow-green-500/20 transition-all hover:scale-105"
                                                disabled={approveMutation.isLoading}
                                            >
                                                {approveMutation.isLoading && approveMutation.variables === tx._id ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <CheckCircle className="w-4 h-4" />
                                                )}
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default PaymentVerifications;
