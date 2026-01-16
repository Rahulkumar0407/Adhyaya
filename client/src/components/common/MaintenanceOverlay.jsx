import { motion } from 'framer-motion';
import { Construction, Clock, RefreshCw } from 'lucide-react';

const MaintenanceOverlay = ({ message, onRefresh }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b0f14] text-white">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 max-w-lg w-full p-8 text-center"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="inline-block p-4 rounded-full bg-yellow-500/10 mb-6 border border-yellow-500/20"
                >
                    <Construction className="w-12 h-12 text-yellow-500" />
                </motion.div>

                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
                    System Maintenance
                </h1>

                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                    {message || "We are currently undergoing scheduled maintenance to improve your experience. We will be back shortly!"}
                </p>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-8">
                    <Clock className="w-4 h-4" />
                    <span>Estimated downtime: ~30 minutes</span>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRefresh}
                    className="px-6 py-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all flex items-center gap-2 mx-auto text-gray-300"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Status
                </motion.button>
            </motion.div>
        </div>
    );
};

export default MaintenanceOverlay;
