import { motion } from 'framer-motion';
import { useState } from 'react';

/**
 * GlassCard - Premium glassmorphism card component with cutting-edge styling
 * Enhanced with deeper blur, animated borders, shimmer effects, and elevated shadows
 */
const GlassCard = ({
    children,
    className = '',
    neonColor = 'cyan', // 'cyan', 'purple', 'green', 'orange', 'red'
    hover = true,
    glow = false,
    elevated = false, // New: extra shadow elevation
    shimmer = false, // New: animated shimmer effect
    padding = 'p-6',
    onClick,
    ...props
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const neonColors = {
        cyan: {
            border: 'rgba(0, 212, 255, 0.12)',
            borderHover: 'rgba(0, 212, 255, 0.4)',
            glow: 'rgba(0, 212, 255, 0.12)',
            shadow: '0 8px 32px rgba(0, 212, 255, 0.15)',
            shadowElevated: '0 16px 48px rgba(0, 212, 255, 0.2), 0 0 0 1px rgba(0, 212, 255, 0.1)',
            gradient: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)',
            shimmer: 'rgba(0, 212, 255, 0.3)',
        },
        purple: {
            border: 'rgba(139, 92, 246, 0.12)',
            borderHover: 'rgba(139, 92, 246, 0.4)',
            glow: 'rgba(139, 92, 246, 0.12)',
            shadow: '0 8px 32px rgba(139, 92, 246, 0.15)',
            shadowElevated: '0 16px 48px rgba(139, 92, 246, 0.2), 0 0 0 1px rgba(139, 92, 246, 0.1)',
            gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(0, 212, 255, 0.08) 100%)',
            shimmer: 'rgba(139, 92, 246, 0.3)',
        },
        green: {
            border: 'rgba(16, 185, 129, 0.12)',
            borderHover: 'rgba(16, 185, 129, 0.4)',
            glow: 'rgba(16, 185, 129, 0.12)',
            shadow: '0 8px 32px rgba(16, 185, 129, 0.15)',
            shadowElevated: '0 16px 48px rgba(16, 185, 129, 0.2), 0 0 0 1px rgba(16, 185, 129, 0.1)',
            gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(0, 212, 255, 0.08) 100%)',
            shimmer: 'rgba(16, 185, 129, 0.3)',
        },
        orange: {
            border: 'rgba(245, 158, 11, 0.12)',
            borderHover: 'rgba(245, 158, 11, 0.4)',
            glow: 'rgba(245, 158, 11, 0.12)',
            shadow: '0 8px 32px rgba(245, 158, 11, 0.15)',
            shadowElevated: '0 16px 48px rgba(245, 158, 11, 0.2), 0 0 0 1px rgba(245, 158, 11, 0.1)',
            gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)',
            shimmer: 'rgba(245, 158, 11, 0.3)',
        },
        red: {
            border: 'rgba(239, 68, 68, 0.12)',
            borderHover: 'rgba(239, 68, 68, 0.4)',
            glow: 'rgba(239, 68, 68, 0.12)',
            shadow: '0 8px 32px rgba(239, 68, 68, 0.15)',
            shadowElevated: '0 16px 48px rgba(239, 68, 68, 0.2), 0 0 0 1px rgba(239, 68, 68, 0.1)',
            gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(245, 158, 11, 0.08) 100%)',
            shimmer: 'rgba(239, 68, 68, 0.3)',
        },
    };

    const colors = neonColors[neonColor] || neonColors.cyan;

    return (
        <motion.div
            whileHover={hover ? { scale: 1.015, y: -4 } : undefined}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
                relative rounded-2xl overflow-hidden
                ${padding}
                ${onClick ? 'cursor-pointer' : ''}
                ${className}
            `}
            style={{
                background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.8) 0%, rgba(15, 15, 30, 0.9) 100%)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: `1px solid ${isHovered ? colors.borderHover : colors.border}`,
                boxShadow: elevated || isHovered
                    ? colors.shadowElevated
                    : (glow ? colors.shadow : '0 4px 16px rgba(0, 0, 0, 0.3)'),
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            {...props}
        >
            {/* Animated gradient background overlay */}
            <div
                className="absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: colors.gradient,
                    opacity: isHovered ? 0.6 : 0,
                }}
            />

            {/* Top edge glow line */}
            <div
                className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                style={{
                    background: `linear-gradient(90deg, transparent 0%, ${colors.borderHover} 50%, transparent 100%)`,
                    opacity: isHovered ? 1 : 0.3,
                    transition: 'opacity 0.3s ease',
                }}
            />

            {/* Inner radial glow effect */}
            {glow && (
                <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(ellipse at top, ${colors.glow} 0%, transparent 60%)`,
                        opacity: isHovered ? 0.8 : 0.5,
                    }}
                />
            )}

            {/* Shimmer effect */}
            {shimmer && (
                <div
                    className="absolute inset-0 pointer-events-none overflow-hidden"
                    style={{ opacity: isHovered ? 1 : 0.5 }}
                >
                    <div
                        className="absolute -inset-full animate-shimmer"
                        style={{
                            background: `linear-gradient(90deg, transparent 0%, ${colors.shimmer} 50%, transparent 100%)`,
                            transform: 'translateX(-100%)',
                            animation: 'shimmer 2s infinite',
                        }}
                    />
                </div>
            )}

            {/* Content */}
            <div className="relative z-10">{children}</div>

            {/* Enhanced corner accents */}
            <div
                className="absolute top-0 left-0 w-12 h-px transition-all duration-300"
                style={{
                    background: `linear-gradient(90deg, ${colors.borderHover}, transparent)`,
                    opacity: isHovered ? 1 : 0.6,
                }}
            />
            <div
                className="absolute top-0 left-0 h-12 w-px transition-all duration-300"
                style={{
                    background: `linear-gradient(180deg, ${colors.borderHover}, transparent)`,
                    opacity: isHovered ? 1 : 0.6,
                }}
            />
            <div
                className="absolute bottom-0 right-0 w-12 h-px transition-all duration-300"
                style={{
                    background: `linear-gradient(270deg, ${colors.borderHover}, transparent)`,
                    opacity: isHovered ? 1 : 0.6,
                }}
            />
            <div
                className="absolute bottom-0 right-0 h-12 w-px transition-all duration-300"
                style={{
                    background: `linear-gradient(0deg, ${colors.borderHover}, transparent)`,
                    opacity: isHovered ? 1 : 0.6,
                }}
            />

            {/* Bottom ambient glow on hover */}
            <div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-full blur-xl pointer-events-none transition-opacity duration-300"
                style={{
                    background: colors.borderHover,
                    opacity: isHovered ? 0.3 : 0,
                }}
            />
        </motion.div>
    );
};

export default GlassCard;
