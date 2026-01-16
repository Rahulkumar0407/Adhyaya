import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Gift,
    Plus,
    Copy,
    Trash2,
    Calendar,
    Percent,
    DollarSign,
    Users,
    CheckCircle,
    XCircle,
    Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCoupons, createCoupon, deleteCoupon } from '../../services/adminService';
import GlassCard from '../../components/admin/GlassCard';
import NeonButton from '../../components/admin/NeonButton';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const CouponGenerator = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: 10,
        maxUses: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
    });
    const queryClient = useQueryClient();

    // Fetch coupons
    const { data: couponsData, isLoading } = useQuery({
        queryKey: ['admin-coupons'],
        queryFn: getCoupons,
    });

    // Create coupon mutation
    const createMutation = useMutation({
        mutationFn: createCoupon,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-coupons']);
            toast.success('Coupon created successfully!');
            setShowCreateModal(false);
            setNewCoupon({
                code: '',
                discountType: 'percentage',
                discountValue: 10,
                maxUses: '',
                validFrom: new Date().toISOString().split('T')[0],
                validUntil: '',
            });
        },
        onError: () => {
            toast.error('Failed to create coupon');
        },
    });

    // Delete coupon mutation
    const deleteMutation = useMutation({
        mutationFn: deleteCoupon,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-coupons']);
            toast.success('Coupon deleted');
        },
        onError: () => {
            toast.error('Failed to delete coupon');
        },
    });

    const coupons = couponsData?.coupons || [];

    // Generate random code
    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = 'ADHYAYA';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewCoupon({ ...newCoupon, code });
    };

    // Copy code to clipboard
    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success('Code copied to clipboard!');
    };

    const handleCreate = () => {
        if (!newCoupon.code) {
            toast.error('Please enter a coupon code');
            return;
        }
        if (!newCoupon.validUntil) {
            toast.error('Please set an expiry date');
            return;
        }

        // Map frontend fields to backend schema
        const couponData = {
            ...newCoupon,
            validTo: newCoupon.validUntil,
            usageLimit: newCoupon.maxUses ? parseInt(newCoupon.maxUses) : null
        };

        createMutation.mutate(couponData);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    // Safe date formatter
    const safelyFormatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        try {
            return format(date, 'MMM d, yyyy');
        } catch (e) {
            return 'Invalid Date';
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">Discount Coupons</h2>
                    <p className="text-gray-500">Create and manage promotional codes</p>
                </div>
                <NeonButton
                    variant="primary"
                    icon={Plus}
                    onClick={() => setShowCreateModal(true)}
                >
                    Create Coupon
                </NeonButton>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Coupons', value: coupons.length, icon: Gift, color: 'cyan' },
                    { label: 'Active', value: coupons.filter((c) => c.isActive).length, icon: CheckCircle, color: 'green' },
                    {
                        label: 'Expired',
                        value: coupons.filter((c) => {
                            if (!c.validUntil) return false;
                            const date = new Date(c.validUntil);
                            return !isNaN(date.getTime()) && date < new Date();
                        }).length,
                        icon: XCircle,
                        color: 'red'
                    },
                    { label: 'Total Uses', value: coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0), icon: Users, color: 'purple' },
                ].map((stat) => (
                    <motion.div key={stat.label} variants={itemVariants}>
                        <GlassCard neonColor={stat.color} padding="p-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl bg-${stat.color}-500/10`}>
                                    <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    <p className="text-xs text-gray-500">{stat.label}</p>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* Coupons List */}
            <motion.div variants={itemVariants}>
                <GlassCard neonColor="cyan" padding="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-cyan-500/10">
                                    <th className="text-left p-4 text-sm font-medium text-gray-400">Code</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-400">Discount</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-400">Usage</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-400">Valid Period</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                                    <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center">
                                            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                ) : coupons.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center">
                                            <Gift className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                            <p className="text-gray-500">No coupons created yet</p>
                                            <NeonButton
                                                variant="primary"
                                                size="sm"
                                                icon={Plus}
                                                className="mt-4"
                                                onClick={() => setShowCreateModal(true)}
                                            >
                                                Create First Coupon
                                            </NeonButton>
                                        </td>
                                    </tr>
                                ) : (
                                    coupons.map((coupon) => {
                                        const validUntilDate = new Date(coupon.validUntil);
                                        const isExpired = !isNaN(validUntilDate.getTime()) && validUntilDate < new Date();
                                        const isActive = coupon.isActive && !isExpired;

                                        return (
                                            <tr
                                                key={coupon._id}
                                                className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors"
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <code className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono text-sm">
                                                            {coupon.code}
                                                        </code>
                                                        <button
                                                            onClick={() => copyCode(coupon.code)}
                                                            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700/50 transition-colors"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        {coupon.discountType === 'percentage' ? (
                                                            <>
                                                                <Percent className="w-4 h-4 text-green-400" />
                                                                <span className="text-white">{coupon.discountValue}%</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <DollarSign className="w-4 h-4 text-green-400" />
                                                                <span className="text-white">₹{coupon.discountValue}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-white">{coupon.usedCount || 0}</span>
                                                    {coupon.maxUses && (
                                                        <span className="text-gray-500"> / {coupon.maxUses}</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm">
                                                        <p className="text-white">
                                                            {safelyFormatDate(coupon.validFrom)}
                                                        </p>
                                                        <p className="text-gray-500">
                                                            to {safelyFormatDate(coupon.validUntil)}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${isActive
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : isExpired
                                                                ? 'bg-red-500/20 text-red-400'
                                                                : 'bg-gray-500/20 text-gray-400'
                                                            }`}
                                                    >
                                                        {isExpired ? 'Expired' : isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end">
                                                        <button
                                                            onClick={() => deleteMutation.mutate(coupon._id)}
                                                            disabled={deleteMutation.isLoading}
                                                            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Create Coupon Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-lg rounded-2xl overflow-hidden"
                            style={{
                                background: 'rgba(15, 15, 25, 0.95)',
                                border: '1px solid rgba(0, 240, 255, 0.2)',
                            }}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-cyan-500/10">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Gift className="w-6 h-6 text-cyan-400" />
                                    Create New Coupon
                                </h2>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                {/* Coupon Code */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Coupon Code</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newCoupon.code}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                            placeholder="ADHYAYA2024"
                                            className="flex-1 px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white 
                        outline-none focus:border-cyan-500 font-mono uppercase"
                                        />
                                        <NeonButton variant="secondary" onClick={generateCode}>
                                            Generate
                                        </NeonButton>
                                    </div>
                                </div>

                                {/* Discount Type & Value */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Discount Type</label>
                                        <select
                                            value={newCoupon.discountType}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none"
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount (₹)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Discount Value</label>
                                        <input
                                            type="number"
                                            value={newCoupon.discountValue}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Max Uses */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Max Uses (Optional)</label>
                                    <input
                                        type="number"
                                        value={newCoupon.maxUses}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
                                        placeholder="Unlimited"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none"
                                    />
                                </div>

                                {/* Valid Period */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Valid From</label>
                                        <input
                                            type="date"
                                            value={newCoupon.validFrom}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, validFrom: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Valid Until</label>
                                        <input
                                            type="date"
                                            value={newCoupon.validUntil}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, validUntil: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-cyan-500/10 flex gap-3">
                                <NeonButton variant="ghost" fullWidth onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </NeonButton>
                                <NeonButton
                                    variant="primary"
                                    fullWidth
                                    onClick={handleCreate}
                                    loading={createMutation.isLoading}
                                >
                                    Create Coupon
                                </NeonButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CouponGenerator;
