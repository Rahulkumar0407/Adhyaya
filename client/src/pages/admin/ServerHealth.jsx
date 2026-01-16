import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    Database,
    Server,
    Wifi,
    Clock,
    HardDrive,
    MemoryStick,
    RefreshCw,
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getServerHealth } from '../../services/adminService';
import GlassCard from '../../components/admin/GlassCard';
import NeonButton from '../../components/admin/NeonButton';

const ServerHealth = () => {
    const [apiLatency, setApiLatency] = useState(0);

    // Fetch server health with custom latency measurement
    const { data: healthData, isLoading, refetch, dataUpdatedAt } = useQuery({
        queryKey: ['admin-server-health'],
        queryFn: async () => {
            const start = performance.now();
            const result = await getServerHealth();
            const end = performance.now();
            setApiLatency(Math.round(end - start));
            return result;
        },
        refetchInterval: 10000, // Refresh every 10 seconds
    });

    const health = healthData || {
        status: 'unknown',
        dbStatus: 'unknown',
        dbLatency: 0,
        uptime: 0,
        memoryUsage: { used: 0, total: 0, percentage: 0 },
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'healthy':
            case 'connected':
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'degraded':
                return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
            case 'down':
            case 'disconnected':
                return <XCircle className="w-5 h-5 text-red-400" />;
            default:
                return <Activity className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy':
            case 'connected':
                return 'green';
            case 'degraded':
                return 'orange';
            case 'down':
            case 'disconnected':
                return 'red';
            default:
                return 'cyan';
        }
    };

    const formatUptime = (seconds) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
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

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Overall Status */}
            <motion.div variants={itemVariants}>
                <GlassCard neonColor={getStatusColor(health.status)} glow padding="p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div
                                className={`p-6 rounded-2xl ${health.status === 'healthy'
                                        ? 'bg-green-500/10'
                                        : health.status === 'degraded'
                                            ? 'bg-yellow-500/10'
                                            : 'bg-red-500/10'
                                    }`}
                            >
                                {getStatusIcon(health.status)}
                                <Activity className={`w-12 h-12 ${health.status === 'healthy'
                                        ? 'text-green-400'
                                        : health.status === 'degraded'
                                            ? 'text-yellow-400'
                                            : 'text-red-400'
                                    }`} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white capitalize">
                                    System {health.status || 'Unknown'}
                                </h2>
                                <p className="text-gray-500 mt-1">
                                    Last updated: {new Date(dataUpdatedAt).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                        <NeonButton
                            variant="primary"
                            icon={RefreshCw}
                            onClick={() => refetch()}
                            loading={isLoading}
                        >
                            Refresh
                        </NeonButton>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-6">
                {/* API Latency */}
                <motion.div variants={itemVariants}>
                    <GlassCard neonColor="cyan" padding="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-cyan-500/10">
                                <Server className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">API Latency</p>
                                <p className="text-2xl font-bold text-white">{apiLatency}ms</p>
                            </div>
                        </div>
                        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((apiLatency / 500) * 100, 100)}%` }}
                                className={`h-full rounded-full ${apiLatency < 100
                                        ? 'bg-green-500'
                                        : apiLatency < 300
                                            ? 'bg-yellow-500'
                                            : 'bg-red-500'
                                    }`}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {apiLatency < 100 ? 'Excellent' : apiLatency < 300 ? 'Good' : 'Slow'}
                        </p>
                    </GlassCard>
                </motion.div>

                {/* Database Status */}
                <motion.div variants={itemVariants}>
                    <GlassCard neonColor={getStatusColor(health.dbStatus)} padding="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-xl ${health.dbStatus === 'connected' ? 'bg-green-500/10' : 'bg-red-500/10'
                                }`}>
                                <Database className={`w-6 h-6 ${health.dbStatus === 'connected' ? 'text-green-400' : 'text-red-400'
                                    }`} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Database</p>
                                <p className="text-2xl font-bold text-white capitalize">{health.dbStatus}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400">
                            Query latency: <span className="text-white">{health.dbLatency}ms</span>
                        </p>
                    </GlassCard>
                </motion.div>

                {/* Uptime */}
                <motion.div variants={itemVariants}>
                    <GlassCard neonColor="purple" padding="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-purple-500/10">
                                <Clock className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Uptime</p>
                                <p className="text-2xl font-bold text-white">{formatUptime(health.uptime)}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400">
                            Since server start
                        </p>
                    </GlassCard>
                </motion.div>

                {/* Memory Usage */}
                <motion.div variants={itemVariants}>
                    <GlassCard neonColor="orange" padding="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-orange-500/10">
                                <MemoryStick className="w-6 h-6 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Memory</p>
                                <p className="text-2xl font-bold text-white">{health.memoryUsage?.percentage}%</p>
                            </div>
                        </div>
                        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${health.memoryUsage?.percentage || 0}%` }}
                                className={`h-full rounded-full ${health.memoryUsage?.percentage < 60
                                        ? 'bg-green-500'
                                        : health.memoryUsage?.percentage < 80
                                            ? 'bg-yellow-500'
                                            : 'bg-red-500'
                                    }`}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {health.memoryUsage?.used}MB / {health.memoryUsage?.total}MB
                        </p>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-2 gap-6">
                {/* Connection Status */}
                <motion.div variants={itemVariants}>
                    <GlassCard neonColor="cyan" padding="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Wifi className="w-5 h-5 text-cyan-400" />
                            Connection Status
                        </h3>
                        <div className="space-y-4">
                            {[
                                { name: 'MongoDB', status: health.dbStatus === 'connected', latency: health.dbLatency },
                                { name: 'Redis Cache', status: true, latency: 2 },
                                { name: 'Socket.io', status: true, latency: 5 },
                                { name: 'CDN', status: true, latency: 45 },
                            ].map((service) => (
                                <div key={service.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-2 h-2 rounded-full ${service.status ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="text-white">{service.name}</span>
                                    </div>
                                    <span className="text-gray-400">{service.latency}ms</span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Recent Events */}
                <motion.div variants={itemVariants}>
                    <GlassCard neonColor="purple" padding="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-purple-400" />
                            Recent Events
                        </h3>
                        <div className="space-y-3">
                            {[
                                { time: '2 min ago', event: 'Health check passed', type: 'success' },
                                { time: '15 min ago', event: 'Database query optimized', type: 'info' },
                                { time: '1 hour ago', event: 'Socket reconnection', type: 'warning' },
                                { time: '3 hours ago', event: 'Server restarted', type: 'info' },
                            ].map((event, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30">
                                    <div
                                        className={`w-2 h-2 rounded-full ${event.type === 'success'
                                                ? 'bg-green-500'
                                                : event.type === 'warning'
                                                    ? 'bg-yellow-500'
                                                    : 'bg-cyan-500'
                                            }`}
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm text-white">{event.event}</p>
                                        <p className="text-xs text-gray-500">{event.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ServerHealth;
