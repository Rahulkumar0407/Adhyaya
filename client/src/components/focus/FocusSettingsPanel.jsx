import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Settings, Clock, Bell, Eye, EyeOff, Shield,
    Trash2, Save, Volume2, VolumeX, Zap, Brain
} from 'lucide-react';
import WebcamConsentModal, { RevokeConsentModal } from './WebcamConsentModal';

/**
 * Focus Settings Panel
 * User preferences for Focus Mode
 */
const FocusSettingsPanel = ({ isOpen, onClose, settings, onSettingsUpdate }) => {
    const [localSettings, setLocalSettings] = useState({
        defaultWorkDuration: 25,
        defaultBreakDuration: 5,
        longBreakDuration: 15,
        cyclesBeforeLongBreak: 4,
        enableAdaptiveTimer: true,
        alertSensitivity: 'medium',
        enableSoundAlerts: false,
        enableSirenAlerts: true, // Default to true if not present
        enableVisualAlerts: true,
        enableFocusStreaks: true,
        enableChallenges: false,
        webcamConsentGiven: false,
        webcamMonitoringEnabled: false
    });

    const [isSaving, setIsSaving] = useState(false);
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [isRevoking, setIsRevoking] = useState(false);

    useEffect(() => {
        if (settings) {
            setLocalSettings(prev => ({ ...prev, ...settings }));
        }
    }, [settings]);

    const handleChange = (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data } = await api.patch('/focus/settings', localSettings);
            if (data.success) {
                if (onSettingsUpdate) onSettingsUpdate(data.data);
                onClose();
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleGrantConsent = async () => {
        try {
            const { data } = await api.post('/focus/settings/webcam-consent');
            if (data.success) {
                setLocalSettings(prev => ({
                    ...prev,
                    webcamConsentGiven: true,
                    webcamMonitoringEnabled: true
                }));
                if (onSettingsUpdate) onSettingsUpdate(data.data);
            }
        } catch (error) {
            console.error('Error granting consent:', error);
        }
        setShowConsentModal(false);
    };

    const handleRevokeConsent = async () => {
        setIsRevoking(true);
        try {
            const { data } = await api.delete('/focus/settings/webcam-consent');
            if (data.success) {
                setLocalSettings(prev => ({
                    ...prev,
                    webcamConsentGiven: false,
                    webcamMonitoringEnabled: false
                }));
                if (onSettingsUpdate) onSettingsUpdate({
                    ...localSettings,
                    webcamConsentGiven: false,
                    webcamMonitoringEnabled: false
                });
            }
        } catch (error) {
            console.error('Error revoking consent:', error);
        } finally {
            setIsRevoking(false);
            setShowRevokeModal(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                ></div>

                {/* Panel */}
                <div className="relative bg-[#12121a] border border-white/10 rounded-3xl max-w-xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
                    {/* Header */}
                    <div className="sticky top-0 bg-[#12121a] border-b border-white/10 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Settings className="w-5 h-5 text-indigo-400" />
                            <h2 className="text-lg font-bold text-white">Focus Settings</h2>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Pomodoro Settings */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Pomodoro Timer
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-2">Work Duration (min)</label>
                                    <input
                                        type="number"
                                        value={localSettings.defaultWorkDuration}
                                        onChange={(e) => handleChange('defaultWorkDuration', parseInt(e.target.value) || 25)}
                                        min="5"
                                        max="120"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-2">Break Duration (min)</label>
                                    <input
                                        type="number"
                                        value={localSettings.defaultBreakDuration}
                                        onChange={(e) => handleChange('defaultBreakDuration', parseInt(e.target.value) || 5)}
                                        min="1"
                                        max="30"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-2">Long Break (min)</label>
                                    <input
                                        type="number"
                                        value={localSettings.longBreakDuration}
                                        onChange={(e) => handleChange('longBreakDuration', parseInt(e.target.value) || 15)}
                                        min="5"
                                        max="60"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-2">Cycles Before Long Break</label>
                                    <input
                                        type="number"
                                        value={localSettings.cyclesBeforeLongBreak}
                                        onChange={(e) => handleChange('cyclesBeforeLongBreak', parseInt(e.target.value) || 4)}
                                        min="2"
                                        max="10"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-yellow-400" />
                                    <div>
                                        <p className="text-sm font-medium text-white">Adaptive Timer</p>
                                        <p className="text-xs text-gray-500">AI adjusts duration based on your performance</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleChange('enableAdaptiveTimer', !localSettings.enableAdaptiveTimer)}
                                    className={`w-12 h-6 rounded-full transition-colors ${localSettings.enableAdaptiveTimer ? 'bg-indigo-500' : 'bg-white/20'
                                        }`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${localSettings.enableAdaptiveTimer ? 'translate-x-6' : 'translate-x-0.5'
                                        }`}></div>
                                </button>
                            </div>
                        </section>

                        {/* Alert Settings */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Bell className="w-4 h-4" />
                                Distraction Alerts
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-2">Alert Sensitivity</label>
                                    <div className="flex gap-2">
                                        {['low', 'medium', 'high'].map(level => (
                                            <button
                                                key={level}
                                                onClick={() => handleChange('alertSensitivity', level)}
                                                className={`flex-1 py-2 px-4 rounded-xl border font-medium text-sm capitalize transition-all ${localSettings.alertSensitivity === level
                                                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        {localSettings.enableVisualAlerts ? <Eye className="w-5 h-5 text-emerald-400" /> : <EyeOff className="w-5 h-5 text-gray-500" />}
                                        <span className="text-sm text-white">Visual Alerts</span>
                                    </div>
                                    <button
                                        onClick={() => handleChange('enableVisualAlerts', !localSettings.enableVisualAlerts)}
                                        className={`w-12 h-6 rounded-full transition-colors ${localSettings.enableVisualAlerts ? 'bg-emerald-500' : 'bg-white/20'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${localSettings.enableVisualAlerts ? 'translate-x-6' : 'translate-x-0.5'
                                            }`}></div>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        {localSettings.enableSoundAlerts ? <Volume2 className="w-5 h-5 text-blue-400" /> : <VolumeX className="w-5 h-5 text-gray-500" />}
                                        <span className="text-sm text-white">Sound Alerts</span>
                                    </div>
                                    <button
                                        onClick={() => handleChange('enableSoundAlerts', !localSettings.enableSoundAlerts)}
                                        className={`w-12 h-6 rounded-full transition-colors ${localSettings.enableSoundAlerts ? 'bg-blue-500' : 'bg-white/20'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${localSettings.enableSoundAlerts ? 'translate-x-6' : 'translate-x-0.5'
                                            }`}></div>
                                    </button>
                                </div>

                                {/* Siren Toggle */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        {localSettings.enableSirenAlerts ? <Volume2 className="w-5 h-5 text-red-500" /> : <VolumeX className="w-5 h-5 text-gray-500" />}
                                        <div className="flex flex-col">
                                            <span className="text-sm text-white">Warning Siren</span>
                                            <span className="text-xs text-gray-500">Play loud siren for major distractions</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleChange('enableSirenAlerts', !localSettings.enableSirenAlerts)}
                                        className={`w-12 h-6 rounded-full transition-colors ${localSettings.enableSirenAlerts ? 'bg-red-500' : 'bg-white/20'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${localSettings.enableSirenAlerts ? 'translate-x-6' : 'translate-x-0.5'
                                            }`}></div>
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Privacy & Webcam */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Privacy & Webcam
                            </h3>

                            {localSettings.webcamConsentGiven ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Eye className="w-5 h-5 text-emerald-400" />
                                            <div>
                                                <p className="text-sm font-medium text-white">Webcam Consent Given</p>
                                                <p className="text-xs text-gray-400">Attention tracking is available</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                        <span className="text-sm text-white">Enable During Sessions</span>
                                        <button
                                            onClick={() => handleChange('webcamMonitoringEnabled', !localSettings.webcamMonitoringEnabled)}
                                            className={`w-12 h-6 rounded-full transition-colors ${localSettings.webcamMonitoringEnabled ? 'bg-emerald-500' : 'bg-white/20'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${localSettings.webcamMonitoringEnabled ? 'translate-x-6' : 'translate-x-0.5'
                                                }`}></div>
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => setShowRevokeModal(true)}
                                        className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Revoke Consent & Delete Data
                                    </button>
                                </div>
                            ) : (
                                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                    <div className="flex items-start gap-3 mb-4">
                                        <EyeOff className="w-5 h-5 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-white">Webcam Tracking Disabled</p>
                                            <p className="text-xs text-gray-400">Enable for real-time attention monitoring</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowConsentModal(true)}
                                        className="w-full px-4 py-2.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-bold rounded-xl hover:bg-indigo-500/30 transition-colors"
                                    >
                                        Enable Webcam Tracking
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* Gamification */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Brain className="w-4 h-4" />
                                Gamification
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                    <div>
                                        <p className="text-sm text-white">Focus Streaks</p>
                                        <p className="text-xs text-gray-500">Track consecutive focus days</p>
                                    </div>
                                    <button
                                        onClick={() => handleChange('enableFocusStreaks', !localSettings.enableFocusStreaks)}
                                        className={`w-12 h-6 rounded-full transition-colors ${localSettings.enableFocusStreaks ? 'bg-orange-500' : 'bg-white/20'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${localSettings.enableFocusStreaks ? 'translate-x-6' : 'translate-x-0.5'
                                            }`}></div>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                    <div>
                                        <p className="text-sm text-white">Weekly Challenges</p>
                                        <p className="text-xs text-gray-500">Optional focus goals</p>
                                    </div>
                                    <button
                                        onClick={() => handleChange('enableChallenges', !localSettings.enableChallenges)}
                                        className={`w-12 h-6 rounded-full transition-colors ${localSettings.enableChallenges ? 'bg-purple-500' : 'bg-white/20'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${localSettings.enableChallenges ? 'translate-x-6' : 'translate-x-0.5'
                                            }`}></div>
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* Consent Modals */}
            <WebcamConsentModal
                isOpen={showConsentModal}
                onClose={() => setShowConsentModal(false)}
                onGrantConsent={handleGrantConsent}
            />
            <RevokeConsentModal
                isOpen={showRevokeModal}
                onClose={() => setShowRevokeModal(false)}
                onRevoke={handleRevokeConsent}
                isLoading={isRevoking}
            />
        </>
    );
};

export default FocusSettingsPanel;
