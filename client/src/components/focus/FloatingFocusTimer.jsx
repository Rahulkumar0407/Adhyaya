import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFocus } from '../../context/FocusContext';
import { Play, Pause, X, Maximize2, Coffee } from 'lucide-react';

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const FloatingFocusTimer = () => {
    const {
        activeSession,
        timeRemaining,
        isRunning,
        pauseSession,
        resumeSession,
        isBreak,
        focusViolation
    } = useFocus();

    const location = useLocation();
    const navigate = useNavigate();
    const [position, setPosition] = useState({ x: window.innerWidth - 220, y: window.innerHeight - 120 });
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        setIsDragging(true);
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragOffset.current.x,
                y: e.clientY - dragOffset.current.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    // Hide if on focus page or no active session
    // Only show if there's actually an active or paused session with time remaining
    // BUT if there is a violation, we should show the violation overlay regardless
    if (!activeSession || (!isRunning && timeRemaining <= 0)) return null;
    if (location.pathname === '/focus' && !focusViolation) return null;

    // Violation Overlay (Global)
    if (focusViolation && location.pathname !== '/focus') {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in zoom-in">
                <div className="text-center p-8 border border-red-500/50 rounded-2xl bg-red-900/20 shadow-[0_0_100px_rgba(220,38,38,0.5)]">
                    <div className="mx-auto size-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <Maximize2 className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Focus Mode Broken</h2>
                    <p className="text-red-300 mb-8 max-w-md">You exited fullscreen mode. Access is restricted until you return to your focus environment.</p>
                    <button
                        onClick={() => document.documentElement.requestFullscreen().catch(e => { })}
                        className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105"
                    >
                        Return to Fullscreen
                    </button>
                </div>
            </div>
        );
    }

    if (location.pathname === '/focus') return null;

    return (
        <div
            className="fixed z-50 cursor-grab active:cursor-grabbing backdrop-blur-md bg-black/80 border border-white/10 rounded-2xl shadow-2xl p-4 flex items-center gap-4 transition-transform hover:scale-105"
            style={{
                left: position.x,
                top: position.y,
                width: '200px'
            }}
            onMouseDown={handleMouseDown}
        >
            {/* Progress Ring (Mini) */}
            <div className="relative size-12 shrink-0 flex items-center justify-center">
                <svg className="size-full -rotate-90">
                    <circle
                        cx="24" cy="24" r="20"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="4"
                    />
                    <circle
                        cx="24" cy="24" r="20"
                        fill="none"
                        stroke={isBreak ? "#33FF33" : "#5189fb"}
                        strokeWidth="4"
                        strokeDasharray="125.6"
                        strokeDashoffset={125.6 * (1 - timeRemaining / (activeSession.plannedDuration * 60))}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    {isRunning ? (
                        <button
                            onClick={(e) => { e.stopPropagation(); pauseSession(); }}
                            className="bg-white/10 p-1 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <Pause className="w-4 h-4 text-white" />
                        </button>
                    ) : (
                        <button
                            onClick={(e) => { e.stopPropagation(); resumeSession(); }}
                            className="bg-white/10 p-1 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <Play className="w-4 h-4 text-white ml-0.5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-xs text-white/60 truncate font-medium">
                    {isBreak ? 'Break Time' : (activeSession.topic || 'Focus Session')}
                </p>
                <p className={`text-xl font-bold font-mono ${isBreak ? 'text-[#33FF33]' : 'text-white'}`}>
                    {formatTime(timeRemaining)}
                </p>
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); navigate('/focus'); }}
                className="absolute -top-2 -right-2 bg-[#5189fb] text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform"
                title="Expand"
            >
                <Maximize2 className="w-3 h-3" />
            </button>
        </div>
    );
};

export default FloatingFocusTimer;
