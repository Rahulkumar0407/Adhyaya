import React from 'react';

const TITLES = {
    'chai-pe-babua': { emoji: '☕', label: 'Chai-Pe Babua', color: 'from-amber-600 to-orange-500' },
    'pakka-babua': { emoji: '🔥', label: 'Pakka Babua', color: 'from-orange-500 to-red-500' },
    'legend-babua': { emoji: '👑', label: 'Legend Babua', color: 'from-yellow-400 to-amber-500' },
    'silent-babua': { emoji: '🧠', label: 'Silent Babua', color: 'from-purple-500 to-violet-600' }
};

export default function BabuaTitleBadge({ title, size = 'md', showLabel = true }) {
    const titleData = TITLES[title];

    if (!titleData) return null;

    const sizeClasses = {
        sm: 'text-[10px] px-1.5 py-0.5',
        md: 'text-xs px-2 py-1',
        lg: 'text-sm px-3 py-1.5'
    };

    return (
        <span className={`inline-flex items-center gap-1 bg-gradient-to-r ${titleData.color} bg-opacity-20 rounded-full ${sizeClasses[size]} font-medium text-white/90 border border-white/10`}>
            <span>{titleData.emoji}</span>
            {showLabel && <span>{titleData.label}</span>}
        </span>
    );
}

export function BabuaTitleList({ titles, maxDisplay = 3 }) {
    if (!titles || titles.length === 0) return null;

    const displayTitles = titles.slice(0, maxDisplay);
    const remaining = titles.length - maxDisplay;

    return (
        <div className="flex flex-wrap gap-1">
            {displayTitles.map((title, index) => (
                <BabuaTitleBadge
                    key={title.titleId || index}
                    title={title.titleId || title}
                    size="sm"
                    showLabel={false}
                />
            ))}
            {remaining > 0 && (
                <span className="text-[10px] text-amber-100/40 px-1.5 py-0.5">
                    +{remaining} more
                </span>
            )}
        </div>
    );
}
