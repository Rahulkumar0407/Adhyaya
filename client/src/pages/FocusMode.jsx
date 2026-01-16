import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Play, Pause, Target, Brain, Eye, Settings, BarChart3,
    Volume2, VolumeX, Zap, Clock, CheckCircle2,
    Trophy, Sparkles, Coffee, Moon, X, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFocus } from '../context/FocusContext';
import Loader from '../components/common/Loader';
import FocusSettingsPanel from '../components/focus/FocusSettingsPanel';
import FocusWebcam from '../components/focus/FocusWebcam';
import DistractionAlert from '../components/focus/DistractionAlert';
import SessionCompletionModal from '../components/focus/SessionCompletionModal';
import focusAIService from '../services/focusAIService';

// Break activity suggestions - Duplicate here or move to constants? Keeping here.
const BREAK_ACTIVITIES = [
    { id: 'eyes', label: 'Rest your eyes', icon: '👁️', description: 'Look at something 20 feet away for 20 seconds' },
    { id: 'stretch', label: 'Stretch', icon: '🧘', description: 'Stand up and stretch your body' },
    { id: 'walk', label: 'Take a walk', icon: '🚶', description: 'A short walk refreshes the mind' },
    { id: 'hydrate', label: 'Drink water', icon: '💧', description: 'Stay hydrated for better focus' },
    { id: 'breathe', label: 'Deep breaths', icon: '🌬️', description: 'Take 5 slow, deep breaths' }
];

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const SESSION_TYPES = [
    { id: 'study', label: 'Study', icon: Brain },
    { id: 'coding', label: 'Coding', icon: Zap },
    { id: 'revision', label: 'Revision', icon: RefreshCw },
    { id: 'interview-prep', label: 'Interview', icon: Target },
    { id: 'general', label: 'General', icon: Clock }
];

const FocusMode = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Use Global Context
    const {
        activeSession,
        timeRemaining, setTimeRemaining,
        isRunning, setIsRunning,
        isBreak, setIsBreak,
        customDuration, setCustomDuration,
        settings, setSettings,
        soundEnabled, setSoundEnabled,
        pomodoroMode, setPomodoroMode,
        webcamEnabled, setWebcamEnabled,
        focusViolation, // Check global violation
        startSession: startSessionCtx,
        pauseSession: pauseSessionCtx,
        resumeSession: resumeSessionCtx,
        endSession: endSessionCtx,
        playWarningSound, stopWarningSound, playAlertSound,
        isLoading
    } = useFocus();

    // Local UI State
    const [sessionType, setSessionType] = useState('study');
    const [topic, setTopic] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [showSessionConfig, setShowSessionConfig] = useState(!activeSession);

    // Config Sync
    useEffect(() => {
        if (activeSession) setShowSessionConfig(false);
        else setShowSessionConfig(true);
    }, [activeSession]);

    // Modal State
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completionData, setCompletionData] = useState(null);
    const [showPreSessionModal, setShowPreSessionModal] = useState(!activeSession);
    const [breakSuggestion, setBreakSuggestion] = useState(null);

    // Webcam State
    const [webcamMetrics, setWebcamMetrics] = useState({ gazeScore: 100, blinkCount: 0, lookAwayCount: 0 });
    const [distractionAlert, setDistractionAlert] = useState({ type: null, visible: false });

    // Fullscreen State
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showFullscreenReminder, setShowFullscreenReminder] = useState(false);

    // Fullscreen Listener (UI Sync only, alerting handled by Context)
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFull = !!document.fullscreenElement;
            setIsFullscreen(isFull);
            // Alerting is handled globally by FocusContext now
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Cleanup Audio on Unmount
    useEffect(() => {
        return () => {
            stopWarningSound();
        };
    }, [stopWarningSound]);

    // Webcam Logic (Distractions)
    const handleDistraction = useCallback(async (event) => {
        playAlertSound('gentle');
        setDistractionAlert({ type: event.type, visible: true });

        if (activeSession) {
            try {
                await api.post(`/focus/session/${activeSession._id}/distraction`, { type: event.type });
            } catch (error) { console.error(error); }
        }
    }, [activeSession, playAlertSound]);

    // Tab Visibility (Strict Mode) - Only when this component is mounted
    useEffect(() => {
        if (!activeSession || !isRunning) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Tab Switch
                setDistractionAlert({ type: 'tab_switch', visible: true });
                playWarningSound();
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Focus Session Active!', { body: 'Come back to focus!', icon: '/favicon.ico' });
                }
            } else {
                stopWarningSound();
            }
        };

        const handleWindowBlur = () => {
            // Optional: Disable 'app switch' detection to prevent false alarms during platform navigation?
            // If user clicks sidebar (which is part of window), blur DOES NOT fire.
            // Blur fires when clicking alt-tab or another browser window.
            // We'll keep it but rely on stopWarningSound on cleanup.
            if (document.activeElement?.tagName === 'IFRAME') return; // Youtube click fix
            setTimeout(() => {
                if (!document.hasFocus()) {
                    setDistractionAlert({ type: 'app_switch', visible: true });
                    playWarningSound();
                }
            }, 200);
        };
        const handleWindowFocus = () => stopWarningSound();

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('focus', handleWindowFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, [activeSession, isRunning, playWarningSound, stopWarningSound]);

    // AI Suggestions (Break)
    useEffect(() => {
        if (!isRunning || !activeSession || isBreak) {
            setBreakSuggestion(null);
            return;
        }
        const interval = setInterval(() => {
            const elapsedMinutes = (customDuration * 60 - timeRemaining) / 60;
            const suggestion = focusAIService.getBreakRecommendation(webcamMetrics, elapsedMinutes, settings);
            if (suggestion?.recommended) setBreakSuggestion(suggestion);
        }, 30000);
        return () => clearInterval(interval);
    }, [isRunning, activeSession, isBreak, webcamMetrics, timeRemaining, customDuration, settings]);


    // Handlers
    const startSession = async () => {
        try { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); } catch (e) { }
        setShowPreSessionModal(false);
        await startSessionCtx(sessionType, topic, customDuration, pomodoroMode);
    };

    const handleEndSession = async (completed) => {
        const sessionData = await endSessionCtx(completed);
        if (sessionData || activeSession) { // fallback to activeSession if sessionData undefined
            const elapsed = Math.round((customDuration * 60 - timeRemaining) / 60);
            setCompletionData({
                duration: elapsed,
                focusScore: webcamEnabled ? Math.round(webcamMetrics.gazeScore) : settings?.avgFocusScore || 80,
                topic: topic || activeSession?.topic,
                completed
            });
            setShowCompletionModal(true);
        }
    };

    const handleCloseCompletionModal = () => {
        setShowCompletionModal(false);
        navigate('/dashboard');
    };

    const startBreak = async () => {
        // Call API manually since Context doesn't wrap break logic deeply yet
        if (activeSession) {
            await api.post(`/focus/session/${activeSession._id}/break`, { type: 'user_initiated' });
            setIsBreak(true);
            setTimeRemaining((settings?.defaultBreakDuration || 5) * 60);
            setIsRunning(true); // Timer runs for break
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { });
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    };

    // Calculate progress
    const totalSeconds = isBreak ? (settings?.defaultBreakDuration || 5) * 60 : customDuration * 60;
    const progress = totalSeconds > 0 ? ((totalSeconds - timeRemaining) / totalSeconds) * 100 : 0;
    const canEnableWebcam = settings?.webcamConsentGiven && !settings?.webcamConsentRevoked;

    if (isLoading) return <div className="min-h-screen bg-[#070709] flex items-center justify-center"><Loader /></div>;

    return (
        <div className="min-h-screen w-full bg-[#0a0d29] text-white overflow-hidden font-sans relative flex flex-col items-center justify-between p-4 md:p-8">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Epilogue:wght@300;500;700&display=swap');
                .font-display { font-family: 'Space Grotesk', sans-serif; }
                .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
                .text-glow { text-shadow: 0 0 15px rgba(81, 137, 251, 0.6); }
                .timer-ring { background: conic-gradient(from 0deg, #33FF33 0%, #5189fb ${progress}%, transparent ${progress}%); }
            `}</style>

            {/* Background & Header (Simplified Copy) */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-20 pointer-events-none z-0">
                <svg className="absolute bottom-0 w-full h-full fill-current text-[#5189fb]/20" viewBox="0 0 1440 320"><path d="M0,224L120,202.7C240,181,480,139,720,138.7C960,139,1200,181,1320,202.7L1440,224L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path></svg>
            </div>

            <header className="w-full max-w-[1400px] flex items-center justify-between z-10 font-display">
                <div className="flex items-center gap-4">
                    <div className="size-10 bg-[#5189fb]/20 rounded-xl flex items-center justify-center border border-[#5189fb]/30"><Zap className="text-[#5189fb] w-6 h-6" /></div>
                    <div><h2 className="text-xl font-bold tracking-tight">Focus Session</h2><p className="text-xs text-[#5189fb]/70 uppercase tracking-widest font-medium">Deep Work Mode</p></div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setSoundEnabled(!soundEnabled)} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${soundEnabled ? 'bg-[#5189fb]/20 border-[#5189fb]/40' : 'bg-white/5 border-white/10 opacity-70'}`}>
                        {soundEnabled ? <Volume2 className="w-4 h-4 text-[#33FF33]" /> : <VolumeX className="w-4 h-4 text-white/60" />}
                        <span className="text-xs font-medium">{soundEnabled ? 'Lofi: ON' : 'Lofi: OFF'}</span>
                    </button>
                    <Link to="/focus-dashboard" className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-xs font-medium">
                        <BarChart3 className="w-4 h-4 text-[#5189fb]" /><span>Analytics</span>
                    </Link>
                    <button onClick={() => navigate('/dashboard')} className="size-10 glass-card rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-red-500/20"><X className="w-5 h-5" /></button>
                </div>
            </header>

            <main className="flex-1 w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 py-8 font-display">
                {/* Left Panel: Camera & Streak */}
                <div className="col-span-1 lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1">
                    <div className="glass-card p-6 rounded-xl flex flex-col gap-4">
                        <div className="flex items-center justify-between"><p className="text-sm font-medium text-white/60 uppercase">Streak</p><Trophy className="text-orange-400 w-5 h-5" /></div>
                        <div className="flex items-baseline gap-2"><h3 className="text-5xl font-bold text-glow">{settings?.focusStreak || 0}</h3><p className="text-lg text-white/80">Days</p></div>
                    </div>
                    <div className="glass-card p-6 rounded-xl flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white/60 uppercase">Camera</p>
                            <div className="flex gap-2">
                                {canEnableWebcam && !webcamEnabled && <button onClick={() => setWebcamEnabled(true)} className="text-[10px] bg-[#33FF33]/20 text-[#33FF33] px-2 py-1 rounded">ON</button>}
                                {webcamEnabled && <button onClick={() => setWebcamEnabled(false)} className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded">OFF</button>}
                            </div>
                        </div>
                        {webcamEnabled ? (
                            <div className="relative rounded-lg overflow-hidden border border-white/10 h-32 bg-black/20">
                                <FocusWebcam enabled={webcamEnabled} onMetricsUpdate={setWebcamMetrics} onDistraction={handleDistraction} showPreview={true} size="medium" />
                                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur px-2 py-1 rounded text-xs font-bold font-mono">{webcamMetrics.gazeScore}%</div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 h-32 justify-center bg-white/5 rounded-lg border border-white/5"><Eye className="w-8 h-8 opacity-50" /></div>
                        )}
                        <span className={`text-xs font-bold ${webcamMetrics.gazeScore > 80 ? 'text-[#33FF33]' : 'text-orange-400'}`}>{webcamEnabled ? (webcamMetrics.gazeScore > 80 ? 'PEAK' : 'DISTRACTED') : 'OFF'}</span>
                    </div>
                </div>

                {/* Center: Timer */}
                <div className="col-span-1 lg:col-span-6 flex flex-col items-center justify-center relative order-1 lg:order-2">
                    <div className="relative size-72 md:size-96 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-[12px] border-white/5"></div>
                        <div className="absolute inset-0 rounded-full border-[12px] border-transparent timer-ring opacity-80" style={{ mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}></div>
                        <div className="flex flex-col items-center text-center z-10">
                            <span className="text-7xl md:text-8xl font-bold tracking-tighter text-glow">{formatTime(timeRemaining)}</span>
                            {isBreak && <div className="mt-4 text-[#33FF33] text-xs font-bold uppercase tracking-wider animate-pulse">Break Time</div>}
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-4">
                        <button onClick={() => setTimeRemaining(prev => Math.max(60, prev - 600))} disabled={activeSession && timeRemaining <= 60} className="px-4 py-2 glass-card rounded-full">-10</button>
                        <button onClick={() => setTimeRemaining(prev => prev + 600)} className="px-4 py-2 glass-card rounded-full">+10</button>
                    </div>

                    <div className="mt-8 flex items-center gap-8">
                        <button onClick={() => { if (window.confirm('Reset?')) { activeSession ? handleEndSession(false) : setTimeRemaining(customDuration * 60); } }} className="size-12 rounded-full glass-card flex items-center justify-center hover:bg-white/10"><RefreshCw className="w-5 h-5" /></button>
                        {!activeSession ? (
                            <button onClick={() => setShowPreSessionModal(true)} className="size-20 rounded-full bg-[#5189fb] flex items-center justify-center shadow-[0_0_30px_rgba(81,137,251,0.5)] hover:scale-105 transition-all"><Play className="w-8 h-8 fill-current ml-1" /></button>
                        ) : (
                            <button onClick={isRunning ? pauseSessionCtx : resumeSessionCtx} className={`size-20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(81,137,251,0.5)] hover:scale-105 transition-all ${isRunning ? 'bg-[#5189fb]' : 'bg-[#33FF33]'}`}>
                                {isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                            </button>
                        )}
                        <button onClick={() => setShowSettings(true)} className="size-12 rounded-full glass-card flex items-center justify-center hover:bg-white/10"><Settings className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Right: Config/Stats */}
                <div className="col-span-1 lg:col-span-3 flex flex-col gap-6 order-3">
                    {!activeSession && (
                        <div className="glass-card p-6 rounded-xl flex flex-col gap-4">
                            <p className="text-sm font-medium text-white/60 uppercase tracking-tighter">Session Goal</p>

                            {/* Session Type Selector */}
                            <div className="grid grid-cols-5 gap-1 mb-2">
                                {SESSION_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setSessionType(type.id)}
                                        className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all group relative ${sessionType === type.id
                                            ? 'bg-[#5189fb]/20 border border-[#5189fb] text-[#5189fb]'
                                            : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60'}`}
                                        title={type.label}
                                    >
                                        <type.icon className="w-4 h-4" />
                                    </button>
                                ))}
                            </div>

                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="What are you working on?"
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-[#5189fb] focus:outline-none placeholder:text-white/20"
                            />

                            <div className="grid grid-cols-4 gap-2">
                                {[15, 25, 45, 60].map(mins => (
                                    <button
                                        key={mins}
                                        onClick={() => setCustomDuration(mins)}
                                        className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${customDuration === mins
                                            ? 'bg-[#5189fb]/20 border-[#5189fb] text-[#5189fb]'
                                            : 'bg-white/5 border-white/10 text-gray-400'
                                            }`}
                                    >
                                        {mins}m
                                    </button>
                                ))}
                            </div>

                            {/* Pomodoro Mode Toggle */}
                            <label className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all mt-2">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[#5189fb]" />
                                    <span className="text-sm text-white">Pomodoro Mode</span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={pomodoroMode}
                                        onChange={(e) => setPomodoroMode(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-10 h-5 bg-white/10 rounded-full peer-checked:bg-[#5189fb]/50 transition-colors" />
                                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white/50 rounded-full transition-transform peer-checked:translate-x-5 peer-checked:bg-[#5189fb]" />
                                </div>
                            </label>
                            {pomodoroMode && (
                                <p className="text-xs text-gray-500 -mt-2">Auto-cycle between {customDuration}min work and {settings?.defaultBreakDuration || 5}min breaks</p>
                            )}

                            <button
                                onClick={() => setShowPreSessionModal(true)}
                                className="mt-2 w-full py-3 bg-[#5189fb] text-white font-bold rounded-xl shadow-lg hover:bg-[#3d70db] transition-all flex items-center justify-center gap-2 group"
                            >
                                <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" /> Start Focus Session
                            </button>
                        </div>
                    )}
                    {activeSession && (
                        <div className="glass-card p-6 rounded-xl">
                            <h4 className="font-bold text-lg mb-1">{activeSession.topic || 'Deep Work'}</h4>
                            <p className="text-xs text-white/40">Keep going!</p>
                            <button onClick={() => handleEndSession(true)} className="mt-4 w-full py-2 bg-green-500/20 text-green-400 border border-green-500/50 rounded-lg font-bold text-sm hover:bg-green-500/30">Complete Session</button>
                        </div>
                    )}
                </div>
            </main>

            <DistractionAlert type={distractionAlert.type} isVisible={distractionAlert.visible} onDismiss={() => setDistractionAlert({ ...distractionAlert, visible: false })} onAction={() => setDistractionAlert({ ...distractionAlert, visible: false })} />

            {showPreSessionModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0a0d29] border border-white/10 rounded-2xl p-6 max-w-md w-full">
                        <div className="text-center mb-6">
                            <div className="size-16 bg-[#5189fb]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#5189fb]/30">
                                <Zap className="w-8 h-8 text-[#5189fb]" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Before You Start</h2>
                            <p className="text-sm text-white/50">Maximize your focus environment</p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <button onClick={toggleFullscreen} className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className={`size-10 rounded-lg flex items-center justify-center ${isFullscreen ? 'bg-[#33FF33]/20' : 'bg-white/10'}`}>
                                        {isFullscreen ? <CheckCircle2 className="w-5 h-5 text-[#33FF33]" /> : <Target className="w-5 h-5 text-white" />}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-white">Go Fullscreen</p>
                                        <p className="text-xs text-white/50">Eliminate visual distractions</p>
                                    </div>
                                </div>
                                {isFullscreen && <span className="text-xs font-bold text-[#33FF33] bg-[#33FF33]/10 px-2 py-1 rounded">Active</span>}
                            </button>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                        <Moon className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-amber-300">Enable Do Not Disturb</p>
                                        <p className="text-xs text-amber-400/60">Silence notifications on device</p>
                                    </div>
                                </div>
                                <span className="text-xs font-medium px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Manual</span>
                            </div>

                            <button
                                onClick={() => Notification.requestPermission()}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`size-10 rounded-lg flex items-center justify-center ${Notification.permission === 'granted' ? 'bg-[#33FF33]/20' : 'bg-white/10'}`}>
                                        {Notification.permission === 'granted' ? <CheckCircle2 className="w-5 h-5 text-[#33FF33]" /> : <Sparkles className="w-5 h-5 text-white" />}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-white">Allow Notifications</p>
                                        <p className="text-xs text-white/50">Get alerts when distracted</p>
                                    </div>
                                </div>
                                <span className="text-xs font-medium px-2 py-1 rounded bg-white/10">
                                    {Notification.permission === 'granted' ? 'Allowed' : 'Enable'}
                                </span>
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowPreSessionModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60">Cancel</button>
                            <button onClick={startSession} className="flex-1 py-3 rounded-xl bg-[#5189fb] font-bold text-white shadow-[0_0_20px_rgba(81,137,251,0.3)] hover:shadow-[0_0_30px_rgba(81,137,251,0.5)] transition-all">Start Session</button>
                        </div>
                    </div>
                </div>
            )}

            {(showFullscreenReminder || focusViolation) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in zoom-in">
                    <div className="text-center p-8 border border-red-500/50 rounded-2xl bg-red-900/20 shadow-[0_0_100px_rgba(220,38,38,0.5)]">
                        <div className="mx-auto size-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <Target className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Focus Mode Broken</h2>
                        <p className="text-red-300 mb-8 max-w-md">You exited fullscreen mode. Access is restricted until you return to your focus environment.</p>
                        <button
                            onClick={toggleFullscreen}
                            className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105"
                        >
                            Return to Fullscreen
                        </button>
                    </div>
                </div>
            )}

            <SessionCompletionModal isOpen={showCompletionModal} onClose={handleCloseCompletionModal} onNewSession={() => { setShowCompletionModal(false); setShowPreSessionModal(true); }} sessionData={completionData} />
            <FocusSettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} settings={settings} onSettingsUpdate={setSettings} />
        </div>
    );
};

export default FocusMode;
