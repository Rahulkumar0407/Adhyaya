import { Flame, Trophy, Clock, TrendingUp, Star } from 'lucide-react';

const statsData = [
    {
        icon: Flame,
        iconBg: 'bg-orange-500/20',
        iconColor: 'text-orange-500',
        label: 'LAGATAR PADHAI (STREAK)',
        value: '12',
        unit: 'Din',
        badge: 'Ekdum Mast',
        badgeColor: 'text-green-400 bg-green-400/10',
    },
    {
        icon: Trophy,
        iconBg: 'bg-yellow-500/20',
        iconColor: 'text-yellow-500',
        label: 'GLOBAL RANKWA',
        value: '#432',
        unit: '',
        badge: 'Top 2%',
        badgeColor: 'text-green-400 bg-green-400/10',
    },
    {
        icon: Clock,
        iconBg: 'bg-purple-500/20',
        iconColor: 'text-purple-500',
        label: 'SAMAY KHARCH',
        value: '42',
        unit: 'Ghanta',
        badge: 'Total Time',
        badgeColor: 'text-gray-400 bg-gray-400/10',
    },
];

export default function StatsCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statsData.map((stat, index) => (
                <div
                    key={index}
                    className="bg-[#1f1f1f] rounded-2xl p-6 border border-gray-800 hover:border-orange-500/30 transition-all"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                            <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                        </div>
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${stat.badgeColor}`}>
                            {stat.badge}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 tracking-wider mb-1">
                        {stat.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">{stat.value}</span>
                        {stat.unit && <span className="text-lg text-gray-400">{stat.unit}</span>}
                    </div>
                </div>
            ))}
        </div>
    );
}
