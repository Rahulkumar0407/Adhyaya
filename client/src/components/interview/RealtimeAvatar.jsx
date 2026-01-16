import { useRef, useEffect, useState, useMemo } from 'react';
import { Mic, Volume2, Brain, Sparkles, Heart, ThumbsUp, AlertTriangle } from 'lucide-react';

// Realistic 3D-style AI Interviewer Avatar with emotional expressions
export default function RealtimeAvatar({
    isSpeaking = false,
    isThinking = false,
    isListening = false,
    emotion = 'neutral', // neutral, happy, impressed, encouraging, concerned, disappointed, curious
    avatarStyle = 'professional' // professional, friendly, tech
}) {
    const canvasRef = useRef(null);
    const [mouthOpen, setMouthOpen] = useState(0);
    const [eyeBlink, setEyeBlink] = useState(false);
    const [headTilt, setHeadTilt] = useState({ x: 0, y: 0 });
    const [currentEmotion, setCurrentEmotion] = useState(emotion);
    const frameRef = useRef(0);

    // Smooth emotion transitions
    useEffect(() => {
        const timer = setTimeout(() => setCurrentEmotion(emotion), 100);
        return () => clearTimeout(timer);
    }, [emotion]);

    // Avatar color schemes
    const avatarThemes = {
        professional: {
            skin: '#F5D6C6',
            hair: '#2D1810',
            shirt: '#1E3A5F',
            tie: '#C41E3A',
            eyes: '#4A3728',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
        },
        friendly: {
            skin: '#E8B89D',
            hair: '#4A2F24',
            shirt: '#2D5A27',
            tie: '#D4A574',
            eyes: '#3D5A3D',
            background: 'linear-gradient(135deg, #1a2e1a 0%, #162e16 50%, #0f460f 100%)'
        },
        tech: {
            skin: '#DEB887',
            hair: '#1C1C1C',
            shirt: '#2C2C54',
            tie: '#00D9FF',
            eyes: '#1C1C1C',
            background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #2a2a4e 100%)'
        }
    };

    const theme = avatarThemes[avatarStyle] || avatarThemes.professional;

    // Emotion-based expressions
    const emotionStyles = useMemo(() => {
        switch (currentEmotion) {
            case 'happy':
            case 'impressed':
                return {
                    eyebrowLeft: "M65 82 Q78 76 90 80", // raised
                    eyebrowRight: "M110 80 Q122 76 135 82",
                    mouthPath: "M80 140 Q100 160 120 140", // big smile
                    eyeSparkle: true,
                    cheekBlush: 0.4,
                    headBob: true,
                    glowColor: '#10B981',
                    statusText: currentEmotion === 'impressed' ? 'Impressed!' : 'Happy',
                    statusColor: '#10B981'
                };
            case 'encouraging':
                return {
                    eyebrowLeft: "M65 84 Q78 80 90 82",
                    eyebrowRight: "M110 82 Q122 80 135 84",
                    mouthPath: "M82 143 Q100 152 118 143", // warm smile
                    eyeSparkle: true,
                    cheekBlush: 0.3,
                    headBob: false,
                    glowColor: '#F59E0B',
                    statusText: 'Encouraging',
                    statusColor: '#F59E0B'
                };
            case 'curious':
                return {
                    eyebrowLeft: "M65 80 Q78 75 90 82", // one raised
                    eyebrowRight: "M110 85 Q122 82 135 85",
                    mouthPath: "M85 145 Q100 148 115 145", // slight open
                    eyeSparkle: false,
                    cheekBlush: 0.1,
                    headBob: false,
                    headTiltExtra: 5,
                    glowColor: '#8B5CF6',
                    statusText: 'Curious',
                    statusColor: '#8B5CF6'
                };
            case 'concerned':
                return {
                    eyebrowLeft: "M65 82 Q78 86 90 84", // slightly furrowed
                    eyebrowRight: "M110 84 Q122 86 135 82",
                    mouthPath: "M85 148 Q100 144 115 148", // slight frown
                    eyeSparkle: false,
                    cheekBlush: 0,
                    headBob: false,
                    glowColor: '#F97316',
                    statusText: 'Thinking...',
                    statusColor: '#F97316'
                };
            case 'disappointed':
                return {
                    eyebrowLeft: "M65 84 Q78 88 90 86", // furrowed down
                    eyebrowRight: "M110 86 Q122 88 135 84",
                    mouthPath: "M82 150 Q100 142 118 150", // frown
                    eyeSparkle: false,
                    cheekBlush: 0,
                    headBob: false,
                    eyesDroop: true,
                    glowColor: '#EF4444',
                    statusText: 'Hmm...',
                    statusColor: '#EF4444'
                };
            default: // neutral
                return {
                    eyebrowLeft: "M65 85 Q78 82 90 84",
                    eyebrowRight: "M110 84 Q122 82 135 85",
                    mouthPath: "M85 145 Q100 148 115 145",
                    eyeSparkle: false,
                    cheekBlush: 0.2,
                    headBob: false,
                    glowColor: '#64748B',
                    statusText: 'Ready',
                    statusColor: '#64748B'
                };
        }
    }, [currentEmotion]);

    // Mouth animation when speaking
    useEffect(() => {
        if (isSpeaking) {
            const interval = setInterval(() => {
                setMouthOpen(Math.random() * 0.8 + 0.2);
            }, 100);
            return () => clearInterval(interval);
        } else {
            setMouthOpen(0);
        }
    }, [isSpeaking]);

    // Eye blinking - faster when happy
    useEffect(() => {
        const blinkRate = currentEmotion === 'happy' || currentEmotion === 'impressed' ? 2000 : 3500;
        const blink = () => {
            setEyeBlink(true);
            setTimeout(() => setEyeBlink(false), 150);
        };
        const interval = setInterval(blink, blinkRate + Math.random() * 1500);
        return () => clearInterval(interval);
    }, [currentEmotion]);

    // Head movement - more animated when happy
    useEffect(() => {
        if (isSpeaking || isThinking || emotionStyles.headBob) {
            const intensity = emotionStyles.headBob ? 6 : 4;
            const interval = setInterval(() => {
                setHeadTilt({
                    x: (Math.random() - 0.5) * intensity + (emotionStyles.headTiltExtra || 0),
                    y: (Math.random() - 0.5) * (intensity - 1)
                });
            }, emotionStyles.headBob ? 1000 : 2000);
            return () => clearInterval(interval);
        } else {
            setHeadTilt({ x: emotionStyles.headTiltExtra || 0, y: 0 });
        }
    }, [isSpeaking, isThinking, emotionStyles]);

    // Status text - combine emotion with state
    const statusInfo = useMemo(() => {
        if (isSpeaking) return { text: 'Speaking...', color: '#00D9FF', icon: Volume2 };
        if (isThinking) return { text: 'Thinking...', color: '#A855F7', icon: Brain };
        if (isListening) return { text: 'Listening...', color: '#10B981', icon: Mic };
        return {
            text: emotionStyles.statusText,
            color: emotionStyles.statusColor,
            icon: currentEmotion === 'happy' || currentEmotion === 'impressed' ? ThumbsUp :
                currentEmotion === 'disappointed' ? AlertTriangle : Sparkles
        };
    }, [isSpeaking, isThinking, isListening, emotionStyles, currentEmotion]);

    const StatusIcon = statusInfo.icon;

    // Get mouth path based on speaking state and emotion
    const getMouthPath = () => {
        if (isSpeaking) {
            // Animated speaking mouth
            const baseY = currentEmotion === 'happy' || currentEmotion === 'impressed' ? 142 : 145;
            return `M80 ${baseY} Q100 ${baseY + 10 + mouthOpen * 15} 120 ${baseY} Q100 ${baseY + mouthOpen * 8} 80 ${baseY}`;
        }
        if (isListening) {
            // Slightly open when listening
            return currentEmotion === 'happy' ? "M82 142 Q100 155 118 142" : "M85 145 Q100 152 115 145";
        }
        return emotionStyles.mouthPath;
    };

    return (
        <div className="relative flex flex-col items-center">
            {/* Avatar Container with 3D perspective */}
            <div
                className="relative w-48 h-56 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500"
                style={{
                    background: theme.background,
                    transform: `perspective(1000px) rotateX(${headTilt.y}deg) rotateY(${headTilt.x}deg)`,
                    boxShadow: isSpeaking
                        ? `0 0 60px ${emotionStyles.glowColor}40, 0 20px 60px rgba(0, 0, 0, 0.5)`
                        : currentEmotion === 'happy' || currentEmotion === 'impressed'
                            ? `0 0 40px ${emotionStyles.glowColor}30, 0 20px 60px rgba(0, 0, 0, 0.5)`
                            : '0 20px 60px rgba(0, 0, 0, 0.5)'
                }}
            >
                {/* Ambient light effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none" />

                {/* Emotion glow overlay */}
                {(currentEmotion === 'happy' || currentEmotion === 'impressed') && (
                    <div
                        className="absolute inset-0 pointer-events-none animate-pulse"
                        style={{
                            background: `radial-gradient(circle at 50% 30%, ${emotionStyles.glowColor}15 0%, transparent 60%)`,
                            animationDuration: '2s'
                        }}
                    />
                )}

                {/* Avatar SVG */}
                <svg viewBox="0 0 200 250" className="w-full h-full">
                    <defs>
                        {/* Skin gradient for 3D effect */}
                        <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={theme.skin} />
                            <stop offset="50%" stopColor={theme.skin} />
                            <stop offset="100%" style={{ stopColor: theme.skin, filter: 'brightness(0.85)' }} />
                        </linearGradient>

                        {/* Hair gradient */}
                        <linearGradient id="hairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={theme.hair} />
                            <stop offset="100%" style={{ stopColor: theme.hair, filter: 'brightness(0.7)' }} />
                        </linearGradient>

                        {/* Shirt gradient */}
                        <linearGradient id="shirtGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={theme.shirt} />
                            <stop offset="100%" style={{ stopColor: theme.shirt, filter: 'brightness(0.7)' }} />
                        </linearGradient>

                        {/* Shadow filter */}
                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3" />
                        </filter>

                        {/* Glow for speaking */}
                        <filter id="speakGlow">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feFlood floodColor={emotionStyles.glowColor} floodOpacity="0.5" />
                            <feComposite in2="blur" operator="in" />
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        {/* Eye sparkle filter */}
                        <filter id="eyeSparkle">
                            <feGaussianBlur stdDeviation="1" result="blur" />
                            <feFlood floodColor="#FFFFFF" floodOpacity="0.8" />
                            <feComposite in2="blur" operator="in" />
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Background gradient */}
                    <rect width="200" height="250" fill="url(#bgGradient)" />

                    {/* Body/Shoulders */}
                    <ellipse cx="100" cy="280" rx="90" ry="60" fill="url(#shirtGradient)" filter="url(#shadow)" />

                    {/* Neck */}
                    <rect x="85" y="175" width="30" height="35" fill={theme.skin} rx="5" />

                    {/* Shirt collar */}
                    <path d="M70 200 L100 220 L130 200 L130 250 L70 250 Z" fill="url(#shirtGradient)" />

                    {/* Tie */}
                    <path d="M95 200 L100 210 L105 200 L108 250 L92 250 Z" fill={theme.tie} />
                    <polygon points="100,210 92,215 108,215" fill={theme.tie} style={{ filter: 'brightness(1.2)' }} />

                    {/* Head */}
                    <ellipse cx="100" cy="110" rx="55" ry="65" fill={theme.skin} filter="url(#shadow)" />

                    {/* Ears */}
                    <ellipse cx="45" cy="115" rx="8" ry="12" fill={theme.skin} />
                    <ellipse cx="155" cy="115" rx="8" ry="12" fill={theme.skin} />

                    {/* Hair */}
                    <path
                        d="M45 90 Q50 40 100 35 Q150 40 155 90 Q155 70 145 60 Q130 50 100 48 Q70 50 55 60 Q45 70 45 90 Z"
                        fill="url(#hairGradient)"
                    />
                    {/* Hair side highlights */}
                    <path d="M48 90 Q52 70 60 60" stroke={theme.hair} strokeWidth="8" fill="none" opacity="0.6" />
                    <path d="M152 90 Q148 70 140 60" stroke={theme.hair} strokeWidth="8" fill="none" opacity="0.6" />

                    {/* Eyebrows - Emotion controlled */}
                    <path
                        d={emotionStyles.eyebrowLeft}
                        stroke={theme.hair}
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        className="transition-all duration-300"
                    />
                    <path
                        d={emotionStyles.eyebrowRight}
                        stroke={theme.hair}
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        className="transition-all duration-300"
                    />

                    {/* Eyes */}
                    <g className="transition-all duration-150">
                        {/* Left eye */}
                        <ellipse
                            cx="75"
                            cy={emotionStyles.eyesDroop ? 102 : 100}
                            rx="12"
                            ry={eyeBlink ? 1 : emotionStyles.eyesDroop ? 6 : 8}
                            fill="white"
                            filter={emotionStyles.eyeSparkle ? "url(#eyeSparkle)" : "none"}
                        />
                        <circle
                            cx={currentEmotion === 'happy' ? 76 : 75}
                            cy={emotionStyles.eyesDroop ? 102 : 100}
                            r={eyeBlink ? 0 : emotionStyles.eyesDroop ? 4 : 5}
                            fill={theme.eyes}
                        />
                        <circle cx="77" cy="98" r={eyeBlink ? 0 : 2} fill="white" opacity="0.8" />
                        {/* Extra sparkle for happy */}
                        {emotionStyles.eyeSparkle && !eyeBlink && (
                            <circle cx="72" cy="96" r="1.5" fill="white" opacity="0.9" />
                        )}

                        {/* Right eye */}
                        <ellipse
                            cx="125"
                            cy={emotionStyles.eyesDroop ? 102 : 100}
                            rx="12"
                            ry={eyeBlink ? 1 : emotionStyles.eyesDroop ? 6 : 8}
                            fill="white"
                            filter={emotionStyles.eyeSparkle ? "url(#eyeSparkle)" : "none"}
                        />
                        <circle
                            cx={currentEmotion === 'happy' ? 126 : 125}
                            cy={emotionStyles.eyesDroop ? 102 : 100}
                            r={eyeBlink ? 0 : emotionStyles.eyesDroop ? 4 : 5}
                            fill={theme.eyes}
                        />
                        <circle cx="127" cy="98" r={eyeBlink ? 0 : 2} fill="white" opacity="0.8" />
                        {/* Extra sparkle for happy */}
                        {emotionStyles.eyeSparkle && !eyeBlink && (
                            <circle cx="122" cy="96" r="1.5" fill="white" opacity="0.9" />
                        )}
                    </g>

                    {/* Nose */}
                    <path
                        d="M100 105 L95 125 Q100 130 105 125 L100 105"
                        fill="none"
                        stroke={theme.skin}
                        strokeWidth="2"
                        style={{ filter: 'brightness(0.9)' }}
                    />

                    {/* Mouth - Emotion and speech controlled */}
                    <g filter={isSpeaking ? "url(#speakGlow)" : "none"}>
                        <path
                            d={getMouthPath()}
                            fill={isSpeaking ? "#8B0000" : currentEmotion === 'happy' || currentEmotion === 'impressed' ? "#C4847B" : "none"}
                            stroke="#C4A484"
                            strokeWidth="2"
                            className="transition-all duration-200"
                        />
                        {/* Teeth when speaking */}
                        {isSpeaking && mouthOpen > 0.3 && (
                            <rect x="90" y="146" width="20" height="6" rx="1" fill="white" opacity="0.9" />
                        )}
                        {/* Teeth for big smile */}
                        {!isSpeaking && (currentEmotion === 'happy' || currentEmotion === 'impressed') && (
                            <rect x="88" y="148" width="24" height="5" rx="1" fill="white" opacity="0.85" />
                        )}
                    </g>

                    {/* Cheek blush - varies by emotion */}
                    <circle cx="60" cy="125" r="12" fill="#FFB6C1" opacity={emotionStyles.cheekBlush} className="transition-opacity duration-500" />
                    <circle cx="140" cy="125" r="12" fill="#FFB6C1" opacity={emotionStyles.cheekBlush} className="transition-opacity duration-500" />
                </svg>

                {/* Speaking audio wave overlay */}
                {isSpeaking && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-center gap-1 pb-2">
                        {[...Array(7)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1.5 rounded-full animate-pulse"
                                style={{
                                    height: `${15 + Math.random() * 30}px`,
                                    backgroundColor: emotionStyles.glowColor,
                                    opacity: 0.6,
                                    animationDelay: `${i * 80}ms`,
                                    animationDuration: '0.3s'
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Thinking particles */}
                {isThinking && (
                    <div className="absolute top-4 right-4">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}

                {/* Happy sparkles */}
                {(currentEmotion === 'happy' || currentEmotion === 'impressed') && !isSpeaking && (
                    <div className="absolute top-2 left-2 right-2 flex justify-between pointer-events-none">
                        <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" style={{ animationDelay: '0ms' }} />
                        <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" style={{ animationDelay: '500ms' }} />
                        <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" style={{ animationDelay: '250ms' }} />
                    </div>
                )}
            </div>

            {/* Name and Status */}
            <div className="mt-4 text-center">
                <h3 className="text-lg font-bold text-white mb-1">AI Interviewer</h3>
                <div
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300"
                    style={{
                        backgroundColor: `${statusInfo.color}20`,
                        color: statusInfo.color,
                        border: `1px solid ${statusInfo.color}40`,
                        boxShadow: isSpeaking || currentEmotion === 'happy' ? `0 0 20px ${statusInfo.color}40` : 'none'
                    }}
                >
                    <StatusIcon className="w-4 h-4" />
                    {statusInfo.text}
                </div>
            </div>
        </div>
    );
}
