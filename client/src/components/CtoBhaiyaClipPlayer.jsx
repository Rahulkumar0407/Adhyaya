import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
    Play, Pause, Youtube, Volume2, VolumeX, Volume1,
    Maximize2, Minimize2, SkipBack, SkipForward, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { markVideoWatched } from './LockedCodeViewer';

let youtubeApiPromise;

function loadYouTubeIframeApi() {
    if (youtubeApiPromise) return youtubeApiPromise;

    youtubeApiPromise = new Promise((resolve, reject) => {
        if (window.YT && window.YT.Player) {
            resolve(window.YT);
            return;
        }

        const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
        if (!existing) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            tag.async = true;
            tag.onerror = () => reject(new Error('Failed to load YouTube IFrame API'));
            document.head.appendChild(tag);
        }

        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            if (typeof prev === 'function') prev();
            if (window.YT && window.YT.Player) resolve(window.YT);
            else reject(new Error('YouTube IFrame API loaded but YT.Player missing'));
        };

        setTimeout(() => {
            if (window.YT && window.YT.Player) resolve(window.YT);
        }, 8000);
    });

    return youtubeApiPromise;
}

export default function CtoBhaiyaClipPlayer({
    videoId,
    startTime,
    endTime,
    title,
    fallbackSummary,
    className = ''
}) {
    const containerId = useMemo(
        () => `yt-clip-${videoId}-${startTime}-${endTime}-${Math.random().toString(16).slice(2)}`,
        [videoId, startTime, endTime]
    );

    const wrapperRef = useRef(null);
    const playerRef = useRef(null);
    const tickRef = useRef(null);
    const hideControlsTimeoutRef = useRef(null);
    const progressBarRef = useRef(null);

    const [active, setActive] = useState(false);
    const [error, setError] = useState('');
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [volume, setVolume] = useState(100);
    const [muted, setMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);

    const startSeconds = useMemo(() => Math.floor(startTime || 0), [startTime]);
    const endSeconds = useMemo(() => Math.floor(endTime || 0), [endTime]);
    const clipDuration = useMemo(() => Math.max(0, endSeconds - startSeconds), [startSeconds, endSeconds]);

    const isValid =
        typeof videoId === 'string' &&
        videoId.length > 0 &&
        !videoId.startsWith('PL') &&
        Number.isFinite(startTime) &&
        Number.isFinite(endTime) &&
        endTime > startTime;

    // Format time as M:SS or H:MM:SS
    const formatTime = useCallback((seconds) => {
        const s = Math.max(0, Math.floor(seconds || 0));
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const r = s % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${r.toString().padStart(2, '0')}`;
        return `${m}:${r.toString().padStart(2, '0')}`;
    }, []);

    // Show controls temporarily
    const showControlsTemporarily = useCallback(() => {
        setControlsVisible(true);
        if (hideControlsTimeoutRef.current) {
            clearTimeout(hideControlsTimeoutRef.current);
        }
        // Only auto-hide in fullscreen when playing
        if (isFullscreen && isPlaying && !isDragging && !showSettings) {
            hideControlsTimeoutRef.current = setTimeout(() => {
                setControlsVisible(false);
            }, 3000);
        }
    }, [isFullscreen, isPlaying, isDragging, showSettings]);

    // Player controls
    const safeSeekTo = useCallback((absoluteTime) => {
        if (!playerRef.current) return;
        const clamped = Math.max(startSeconds, Math.min(absoluteTime, endSeconds - 0.5));
        playerRef.current.seekTo?.(clamped, true);
    }, [startSeconds, endSeconds]);

    const seekRelative = useCallback((relativeSeconds) => {
        const newRelative = Math.max(0, Math.min(relativeSeconds, clipDuration - 1));
        safeSeekTo(startSeconds + newRelative);
        setCurrentTime(newRelative);
    }, [clipDuration, startSeconds, safeSeekTo]);

    const jumpBy = useCallback((deltaSec) => {
        if (!playerRef.current) return;
        const t = playerRef.current.getCurrentTime?.();
        if (typeof t === 'number') {
            const newAbsolute = t + deltaSec;
            safeSeekTo(newAbsolute);
        }
    }, [safeSeekTo]);

    const togglePlayPause = useCallback(() => {
        if (!playerRef.current) return;

        if (isPlaying) {
            playerRef.current.pauseVideo?.();
        } else {
            const t = playerRef.current.getCurrentTime?.();
            if (typeof t === 'number' && t >= endSeconds - 0.5) {
                safeSeekTo(startSeconds);
                setCurrentTime(0);
            }
            playerRef.current.playVideo?.();
        }
        showControlsTemporarily();
    }, [isPlaying, endSeconds, startSeconds, safeSeekTo, showControlsTemporarily]);

    const toggleMute = useCallback(() => {
        if (!playerRef.current) return;
        if (muted) {
            playerRef.current.unMute?.();
            if (volume === 0) {
                playerRef.current.setVolume?.(50);
                setVolume(50);
            }
        } else {
            playerRef.current.mute?.();
        }
        setMuted(!muted);
        showControlsTemporarily();
    }, [muted, volume, showControlsTemporarily]);

    const changeVolume = useCallback((v) => {
        if (!playerRef.current) return;
        const newVol = Math.max(0, Math.min(100, Math.round(v)));
        setVolume(newVol);
        playerRef.current.setVolume?.(newVol);
        if (newVol === 0) {
            playerRef.current.mute?.();
            setMuted(true);
        } else if (muted) {
            playerRef.current.unMute?.();
            setMuted(false);
        }
    }, [muted]);

    const changePlaybackRate = useCallback((rate) => {
        if (!playerRef.current) return;
        playerRef.current.setPlaybackRate?.(rate);
        setPlaybackRate(rate);
        setShowSettings(false);
        showControlsTemporarily();
    }, [showControlsTemporarily]);

    const toggleFullscreen = useCallback(async () => {
        const el = wrapperRef.current;
        if (!el) return;

        try {
            if (!document.fullscreenElement) {
                await el.requestFullscreen?.();
            } else {
                await document.exitFullscreen?.();
            }
        } catch (e) {
            console.error('Fullscreen error:', e);
        }
        showControlsTemporarily();
    }, [showControlsTemporarily]);

    // Fullscreen change handler
    useEffect(() => {
        const onFullscreenChange = () => {
            const fs = Boolean(document.fullscreenElement);
            setIsFullscreen(fs);
            setControlsVisible(true);
            showControlsTemporarily();
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, [showControlsTemporarily]);

    // Keyboard shortcuts (YouTube-like)
    useEffect(() => {
        if (!active) return;

        const onKeyDown = (e) => {
            // Don't handle if typing in input
            const tag = (e.target?.tagName || '').toLowerCase();
            if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

            showControlsTemporarily();

            switch (e.code) {
                case 'Space':
                case 'KeyK':
                    e.preventDefault();
                    togglePlayPause();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    jumpBy(-5);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    jumpBy(5);
                    break;
                case 'KeyJ':
                    e.preventDefault();
                    jumpBy(-10);
                    break;
                case 'KeyL':
                    e.preventDefault();
                    jumpBy(10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    changeVolume(volume + 5);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    changeVolume(volume - 5);
                    break;
                case 'KeyM':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'KeyF':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'Escape':
                    if (showSettings) {
                        e.preventDefault();
                        setShowSettings(false);
                    }
                    break;
                case 'Digit0':
                case 'Numpad0':
                    e.preventDefault();
                    seekRelative(0);
                    break;
                case 'Comma':
                    if (e.shiftKey && !isPlaying) {
                        e.preventDefault();
                        jumpBy(-1 / 30); // Frame back
                    }
                    break;
                case 'Period':
                    if (e.shiftKey && !isPlaying) {
                        e.preventDefault();
                        jumpBy(1 / 30); // Frame forward
                    } else if (e.shiftKey) {
                        e.preventDefault();
                        const rates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
                        const idx = rates.indexOf(playbackRate);
                        if (idx < rates.length - 1) changePlaybackRate(rates[idx + 1]);
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [active, togglePlayPause, jumpBy, changeVolume, volume, toggleMute, toggleFullscreen, showSettings, seekRelative, isPlaying, playbackRate, changePlaybackRate, showControlsTemporarily]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
            if (tickRef.current) clearInterval(tickRef.current);
            if (playerRef.current?.destroy) playerRef.current.destroy();
        };
    }, []);

    // Playback monitor
    const startMonitor = useCallback(() => {
        if (tickRef.current) return;

        tickRef.current = setInterval(() => {
            if (!playerRef.current) return;

            try {
                const t = playerRef.current.getCurrentTime?.();
                if (typeof t !== 'number') return;

                // Update time
                const rel = Math.max(0, Math.min(t - startSeconds, clipDuration));
                setCurrentTime(rel);

                // Update buffered
                const fraction = playerRef.current.getVideoLoadedFraction?.();
                if (typeof fraction === 'number') {
                    setBuffered(fraction * clipDuration);
                }

                // Enforce bounds
                if (t < startSeconds - 0.5) {
                    playerRef.current.seekTo?.(startSeconds, true);
                }

                if (t >= endSeconds - 0.3) {
                    playerRef.current.pauseVideo?.();
                    setIsPlaying(false);
                    setCurrentTime(clipDuration);
                    markVideoWatched(videoId, startTime, endTime);
                    window.dispatchEvent(new CustomEvent('videoCompleted', {
                        detail: { videoId, startTime, endTime }
                    }));
                }
            } catch {
                // Ignore
            }
        }, 50);
    }, [startSeconds, endSeconds, clipDuration, videoId, startTime, endTime]);

    // Progress bar click/drag
    const handleProgressClick = useCallback((e) => {
        if (!progressBarRef.current) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, x / rect.width));
        seekRelative(percent * clipDuration);
    }, [clipDuration, seekRelative]);

    const handleProgressDrag = useCallback((e) => {
        if (!isDragging || !progressBarRef.current) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, x / rect.width));
        setCurrentTime(percent * clipDuration);
    }, [isDragging, clipDuration]);

    const handleProgressDragEnd = useCallback((e) => {
        if (!isDragging) return;
        setIsDragging(false);
        handleProgressClick(e);
    }, [isDragging, handleProgressClick]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleProgressDrag);
            window.addEventListener('mouseup', handleProgressDragEnd);
            return () => {
                window.removeEventListener('mousemove', handleProgressDrag);
                window.removeEventListener('mouseup', handleProgressDragEnd);
            };
        }
    }, [isDragging, handleProgressDrag, handleProgressDragEnd]);

    // Start player
    const start = async () => {
        if (!isValid) return;
        setActive(true);
        setError('');
        setIsReady(false);

        try {
            await loadYouTubeIframeApi();
            if (!window.YT?.Player) throw new Error('YouTube API unavailable');

            playerRef.current = new window.YT.Player(containerId, {
                videoId,
                playerVars: {
                    start: startSeconds,
                    autoplay: 1,
                    controls: 0,
                    rel: 0,
                    modestbranding: 1,
                    iv_load_policy: 3,
                    disablekb: 1,
                    playsinline: 1,
                    fs: 0,
                    origin: window.location.origin
                },
                events: {
                    onReady: (e) => {
                        e.target.seekTo(startSeconds, true);
                        e.target.setVolume?.(volume);
                        e.target.setPlaybackRate?.(playbackRate);
                        e.target.playVideo();
                        setIsReady(true);
                        setIsPlaying(true);
                        startMonitor();
                    },
                    onStateChange: (e) => {
                        if (e.data === window.YT.PlayerState.PLAYING) {
                            setIsPlaying(true);
                            setIsReady(true);
                        } else if (e.data === window.YT.PlayerState.PAUSED) {
                            setIsPlaying(false);
                        } else if (e.data === window.YT.PlayerState.BUFFERING) {
                            setIsReady(true);
                        } else if (e.data === window.YT.PlayerState.ENDED) {
                            setIsPlaying(false);
                            playerRef.current?.seekTo?.(startSeconds, true);
                        }
                    },
                    onPlaybackRateChange: (e) => {
                        setPlaybackRate(e.data);
                    },
                    onError: () => setError('Video failed to load')
                }
            });
        } catch {
            setError('Video failed to load');
        }
    };

    // Invalid state
    if (!isValid) {
        return (
            <div className={`bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800 ${className}`}>
                <div className="text-center text-gray-500">
                    <Youtube className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Video explanation coming soon</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={`bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800 ${className}`}>
                <div className="text-center text-gray-500">
                    <Youtube className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{error}</p>
                    <a
                        href={`https://www.youtube.com/watch?v=${videoId}&t=${startSeconds}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                    >
                        Watch on YouTube
                    </a>
                </div>
            </div>
        );
    }

    const progressPercent = clipDuration > 0 ? (currentTime / clipDuration) * 100 : 0;
    const bufferedPercent = clipDuration > 0 ? (buffered / clipDuration) * 100 : 0;

    const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

    return (
        <div
            ref={wrapperRef}
            className={`bg-black rounded-2xl overflow-hidden select-none ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''} ${className}`}
            onMouseMove={showControlsTemporarily}
            onMouseLeave={() => isFullscreen && isPlaying && setControlsVisible(false)}
            tabIndex={0}
        >
            {/* Video container */}
            <div className={`relative ${isFullscreen ? 'h-full' : ''}`} style={!isFullscreen ? { aspectRatio: '16/9' } : undefined}>
                {!active ? (
                    // Thumbnail
                    <button
                        type="button"
                        onClick={start}
                        className="absolute inset-0 w-full h-full group"
                    >
                        <img
                            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                            alt={title || 'Video'}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; }}
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 flex items-center justify-center">
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-20 h-20 rounded-full bg-red-600/90 flex items-center justify-center shadow-2xl"
                            >
                                <Play className="w-8 h-8 text-white ml-1" fill="white" />
                            </motion.div>
                        </div>
                        <div className="absolute bottom-4 right-4 px-2 py-1 rounded bg-black/80 text-white text-sm font-mono">
                            {formatTime(clipDuration)}
                        </div>
                    </button>
                ) : (
                    <>
                        {/* Player */}
                        <div id={containerId} className="absolute inset-0 w-full h-full" />

                        {/* Click area for play/pause */}
                        <div
                            className="absolute inset-0 cursor-pointer"
                            onClick={(e) => {
                                // Don't toggle if clicking controls
                                if (e.target.closest('.player-controls')) return;
                                togglePlayPause();
                            }}
                            onDoubleClick={toggleFullscreen}
                        />

                        {/* Loading spinner */}
                        {!isReady && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                        )}

                        {/* Controls overlay */}
                        <AnimatePresence>
                            {(controlsVisible || !isPlaying) && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="player-controls absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-16 pb-3 px-4"
                                >
                                    {/* Progress bar */}
                                    <div
                                        ref={progressBarRef}
                                        className="group relative h-1 hover:h-1.5 transition-all cursor-pointer mb-3"
                                        onClick={handleProgressClick}
                                        onMouseDown={() => setIsDragging(true)}
                                    >
                                        {/* Background */}
                                        <div className="absolute inset-0 bg-white/30 rounded-full" />
                                        {/* Buffered */}
                                        <div
                                            className="absolute inset-y-0 left-0 bg-white/50 rounded-full"
                                            style={{ width: `${bufferedPercent}%` }}
                                        />
                                        {/* Progress */}
                                        <div
                                            className="absolute inset-y-0 left-0 bg-red-600 rounded-full"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                        {/* Thumb */}
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            style={{ left: `calc(${progressPercent}% - 6px)` }}
                                        />
                                    </div>

                                    {/* Control buttons */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {/* Play/Pause */}
                                            <button onClick={togglePlayPause} className="p-2 text-white hover:text-white/80">
                                                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                            </button>

                                            {/* Skip buttons */}
                                            <button onClick={() => jumpBy(-10)} className="p-2 text-white hover:text-white/80" title="Back 10s (J)">
                                                <SkipBack className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => jumpBy(10)} className="p-2 text-white hover:text-white/80" title="Forward 10s (L)">
                                                <SkipForward className="w-5 h-5" />
                                            </button>

                                            {/* Volume */}
                                            <div
                                                className="relative flex items-center"
                                                onMouseEnter={() => setShowVolumeSlider(true)}
                                                onMouseLeave={() => setShowVolumeSlider(false)}
                                            >
                                                <button onClick={toggleMute} className="p-2 text-white hover:text-white/80">
                                                    <VolumeIcon className="w-5 h-5" />
                                                </button>
                                                {showVolumeSlider && (
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={100}
                                                        value={volume}
                                                        onChange={(e) => changeVolume(Number(e.target.value))}
                                                        className="w-20 h-1 accent-white ml-1"
                                                    />
                                                )}
                                            </div>

                                            {/* Time */}
                                            <span className="text-white text-sm font-mono ml-2">
                                                {formatTime(currentTime)} / {formatTime(clipDuration)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Settings */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowSettings(!showSettings)}
                                                    className="p-2 text-white hover:text-white/80"
                                                >
                                                    <Settings className={`w-5 h-5 ${showSettings ? 'animate-spin' : ''}`} />
                                                </button>

                                                {showSettings && (
                                                    <div className="absolute bottom-full right-0 mb-2 bg-[#212121] rounded-lg shadow-xl py-2 min-w-[150px]">
                                                        <div className="px-3 py-1 text-xs text-gray-400 uppercase">Speed</div>
                                                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                                                            <button
                                                                key={rate}
                                                                onClick={() => changePlaybackRate(rate)}
                                                                className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 ${playbackRate === rate ? 'text-white bg-white/10' : 'text-gray-300'}`}
                                                            >
                                                                {rate === 1 ? 'Normal' : `${rate}x`}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Fullscreen */}
                                            <button onClick={toggleFullscreen} className="p-2 text-white hover:text-white/80">
                                                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Center play button when paused */}
                        <AnimatePresence>
                            {!isPlaying && isReady && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                >
                                    <div className="w-20 h-20 rounded-full bg-black/60 flex items-center justify-center">
                                        <Play className="w-8 h-8 text-white ml-1" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div>
    );
}
