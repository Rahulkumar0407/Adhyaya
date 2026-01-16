import React from 'react';
import { Eye, EyeOff, Shield, Trash2, X, CheckCircle } from 'lucide-react';

/**
 * Privacy-first webcam consent modal for Focus Mode
 * Follows GDPR-style consent patterns
 */
const WebcamConsentModal = ({ isOpen, onClose, onGrantConsent }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-[#12121a] border border-white/10 rounded-3xl max-w-lg w-full p-8 shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-indigo-500/20 rounded-2xl">
                        <Eye className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Enable Focus Monitoring</h2>
                        <p className="text-sm text-gray-400">Webcam-based attention tracking</p>
                    </div>
                </div>

                {/* What We Analyze */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
                    <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        What We Analyze
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                            Gaze direction (are you looking at the screen?)
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                            Blink rate (to detect fatigue)
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                            Face presence (are you at your desk?)
                        </li>
                    </ul>
                </div>

                {/* What We DON'T Do */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                    <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
                        <EyeOff className="w-4 h-4" />
                        What We DON'T Do
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                            No video recording or storage
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                            No images sent to servers
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                            No biometric identity stored
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                            No facial recognition
                        </li>
                    </ul>
                </div>

                {/* Privacy Notice */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-white mb-1">Privacy First</h4>
                            <p className="text-xs text-gray-400">
                                All processing happens locally in your browser using TensorFlow.js.
                                Only aggregated metrics (numbers, not images) are stored.
                                You can revoke consent and delete all data at any time.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-gray-400 font-bold rounded-xl hover:bg-white/10 transition-all"
                    >
                        Not Now
                    </button>
                    <button
                        onClick={onGrantConsent}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
                    >
                        I Understand & Consent
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500 mt-4">
                    You can disable this anytime in Settings → Focus → Privacy
                </p>
            </div>
        </div>
    );
};

/**
 * Revoke consent modal
 */
export const RevokeConsentModal = ({ isOpen, onClose, onRevoke, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-[#12121a] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-500/20 rounded-xl">
                        <Trash2 className="w-6 h-6 text-red-400" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Revoke Webcam Consent</h2>
                </div>

                <p className="text-gray-400 text-sm mb-6">
                    This will disable webcam monitoring and delete all attention metrics
                    collected from your focus sessions. This action cannot be undone.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-gray-400 font-bold rounded-xl hover:bg-white/10 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onRevoke}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-500/30 transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Deleting...' : 'Revoke & Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WebcamConsentModal;
