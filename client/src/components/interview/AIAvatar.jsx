import { useState, useEffect, useMemo } from 'react';

// AI Avatar with premium holographic aesthetics and smooth animations
export default function AIAvatar({ isSpeaking = false, isThinking = false, isListening = false }) {
    const [pulse, setPulse] = useState(0);

    // Continuous pulse animation for ambient feel
    useEffect(() => {
        const interval = setInterval(() => {
            setPulse(prev => (prev + 1) % 100);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // Dynamic colors based on state
    const theme = useMemo(() => {
        if (isSpeaking) return {
            primary: '#06b6d4', // Cyan
            secondary: '#3b82f6', // Blue
            glow: 'rgba(6, 182, 212, 0.5)',
            label: '🎙️ Speaking...'
        };
        if (isThinking) return {
            primary: '#8b5cf6', // Purple
            secondary: '#d946ef', // Fuchsia
            glow: 'rgba(139, 92, 246, 0.5)',
            label: '🤔 Thinking...'
        };
        if (isListening) return {
            primary: '#10b981', // Emerald
            secondary: '#34d399', // Green
            glow: 'rgba(16, 185, 129, 0.5)',
            label: '👂 Listening...'
        };
        return {
            primary: '#64748b', // Slate
            secondary: '#475569', // Slate-600
            glow: 'rgba(100, 116, 139, 0.2)',
            label: '⏸️ Idle'
        };
    }, [isSpeaking, isThinking, isListening]);

    return (
        <div className="relative group">
            {/* Ambient Glow Orbs */}
            <div className={`absolute -inset-10 rounded-full blur-3xl transition-all duration-1000 opacity-20 ${isSpeaking ? 'bg-cyan-500 scale-125' :
                    isThinking ? 'bg-purple-500 scale-110' :
                        isListening ? 'bg-emerald-500 scale-110' : 'bg-slate-500 opacity-10'
                }`}></div>

            {/* Main Avatar Container */}
            <div className="relative w-56 h-56 md:w-72 md:h-72 flex items-center justify-center">

                {/* Outer Rotating Rings */}
                <div className={`absolute inset-0 border-2 border-dashed rounded-full transition-all duration-1000 ${isSpeaking ? 'animate-[spin_10s_linear_infinite]' : 'animate-[spin_20s_linear_infinite]'}`}
                    style={{ borderColor: `${theme.primary}40` }}></div>
                <div className={`absolute inset-4 border border-solid rounded-full transition-all duration-1000 ${isSpeaking ? 'animate-[spin_15s_linear_infinite_reverse]' : 'animate-[spin_30s_linear_infinite_reverse]'}`}
                    style={{ borderColor: `${theme.secondary}30` }}></div>

                {/* Glassmorphism Core */}
                <div className={`relative w-48 h-48 md:w-60 md:h-60 rounded-full backdrop-blur-xl border-4 transition-all duration-500 flex items-center justify-center overflow-hidden shadow-2xl ${isSpeaking ? 'scale-105' : 'scale-100'
                    }`}
                    style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        borderColor: theme.primary,
                        boxShadow: `0 0 40px ${theme.glow}`
                    }}>

                    {/* Internal Grid/Hologram Effect */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{
                            backgroundImage: `radial-gradient(${theme.primary} 1px, transparent 1px)`,
                            backgroundSize: '20px 20px'
                        }}></div>

                    {/* Animated Waveform when speaking */}
                    {isSpeaking && (
                        <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-40">
                            {[...Array(8)].map((_, i) => (
                                <div key={i}
                                    className="w-1 bg-cyan-400 rounded-full animate-bounce"
                                    style={{
                                        height: `${20 + Math.random() * 60}%`,
                                        animationDelay: `${i * 100}ms`,
                                        animationDuration: '0.6s'
                                    }}></div>
                            ))}
                        </div>
                    )}

                    {/* AI Face Visualization */}
                    <svg viewBox="0 0 200 200" className="w-40 h-40 md:w-48 md:h-48 relative z-10">
                        <defs>
                            <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor={theme.primary} stopOpacity="1" />
                                <stop offset="100%" stopColor={theme.primary} stopOpacity="0" />
                            </radialGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Eyes - Digital/Cybernetic Style */}
                        <g filter="url(#glow)">
                            {/* Left Eye */}
                            <rect x="65" y="80" width="20" height="4" rx="2" fill={theme.primary} className="transition-all duration-300">
                                {isThinking && <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />}
                            </rect>
                            <circle cx="75" cy="82" r="8" fill="url(#eyeGlow)" opacity={isSpeaking ? "0.6" : "0.3"} />

                            {/* Right Eye */}
                            <rect x="115" y="80" width="20" height="4" rx="2" fill={theme.primary} className="transition-all duration-300">
                                {isThinking && <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />}
                            </rect>
                            <circle cx="125" cy="82" r="8" fill="url(#eyeGlow)" opacity={isSpeaking ? "0.6" : "0.3"} />
                        </g>

                        {/* Mouth - Digital Waveform */}
                        <path
                            d={isSpeaking
                                ? `M70 130 Q100 ${130 + Math.sin(pulse * 0.5) * 15} 130 130`
                                : isListening
                                    ? "M75 135 Q100 145 125 135"
                                    : "M85 135 L115 135"
                            }
                            stroke={theme.primary}
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            className="transition-all duration-200"
                        />

                        {/* Decorative HUD Elements */}
                        <circle cx="100" cy="100" r="90" stroke={theme.primary} strokeWidth="0.5" fill="none" strokeDasharray="5,10" opacity="0.3" />
                        <path d="M40 100 A60 60 0 0 1 160 100" stroke={theme.secondary} strokeWidth="1" fill="none" opacity="0.2" />
                    </svg>
                </div>

                {/* Thinking Particles */}
                {isThinking && (
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                            <div key={i}
                                className="absolute w-2 h-2 rounded-full bg-purple-400 animate-ping"
                                style={{
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${i * 200}ms`,
                                    animationDuration: '2s'
                                }}></div>
                        ))}
                    </div>
                )}
            </div>

            {/* Status Label - Premium Style */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-md border transition-all duration-500 ${isSpeaking ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' :
                        isThinking ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]' :
                            isListening ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                                'bg-slate-800/50 text-slate-400 border-slate-700'
                    }`}>
                    {theme.label}
                </div>
                {/* Progress bar style indicator */}
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${isSpeaking ? 'bg-cyan-500 w-full animate-pulse' :
                            isThinking ? 'bg-purple-500 w-2/3' :
                                isListening ? 'bg-emerald-500 w-1/3 animate-pulse' : 'bg-slate-700 w-0'
                        }`}></div>
                </div>
            </div>
        </div>
    );
}

