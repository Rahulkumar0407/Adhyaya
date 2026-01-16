import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

export default function RankChangeIndicator({ direction, amount, size = 'sm' }) {
    if (!direction || direction === 'none' || amount === 0) {
        return null;
    }

    const sizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    if (direction === 'up') {
        return (
            <div className={`flex items-center gap-0.5 text-green-400 ${sizeClasses[size]}`}>
                <ArrowUp className={`${iconSizes[size]} animate-pulse`} />
                <span className="font-medium">+{amount}</span>
            </div>
        );
    }

    if (direction === 'down') {
        return (
            <div className={`flex items-center gap-0.5 text-red-400 ${sizeClasses[size]}`}>
                <ArrowDown className={iconSizes[size]} />
                <span className="font-medium">-{amount}</span>
            </div>
        );
    }

    if (direction === 'same') {
        return (
            <div className={`flex items-center gap-0.5 text-amber-100/40 ${sizeClasses[size]}`}>
                <Minus className={iconSizes[size]} />
                <span>—</span>
            </div>
        );
    }

    return null;
}
