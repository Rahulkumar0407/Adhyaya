import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * NeonButton - Cyberpunk styled button with neon glow effects
 */
const NeonButton = ({
    children,
    variant = 'primary', // 'primary', 'secondary', 'danger', 'success', 'ghost'
    size = 'md', // 'sm', 'md', 'lg'
    icon: Icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    fullWidth = false,
    onClick,
    className = '',
    type = 'button',
    ...props
}) => {
    const variants = {
        primary: {
            bg: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(0, 240, 255, 0.1) 100%)',
            border: 'rgba(0, 240, 255, 0.5)',
            text: '#00f0ff',
            shadow: '0 0 20px rgba(0, 240, 255, 0.3)',
            hoverBg: 'rgba(0, 240, 255, 0.3)',
        },
        secondary: {
            bg: 'linear-gradient(135deg, rgba(191, 0, 255, 0.2) 0%, rgba(191, 0, 255, 0.1) 100%)',
            border: 'rgba(191, 0, 255, 0.5)',
            text: '#bf00ff',
            shadow: '0 0 20px rgba(191, 0, 255, 0.3)',
            hoverBg: 'rgba(191, 0, 255, 0.3)',
        },
        danger: {
            bg: 'linear-gradient(135deg, rgba(255, 51, 102, 0.2) 0%, rgba(255, 51, 102, 0.1) 100%)',
            border: 'rgba(255, 51, 102, 0.5)',
            text: '#ff3366',
            shadow: '0 0 20px rgba(255, 51, 102, 0.3)',
            hoverBg: 'rgba(255, 51, 102, 0.3)',
        },
        success: {
            bg: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 255, 136, 0.1) 100%)',
            border: 'rgba(0, 255, 136, 0.5)',
            text: '#00ff88',
            shadow: '0 0 20px rgba(0, 255, 136, 0.3)',
            hoverBg: 'rgba(0, 255, 136, 0.3)',
        },
        ghost: {
            bg: 'transparent',
            border: 'rgba(255, 255, 255, 0.1)',
            text: '#ffffff',
            shadow: 'none',
            hoverBg: 'rgba(255, 255, 255, 0.1)',
        },
    };

    const sizes = {
        sm: {
            padding: 'px-3 py-1.5',
            text: 'text-xs',
            iconSize: 'w-3 h-3',
            gap: 'gap-1.5',
        },
        md: {
            padding: 'px-4 py-2',
            text: 'text-sm',
            iconSize: 'w-4 h-4',
            gap: 'gap-2',
        },
        lg: {
            padding: 'px-6 py-3',
            text: 'text-base',
            iconSize: 'w-5 h-5',
            gap: 'gap-2.5',
        },
    };

    const currentVariant = variants[variant] || variants.primary;
    const currentSize = sizes[size] || sizes.md;

    const isDisabled = disabled || loading;

    return (
        <motion.button
            type={type}
            whileHover={!isDisabled ? { scale: 1.02 } : undefined}
            whileTap={!isDisabled ? { scale: 0.98 } : undefined}
            onClick={!isDisabled ? onClick : undefined}
            disabled={isDisabled}
            className={`
        relative inline-flex items-center justify-center
        ${currentSize.padding} ${currentSize.text} ${currentSize.gap}
        font-medium rounded-xl
        transition-all duration-200
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
            style={{
                background: currentVariant.bg,
                border: `1px solid ${currentVariant.border}`,
                color: currentVariant.text,
                boxShadow: !isDisabled ? currentVariant.shadow : 'none',
            }}
            {...props}
        >
            {/* Hover glow effect */}
            <motion.div
                className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200"
                style={{
                    background: currentVariant.hoverBg,
                }}
                whileHover={{ opacity: 1 }}
            />

            {/* Content */}
            <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                    <Loader2 className={`${currentSize.iconSize} animate-spin`} />
                ) : (
                    <>
                        {Icon && iconPosition === 'left' && <Icon className={currentSize.iconSize} />}
                        {children}
                        {Icon && iconPosition === 'right' && <Icon className={currentSize.iconSize} />}
                    </>
                )}
            </span>

            {/* Bottom glow line */}
            {!isDisabled && (
                <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px opacity-50"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${currentVariant.text}, transparent)`,
                    }}
                />
            )}
        </motion.button>
    );
};

export default NeonButton;
