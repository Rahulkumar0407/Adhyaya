import React, { useRef, useEffect, useState } from 'react';
import { Eye, AlertCircle, CheckCircle, Loader2, Camera, CameraOff } from 'lucide-react';
import focusAttentionService from '../../services/focusAttentionService';

/**
 * FocusWebcam Component
 * 
 * On-device webcam monitoring for attention tracking
 * Privacy: No video recording, no cloud uploads
 */
const FocusWebcam = ({
    enabled,
    onMetricsUpdate,
    onDistraction,
    showPreview = false,
    size = 'small' // 'small' | 'medium' | 'large'
}) => {
    const videoRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState(null);
    const [currentMetrics, setCurrentMetrics] = useState({
        gazeScore: 100,
        blinkCount: 0,
        lookAwayCount: 0
    });

    const sizeClasses = {
        small: 'w-24 h-18',
        medium: 'w-40 h-30',
        large: 'w-64 h-48'
    };

    // Track if component is mounted to prevent state updates after unmount
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;

        if (enabled && videoRef.current) {
            startTracking();
        } else {
            stopTracking();
        }

        return () => {
            isMountedRef.current = false;
            stopTracking();
        };
    }, [enabled]);

    const startTracking = async () => {
        if (!videoRef.current) return;

        setIsLoading(true);
        setError(null);

        try {
            // Set up callbacks
            focusAttentionService.setCallbacks({
                onMetricsUpdate: (metrics) => {
                    if (isMountedRef.current) {
                        setCurrentMetrics(metrics);
                        if (onMetricsUpdate) onMetricsUpdate(metrics);
                    }
                },
                onDistraction: (event) => {
                    if (isMountedRef.current && onDistraction) {
                        onDistraction(event);
                    }
                }
            });

            const success = await focusAttentionService.startTracking(videoRef.current);

            if (isMountedRef.current) {
                if (success) {
                    setIsTracking(true);
                } else {
                    setError('Failed to start attention tracking');
                }
            }
        } catch (err) {
            console.error('Webcam tracking error:', err);
            if (isMountedRef.current) {
                setError(err.message || 'Failed to access webcam');
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    };

    const stopTracking = () => {
        const finalMetrics = focusAttentionService.stopTracking();
        setIsTracking(false);
        return finalMetrics;
    };

    // Get gaze score color
    const getGazeColor = (score) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getGazeBgColor = (score) => {
        if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/30';
        if (score >= 50) return 'bg-yellow-500/20 border-yellow-500/30';
        return 'bg-red-500/20 border-red-500/30';
    };

    if (!enabled) {
        return null;
    }

    return (
        <div className="relative">
            {/* Video Element (hidden or shown based on showPreview) */}
            <div className={`relative ${sizeClasses[size]} ${showPreview ? 'block' : 'hidden'} rounded-xl overflow-hidden border border-white/10`}>
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover transform -scale-x-100"
                    playsInline
                    muted
                />

                {/* Overlay with gaze indicator */}
                {isTracking && (
                    <div className="absolute bottom-2 left-2 right-2">
                        <div className={`px-2 py-1 rounded-lg border ${getGazeBgColor(currentMetrics.gazeScore)} backdrop-blur-sm`}>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">Attention</span>
                                <span className={`font-bold ${getGazeColor(currentMetrics.gazeScore)}`}>
                                    {currentMetrics.gazeScore}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Hidden video for tracking only */}
            {!showPreview && (
                <video
                    ref={videoRef}
                    className="hidden"
                    playsInline
                    muted
                />
            )}

            {/* Status Badge */}
            <div className={`
                inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border
                ${isTracking
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : isLoading
                        ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                        : 'bg-white/5 border-white/10 text-gray-400'
                }
            `}>
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs font-medium">Initializing...</span>
                    </>
                ) : isTracking ? (
                    <>
                        <Eye className="w-4 h-4" />
                        <span className="text-xs font-medium">Tracking Active</span>
                        <span className={`font-bold ${getGazeColor(currentMetrics.gazeScore)}`}>
                            {currentMetrics.gazeScore}%
                        </span>
                    </>
                ) : error ? (
                    <>
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-medium text-red-400">{error}</span>
                    </>
                ) : (
                    <>
                        <CameraOff className="w-4 h-4" />
                        <span className="text-xs font-medium">Webcam Off</span>
                    </>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-xs text-red-400">{error}</p>
                    <button
                        onClick={startTracking}
                        className="mt-1 text-xs text-red-300 underline hover:text-red-200"
                    >
                        Try again
                    </button>
                </div>
            )}
        </div>
    );
};

export default FocusWebcam;
