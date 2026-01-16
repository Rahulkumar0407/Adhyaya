import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Settings as SettingsIcon,
    Shield,
    Bell,
    Globe,
    Database,
    Zap,
    Save,
    RefreshCw,
    AlertTriangle,
    Coins,
    Server,
    Check
} from 'lucide-react';
import GlassCard from '../../components/admin/GlassCard';
import NeonButton from '../../components/admin/NeonButton';
import { toast } from 'react-hot-toast';
import { getSystemConfig, toggleMaintenanceMode, updateUsageLimits, creditAllUsers } from '../../services/adminService';

const AdminSettings = () => {
    // System Config State
    const [maintenance, setMaintenance] = useState({ enabled: false, message: '' });
    const [limits, setLimits] = useState({
        mockInterview: { max: 100 },
        quiz: { max: 500 },
        adaptiveRevision: { max: 200 }
    });

    // Global Credit State
    const [creditAmount, setCreditAmount] = useState('');
    const [creditReason, setCreditReason] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isCrediting, setIsCrediting] = useState(false);

    // Fetch Config on Mount
    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const data = await getSystemConfig();
            if (data.success && data.config) {
                setMaintenance(data.config.maintenance || { enabled: false, message: '' });
                if (data.config.limits) {
                    setLimits({
                        mockInterview: { max: data.config.limits.mockInterview?.max || 100 },
                        quiz: { max: data.config.limits.quiz?.max || 500 },
                        adaptiveRevision: { max: data.config.limits.adaptiveRevision?.max || 200 }
                    });
                }
            }
        } catch (error) {
            toast.error('Failed to load system config');
        } finally {
            setIsLoading(false);
        }
    };

    // Handlers
    const handleMaintenanceToggle = async (enabled) => {
        try {
            const data = await toggleMaintenanceMode(enabled, maintenance.message);
            if (data.success) {
                setMaintenance(data.config);
                toast.success(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
            }
        } catch (error) {
            toast.error('Failed to update maintenance mode');
        }
    };

    const handleMaintenanceMessageChange = (e) => {
        setMaintenance({ ...maintenance, message: e.target.value });
    };

    const handleSaveLimits = async () => {
        setIsSaving(true);
        try {
            await updateUsageLimits(limits);
            toast.success('Usage limits updated successfully');
        } catch (error) {
            toast.error('Failed to update limits');
        } finally {
            setIsSaving(false);
        }
    };

    const handleGlobalCredit = async () => {
        if (!creditAmount || isNaN(creditAmount) || Number(creditAmount) <= 0) {
            return toast.error('Please enter a valid amount');
        }
        if (!window.confirm(`Are you sure you want to credit ${creditAmount} points to ALL active users? This cannot be undone.`)) {
            return;
        }

        setIsCrediting(true);
        try {
            const data = await creditAllUsers(Number(creditAmount), creditReason);
            if (data.success) {
                toast.success(data.message);
                setCreditAmount('');
                setCreditReason('');
            }
        } catch (error) {
            toast.error('Failed to process global credit');
        } finally {
            setIsCrediting(false);
        }
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

    const ToggleSwitch = ({ enabled, onChange, label, description }) => (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-white font-medium">{label}</p>
                {description && <p className="text-sm text-gray-500">{description}</p>}
            </div>
            <button
                onClick={() => onChange(!enabled)}
                className={`relative w-14 h-7 rounded-full transition-colors ${enabled ? 'bg-cyan-500' : 'bg-gray-700'
                    }`}
            >
                <div
                    className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${enabled ? 'left-8' : 'left-1'
                        }`}
                />
            </button>
        </div>
    );

    if (isLoading) return <div className="text-white">Loading settings...</div>;

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
                    <h2 className="text-xl font-bold text-white">System Operations</h2>
                    <p className="text-gray-500">Manage global system configurations and limits</p>
                </div>
                <div className="flex gap-3">
                    <NeonButton variant="ghost" onClick={fetchConfig} icon={RefreshCw}>
                        Refresh
                    </NeonButton>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Maintenance Mode */}
                <motion.div variants={itemVariants}>
                    <GlassCard neonColor="red" padding="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <h3 className="text-lg font-semibold text-white">Emergency Control</h3>
                        </div>

                        <div className="space-y-4">
                            <ToggleSwitch
                                enabled={maintenance.enabled}
                                onChange={handleMaintenanceToggle}
                                label="Maintenance Mode"
                                description="Restrict access to admins only. Shows maintenance screen to users."
                            />

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Maintenance Message</label>
                                <textarea
                                    value={maintenance.message}
                                    onChange={handleMaintenanceMessageChange}
                                    onBlur={() => handleMaintenanceToggle(maintenance.enabled)} // Auto-save message on blur
                                    placeholder="We are currently under maintenance..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none focus:border-red-500 resize-none"
                                />
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Global Limits */}
                <motion.div variants={itemVariants}>
                    <GlassCard neonColor="purple" padding="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-purple-400" />
                                <h3 className="text-lg font-semibold text-white">Daily Usage Limits (Global)</h3>
                            </div>
                            <NeonButton size="sm" onClick={handleSaveLimits} loading={isSaving}>
                                Update Limits
                            </NeonButton>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Mock Interviews / Day</label>
                                <input
                                    type="number"
                                    value={limits.mockInterview.max}
                                    onChange={(e) => setLimits({ ...limits, mockInterview: { max: parseInt(e.target.value) } })}
                                    className="w-full px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Quiz Generations / Day</label>
                                <input
                                    type="number"
                                    value={limits.quiz.max}
                                    onChange={(e) => setLimits({ ...limits, quiz: { max: parseInt(e.target.value) } })}
                                    className="w-full px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Adaptive Revisions / Day</label>
                                <input
                                    type="number"
                                    value={limits.adaptiveRevision.max}
                                    onChange={(e) => setLimits({ ...limits, adaptiveRevision: { max: parseInt(e.target.value) } })}
                                    className="w-full px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none focus:border-purple-500"
                                />
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Global Credit - "Make it Rain" */}
                <motion.div variants={itemVariants} className="md:col-span-2">
                    <GlassCard neonColor="green" padding="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Coins className="w-5 h-5 text-green-400" />
                            <h3 className="text-lg font-semibold text-white">Global Credit Distribution</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Amount (Points/Rupees)</label>
                                <input
                                    type="number"
                                    value={creditAmount}
                                    onChange={(e) => setCreditAmount(e.target.value)}
                                    placeholder="e.g. 100"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none focus:border-green-500"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm text-gray-400 mb-2">Reason</label>
                                <input
                                    type="text"
                                    value={creditReason}
                                    onChange={(e) => setCreditReason(e.target.value)}
                                    placeholder="e.g. Festival Bonus"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none focus:border-green-500"
                                />
                            </div>
                            <NeonButton
                                variant="success"
                                icon={Coins}
                                onClick={handleGlobalCredit}
                                loading={isCrediting}
                                fullWidth
                            >
                                Credit All Users
                            </NeonButton>
                        </div>
                        <p className="mt-4 text-sm text-gray-500">
                            * This operation will add wallet balance to <strong>ALL active users</strong>. Use with caution.
                        </p>
                    </GlassCard>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AdminSettings;
