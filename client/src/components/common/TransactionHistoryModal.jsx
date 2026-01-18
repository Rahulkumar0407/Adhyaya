import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, DollarSign, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import api from '../../services/api';

const TransactionHistoryModal = ({ isOpen, onClose }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10;

    useEffect(() => {
        if (isOpen) {
            fetchTransactions();
        }
    }, [isOpen, page]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/wallet/transactions?page=${page}&limit=${LIMIT}`);
            if (response.data.success) {
                setTransactions(response.data.data);
                if (response.data.pagination) {
                    setTotalPages(response.data.pagination.pages);
                }
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isCreditTransaction = (type) => ['topup', 'bonus', 'refund', 'withdrawal', 'completed'].includes(type) || type === 'manual';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-800/50">
                        <h2 className="text-xl font-bold text-white">Transaction History</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-[60vh] overflow-y-auto p-2">
                        {loading ? (
                            <div className="p-10 flex justify-center">
                                <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="p-10 text-center text-slate-500">
                                <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No transactions found</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {transactions.map((tx) => {
                                    const isCredit = tx.amount > 0; // || isCreditTransaction(tx.type);
                                    // Sometimes amount is negative for debits. 
                                    // In wallet.js: debit is negative (-amount). 
                                    // Let's rely on amount sign or type.

                                    return (
                                        <div key={tx._id} className="p-4 hover:bg-white/5 rounded-xl transition-colors flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                                    }`}>
                                                    {isCredit ? <ArrowUpRight className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-medium text-sm group-hover:text-emerald-400 transition-colors">
                                                        {tx.description}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                                                            {tx.type?.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-slate-500 text-xs">
                                                            {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold text-base ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {isCredit ? '+' : ''}₹{Math.abs(tx.amount)}
                                                </p>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${tx.status === 'completed' ? 'text-emerald-500' :
                                                        tx.status === 'pending' ? 'text-amber-500' :
                                                            'text-rose-500'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer / Pagination */}
                    <div className="p-4 border-t border-white/10 bg-slate-800/30 flex items-center justify-between">
                        <button
                            className="flex items-center gap-1 text-sm text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg hover:bg-white/5"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </button>

                        <span className="text-xs text-slate-500 font-mono">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            className="flex items-center gap-1 text-sm text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg hover:bg-white/5"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TransactionHistoryModal;
