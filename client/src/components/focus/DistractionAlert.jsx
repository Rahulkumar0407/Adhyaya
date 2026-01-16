import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, Eye, Coffee, Activity } from 'lucide-react';

/**
 * Distraction Alert Component
 * 
 * Shows subtle, non-spammy alerts when attention drops
 */
const DistractionAlert = ({
    type,
    isVisible,
    onDismiss,
    onAction,
    autoHide = true,
    autoHideDelay = 5000
}) => {
    const [isShowing, setIsShowing] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setIsShowing(true);

            if (autoHide) {
                const timer = setTimeout(() => {
                    setIsShowing(false);
                    if (onDismiss) onDismiss();
                }, autoHideDelay);
                return () => clearTimeout(timer);
            }
        } else {
            setIsShowing(false);
        }
    }, [isVisible, autoHide, autoHideDelay]);

    // if (!isShowing) return null; // Removed to prevent reconciliation errors

    const alertConfig = {
        gaze_away: {
            icon: Eye,
            title: "You've looked away",
            message: "Take a moment to refocus on your work.",
            color: 'yellow',
            bgColor: 'bg-yellow-500/10 border-yellow-500/20',
            iconColor: 'text-yellow-400'
        },
        no_face: {
            icon: AlertTriangle,
            title: "Are you still there?",
            message: "We lost sight of you. Ready to continue?",
            color: 'orange',
            bgColor: 'bg-orange-500/10 border-orange-500/20',
            iconColor: 'text-orange-400'
        },
        drowsy: {
            icon: Coffee,
            title: "Feeling tired?",
            message: "Consider taking a short break to refresh.",
            color: 'purple',
            bgColor: 'bg-purple-500/10 border-purple-500/20',
            iconColor: 'text-purple-400',
            showBreakButton: true
        },
        low_focus: {
            icon: Activity,
            title: "Focus dropping",
            message: "Your attention seems scattered. Deep breath.",
            color: 'blue',
            bgColor: 'bg-blue-500/10 border-blue-500/20',
            iconColor: 'text-blue-400'
        },
        tab_switch: {
            icon: AlertTriangle,
            title: "Stay on this tab!",
            message: "Switching tabs breaks your focus flow. Come back!",
            color: 'red',
            bgColor: 'bg-red-500/10 border-red-500/20',
            iconColor: 'text-red-400'
        },
        app_switch: {
            icon: AlertTriangle,
            title: "You left the app!",
            message: "Switching apps disrupts your deep work. Focus!",
            color: 'red',
            bgColor: 'bg-red-500/10 border-red-500/20',
            iconColor: 'text-red-400'
        }
    };


    const config = alertConfig[type] || alertConfig.gaze_away;
    const Icon = config.icon;

    return (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform ${isShowing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <div className={`
                flex items-center gap-4 px-5 py-4 rounded-2xl border backdrop-blur-xl
                shadow-lg shadow-black/20 max-w-md
                ${config.bgColor}
            `}>
                <div className={`p-2 rounded-xl ${config.bgColor}`}>
                    <Icon className={`w-6 h-6 ${config.iconColor}`} />
                </div>

                <div className="flex-1">
                    <h4 className="text-white font-bold text-sm">{config.title}</h4>
                    <p className="text-gray-400 text-xs mt-0.5">{config.message}</p>
                </div>

                {config.showBreakButton && (
                    <button
                        onClick={() => onAction?.('take_break')}
                        className="px-3 py-1.5 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-lg hover:bg-purple-500/30 transition-colors"
                    >
                        Take Break
                    </button>
                )}

                <button
                    onClick={() => {
                        setIsShowing(false);
                        if (onDismiss) onDismiss();
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                    <X className="w-4 h-4 text-gray-400" />
                </button>
            </div>
        </div>
    );
};

/**
 * Inline Focus Score Indicator
 * Shows real-time attention status
 */
export const FocusScoreIndicator = ({ score, isTracking }) => {
    const getColor = () => {
        if (!isTracking) return 'text-gray-500';
        if (score >= 80) return 'text-emerald-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getBgColor = () => {
        if (!isTracking) return 'bg-gray-500/10 border-gray-500/20';
        if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
        if (score >= 50) return 'bg-yellow-500/10 border-yellow-500/20';
        return 'bg-red-500/10 border-red-500/20';
    };

    return (
        <div className={`
            inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border
            ${getBgColor()}
        `}>
            <Eye className={`w-4 h-4 ${getColor()}`} />
            <span className={`text-sm font-bold ${getColor()}`}>
                {isTracking ? `${score}%` : 'Off'}
            </span>
        </div>
    );
};

export default DistractionAlert;
