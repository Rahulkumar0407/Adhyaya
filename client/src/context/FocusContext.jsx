import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from '../services/api';
import focusAIService from '../services/focusAIService';

const FocusContext = createContext(null);

export const useFocus = () => {
    const context = useContext(FocusContext);
    if (!context) {
        throw new Error('useFocus must be used within a FocusProvider');
    }
    return context;
};

export const FocusProvider = ({ children }) => {
    // Session State
    const [activeSession, setActiveSession] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [pomodoroMode, setPomodoroMode] = useState(false);
    const [webcamEnabled, setWebcamEnabled] = useState(false);
    const [customDuration, setCustomDuration] = useState(25);
    const [settings, setSettings] = useState(null);
    const [isStrictMode, setIsStrictMode] = useState(true); // Default strictly enforced
    const [focusViolation, setFocusViolation] = useState(false); // Track global violations

    // Audio & config
    const [soundEnabled, setSoundEnabled] = useState(false);
    const timerRef = useRef(null);
    const audioCtxRef = useRef(null);
    const playerRef = useRef(null);
    const isPlayingAlertRef = useRef(null);
    const activeAudioSourceRef = useRef(null);

    // UI helper state (loading)
    const [isLoading, setIsLoading] = useState(true);
    // Player API Ready State to trigger re-renders
    const [playerReady, setPlayerReady] = useState(false);

    // Get auth state
    const { user, loading: authLoading } = useAuth();
    const location = useLocation();

    // Audio Context Initialization
    const initAudioContext = useCallback(() => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtxRef.current = new AudioContext();
            }
        }
        if (audioCtxRef.current?.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    }, []);

    // Stop Warning Sound
    const stopWarningSound = useCallback(() => {
        if (activeAudioSourceRef.current) {
            try {
                activeAudioSourceRef.current.stop();
                activeAudioSourceRef.current = null;
            } catch (e) { }
        }
        if (isPlayingAlertRef.current === 'siren') {
            isPlayingAlertRef.current = null;
        }
    }, []);

    // Play Alert
    const playAlertSound = useCallback((type = 'gentle') => {
        if (isPlayingAlertRef.current) return;
        try {
            initAudioContext();
            if (!audioCtxRef.current) return;
            const ctx = audioCtxRef.current;
            isPlayingAlertRef.current = 'gentle';

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'urgent') {
                osc.frequency.value = 440;
                gain.gain.value = 0.3;
            } else {
                osc.frequency.value = 392;
                gain.gain.value = 0.15;
            }

            osc.type = 'sine';
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.stop(ctx.currentTime + 0.5);

            osc.onended = () => { isPlayingAlertRef.current = null; };
            setTimeout(() => { if (isPlayingAlertRef.current === 'gentle') isPlayingAlertRef.current = null; }, 600);
        } catch (e) { isPlayingAlertRef.current = null; }
    }, [initAudioContext]);

    // Play Warning (Siren)
    const playWarningSound = useCallback(async () => {
        if (isPlayingAlertRef.current === 'siren' || settings?.enableSirenAlerts === false) return;
        stopWarningSound();
        try {
            isPlayingAlertRef.current = 'siren';
            initAudioContext();
            if (!audioCtxRef.current) return;
            const ctx = audioCtxRef.current;

            const response = await fetch('/assets/sounds/warning.mp3');
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            const gain = ctx.createGain();
            source.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.value = 0.8;
            source.start(0);
            activeAudioSourceRef.current = source;

            source.onended = () => {
                if (activeAudioSourceRef.current === source) activeAudioSourceRef.current = null;
                if (isPlayingAlertRef.current === 'siren') isPlayingAlertRef.current = null;
            };
        } catch (e) { isPlayingAlertRef.current = null; }
    }, [initAudioContext, settings, stopWarningSound]);

    const handleTimerComplete = useCallback(async () => {
        setIsRunning(false);
        try {
            const audio = new Audio('/sounds/bell.mp3');
            audio.play();
        } catch (e) { }

        if (!isBreak && activeSession) {
            setIsBreak(true);
            setTimeRemaining((settings?.defaultBreakDuration || 5) * 60);
            if (pomodoroMode) {
                setIsRunning(true); // Auto-start break
                playAlertSound('gentle');
            }
        } else if (isBreak) {
            setIsBreak(false);
            if (pomodoroMode) {
                // Auto-start next focus session
                setTimeRemaining(customDuration * 60);
                setIsRunning(true);
                playAlertSound('gentle');
            } else {
                // Stop and wait
                setIsRunning(false);
            }
        }
    }, [isBreak, activeSession, settings, pomodoroMode, customDuration, playAlertSound]);

    // Fetch initial state
    useEffect(() => {
        // Only fetch if authenticated and auth finished loading
        if (authLoading || !user) {
            setIsLoading(false);
            // Reset state on logout
            if (!user && !authLoading) {
                setActiveSession(null);
                setSettings(null);
                setIsRunning(false);
            }
            return;
        }

        const init = async () => {
            try {
                const [settingsRes, sessionRes] = await Promise.all([
                    api.get('/focus/settings'),
                    api.get('/focus/session/active')
                ]);

                if (settingsRes.data.success) {
                    setSettings(settingsRes.data.data);
                    setCustomDuration(settingsRes.data.data.defaultWorkDuration || 25);
                }

                if (sessionRes.data.success && sessionRes.data.data) {
                    const session = sessionRes.data.data;
                    setActiveSession(session);
                    if (session.status === 'active') {
                        const elapsed = Math.floor((Date.now() - new Date(session.startTime)) / 1000);
                        const planned = session.plannedDuration * 60;
                        const remaining = Math.max(0, planned - elapsed);
                        setTimeRemaining(remaining);
                        setIsRunning(true);
                    } else if (session.status === 'paused') {
                        setIsRunning(false);
                    }
                }
            } catch (error) {
                console.error("Focus Context Init Error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [user, authLoading]);

    // Timer Logic
    useEffect(() => {
        if (isRunning && timeRemaining > 0) {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleTimerComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isRunning, handleTimerComplete]); // Added handleTimerComplete as dep

    // Unlock Audio Context on User Interaction
    useEffect(() => {
        const unlockAudio = () => {
            if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume().then(() => {
                    window.removeEventListener('click', unlockAudio);
                    window.removeEventListener('keydown', unlockAudio);
                    window.removeEventListener('touchstart', unlockAudio);
                });
            } else if (!audioCtxRef.current) {
                initAudioContext();
            }
        };

        window.addEventListener('click', unlockAudio);
        window.addEventListener('keydown', unlockAudio);
        window.addEventListener('touchstart', unlockAudio);

        return () => {
            window.removeEventListener('click', unlockAudio);
            window.removeEventListener('keydown', unlockAudio);
            window.removeEventListener('touchstart', unlockAudio);
        };
    }, [initAudioContext]);

    // Local Lofi Audio Player (HTML5 Audio - Much more reliable than YouTube)
    useEffect(() => {
        // Create audio element for lofi music
        const audio = new Audio();
        audio.src = '/assets/sounds/lofi-meditation.mp3';
        audio.loop = true; // Loop the 10-minute track
        audio.volume = 0.5;
        audio.preload = 'auto';

        playerRef.current = audio;

        // Mark as ready when audio can play
        const handleCanPlay = () => {
            setPlayerReady(true);
        };

        const handleError = (e) => {
            // Only log if it's a real error (not just network abort)
            if (audio.error && audio.error.code !== audio.error.MEDIA_ERR_ABORTED) {
                console.error('Audio load error:', audio.error?.message || 'Unknown error');
            }
        };

        audio.addEventListener('canplaythrough', handleCanPlay);
        audio.addEventListener('error', handleError);

        // Explicitly load the audio
        audio.load();

        // Cleanup
        return () => {
            audio.removeEventListener('canplaythrough', handleCanPlay);
            audio.removeEventListener('error', handleError);
            if (playerRef.current) {
                playerRef.current.pause();
                playerRef.current.src = '';
                playerRef.current = null;
            }
            setPlayerReady(false);
        };
    }, []);

    // Control audio player based on state
    useEffect(() => {
        if (!playerRef.current) return;

        try {
            if (soundEnabled && isRunning && !isBreak) {
                playerRef.current.volume = 0.5;
                // Using a promise to handle autoplay restrictions gracefully
                const playPromise = playerRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        // Autoplay was blocked - user needs to interact first
                        if (e.name === 'NotAllowedError') {
                            console.info('Audio autoplay blocked. Click on the page to enable.');
                        }
                    });
                }
            } else {
                playerRef.current.pause();
            }
        } catch (e) {
            console.warn("Audio control error:", e);
        }
    }, [soundEnabled, isRunning, isBreak, playerReady]);

    // Global Strict Mode Enforcement (Tab & Fullscreen)
    // Only enforce on the Focus Mode page to avoid warnings on other pages
    useEffect(() => {
        // Enforce strict mode on all pages EXCEPT Auth/Public pages
        // This allows floating timer users to still be monitored
        const publicPages = ['/', '/login', '/register', '/forgot-password', '/auth-success'];
        const isPublicPage = publicPages.includes(location.pathname);

        if (isPublicPage) {
            // Clear violations on public pages
            if (focusViolation) setFocusViolation(false);
            stopWarningSound();
            return;
        }

        const handleVisibilityChange = () => {
            if (document.hidden && isRunning && activeSession && !isBreak) {
                playWarningSound();
            } else {
                // We don't stop warning here instantly to annoy them? 
                // Or we do? Usually we stop when they return.
                if (!focusViolation) stopWarningSound();
            }
        };

        const handleFullscreenChange = () => {
            const isFull = !!document.fullscreenElement;
            if (!isFull && isRunning && activeSession && !isBreak) {
                setFocusViolation(true);
                playWarningSound();
            } else {
                setFocusViolation(false);
                stopWarningSound();
            }
        };

        if (isRunning && activeSession) {
            // Initial Check
            handleVisibilityChange();
            handleFullscreenChange();

            document.addEventListener('visibilitychange', handleVisibilityChange);
            document.addEventListener('fullscreenchange', handleFullscreenChange);
        }

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [isRunning, activeSession, isBreak, playWarningSound, stopWarningSound, focusViolation, location.pathname]);


    // Action Handlers
    const startSession = async (sessionType, topic, duration, isPomodoro = false) => {
        initAudioContext();
        try {
            const { data } = await api.post('/focus/session/start', { sessionType, topic, plannedDuration: duration });
            if (data.success) {
                setActiveSession(data.data);
                setCustomDuration(duration);
                setPomodoroMode(isPomodoro);
                setTimeRemaining(duration * 60);
                setIsRunning(true);
                setIsBreak(false);
            }
        } catch (e) { console.error(e); }
    };

    const pauseSession = async () => {
        if (!activeSession) return;
        try {
            const { data } = await api.patch(`/focus/session/${activeSession._id}/pause`);
            if (data.success) {
                setActiveSession(data.data);
                setIsRunning(false);
            }
        } catch (e) { console.error(e); }
    };

    const resumeSession = async () => {
        if (!activeSession) return;
        try {
            const { data } = await api.patch(`/focus/session/${activeSession._id}/resume`);
            if (data.success) {
                setActiveSession(data.data);
                setIsRunning(true);
            }
        } catch (e) { console.error(e); }
    };

    const endSession = async (completed) => {
        if (!activeSession) return;
        try {
            const { data } = await api.post(`/focus/session/${activeSession._id}/end`, { completed });
            if (data.success) {
                setActiveSession(null);
                setIsRunning(false);
                setTimeRemaining(0);
                return data.data; // Return saved session data
            }
        } catch (e) { console.error(e); }
    };

    return (
        <FocusContext.Provider value={{
            activeSession,
            timeRemaining, setTimeRemaining,
            isRunning, setIsRunning,
            isBreak, setIsBreak,
            customDuration, setCustomDuration,
            settings, setSettings,
            soundEnabled, setSoundEnabled,
            pomodoroMode, setPomodoroMode,
            webcamEnabled, setWebcamEnabled,
            focusViolation, setFocusViolation,
            startSession, pauseSession, resumeSession, endSession,
            playWarningSound, stopWarningSound, playAlertSound,
            isLoading
        }}>
            {children}
            {/* We could put the hidden player div here if we wanted */}
        </FocusContext.Provider>
    );
};
