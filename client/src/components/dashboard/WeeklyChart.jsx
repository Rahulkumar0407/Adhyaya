import { TrendingUp } from 'lucide-react';

const weeklyData = [
    { day: 'SOM', value: 45, label: 'Som' },
    { day: 'MANGAL', value: 60, label: 'Mangal' },
    { day: 'BUDH', value: 35, label: 'Budh' },
    { day: 'GURU', value: 80, label: 'Guru' },
    { day: 'SHUKR', value: 65, label: 'Shukr' },
    { day: 'SHANI', value: 90, label: 'Shani' },
    { day: 'RAVI', value: 55, label: 'Ravi' },
];

export default function WeeklyChart() {
    const maxValue = Math.max(...weeklyData.map(d => d.value));

    return (
        <div className="bg-[#1f1f1f] rounded-2xl p-6 border border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-orange-500" />
                    <div>
                        <h3 className="text-lg font-bold text-white">Hafta Ka Hisaab</h3>
                        <p className="text-sm text-gray-400">Bhaiya, ee hafta bahut mehnat kiye ho!</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-white">24h</div>
                    <div className="text-sm text-green-400">+12% pichle hafte se</div>
                </div>
            </div>

            {/* Chart */}
            <div className="relative h-40 flex items-end justify-between gap-2">
                {weeklyData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        {/* Bar */}
                        <div
                            className="w-full bg-gradient-to-t from-yellow-500/80 to-orange-400/80 rounded-t-lg transition-all duration-300 hover:from-yellow-400 hover:to-orange-300"
                            style={{ height: `${(data.value / maxValue) * 100}%` }}
                        ></div>
                        {/* Day Label */}
                        <span className="text-xs text-gray-500">{data.label}</span>
                    </div>
                ))}
            </div>

            {/* Decorative Line */}
            <svg className="absolute inset-0 w-full h-40 pointer-events-none" style={{ top: '86px' }}>
                <path
                    d={`M 0 ${100 - (weeklyData[0].value / maxValue) * 80} ${weeklyData.map((d, i) => `L ${(i + 0.5) * (100 / weeklyData.length)}% ${100 - (d.value / maxValue) * 80}`).join(' ')}`}
                    fill="none"
                    stroke="rgba(249, 115, 22, 0.5)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                />
            </svg>
        </div>
    );
}
