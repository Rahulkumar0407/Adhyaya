import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, Clock, Target, AlertTriangle,
    ArrowRight, RotateCcw, X, Sparkles, Brain
} from 'lucide-react';

/**
 * Session Completion Modal
 * 
 * Shows reflective summary after focus session ends.
 * Design principles: Calm, minimal, no dopamine triggers.
 */

// Calm, reflective micro-copy messages
const completionMessages = {
    excellent: [
        "Excellent focus. You showed up for yourself today.",
        "Deep work done. That's all that matters.",
        "Solid session. Consistency beats intensity."
    ],
    good: [
        "Good session. Progress is progress.",
        "You stayed focused. That's worth celebrating quietly.",
        "One session closer to your goals."
    ],
    moderate: [
        "Some distractions, but you finished. That counts.",
        "Not perfect, but you showed up. That's half the battle.",
        "Focus takes practice. You're building the muscle."
    ],
    challenging: [
        "Tough session. Tomorrow is a new chance.",
        "Distractions happen. What matters is you started.",
        "Rest and try again. Growth isn't linear."
    ]
};

const getMessageCategory = (focusScore, completed) => {
    if (!completed) return 'challenging';
    if (focusScore >= 80) return 'excellent';
    if (focusScore >= 60) return 'good';
    if (focusScore >= 40) return 'moderate';
    return 'challenging';
};

const getRandomMessage = (category) => {
    const messages = completionMessages[category];
    return messages[Math.floor(Math.random() * messages.length)];
};

const SessionCompletionModal = ({
    isOpen,
    onClose,
    onNewSession,
    sessionData
}) => {
    // Handle null/undefined sessionData
    const data = sessionData || {};
    const {
        duration = 0, // in minutes
        focusScore = 0,
        distractionCount = 0,
        completed = false,
        topic = 'Focus Session',
        sessionType = 'general'
    } = data;

    const category = getMessageCategory(focusScore, completed);
    const message = getRandomMessage(category);

    // Format duration
    const formatDuration = (mins) => {
        const hours = Math.floor(mins / 60);
        const minutes = mins % 60;
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes} min`;
    };

    // Get score color
    const getScoreColor = () => {
        if (focusScore >= 80) return 'text-emerald-400';
        if (focusScore >= 60) return 'text-blue-400';
        if (focusScore >= 40) return 'text-yellow-400';
        return 'text-orange-400';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-md"
                    >
                        <div className="bg-[#0f1129] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                            {/* Header with completion status */}
                            <div className="relative px-8 pt-10 pb-6 text-center">
                                {/* Subtle glow effect */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/10 rounded-full blur-3xl" />

                                {/* Status Icon */}
                                <div className={`relative inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${completed
                                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                                    : 'bg-orange-500/20 border border-orange-500/30'
                                    }`}>
                                    {completed ? (
                                        <CheckCircle className="w-10 h-10 text-emerald-400" />
                                    ) : (
                                        <Clock className="w-10 h-10 text-orange-400" />
                                    )}
                                </div>

                                {/* Status Text */}
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {completed ? 'Session Complete' : 'Session Ended'}
                                </h2>
                                <p className="text-gray-400 text-sm max-w-xs mx-auto">
                                    {topic}
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="px-8 pb-6">
                                <div className="grid grid-cols-3 gap-3">
                                    {/* Duration */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                                        <Clock className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                                        <p className="text-xl font-bold text-white">{formatDuration(duration)}</p>
                                        <p className="text-xs text-gray-500 mt-1">Duration</p>
                                    </div>

                                    {/* Focus Score */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                                        <Target className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                                        <p className={`text-xl font-bold ${getScoreColor()}`}>{focusScore}%</p>
                                        <p className="text-xs text-gray-500 mt-1">Focus Score</p>
                                    </div>

                                    {/* Distractions */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                                        <AlertTriangle className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                                        <p className="text-xl font-bold text-white">{distractionCount}</p>
                                        <p className="text-xs text-gray-500 mt-1">Distractions</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reflective Message */}
                            <div className="px-8 pb-6">
                                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5">
                                    <div className="flex items-start gap-3">
                                        <Brain className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-gray-300 text-sm leading-relaxed italic">
                                            "{message}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="px-8 pb-8 flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 px-6 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Exit
                                </button>
                                <button
                                    onClick={onNewSession}
                                    className="flex-1 py-3 px-6 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-medium hover:bg-indigo-500/30 transition-all flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    New Session
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SessionCompletionModal;
