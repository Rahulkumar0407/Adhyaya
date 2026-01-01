import { Link } from 'react-router-dom';
import { Users, Code2, Building2 } from 'lucide-react';

const features = [
    {
        icon: Users,
        title: 'Live Bakaiti (Mock Interviews)',
        description: 'Dari ke aage jeet hai! Google aur Amazon wale bhaiya-didi se 1:1 practice karo. Real feedback milega, gyaan nahi.',
        link: '/pods',
        linkText: 'SLOT BOOK KARO',
        linkColor: 'text-orange-500',
        iconColorClass: 'group-hover:text-orange-500',
    },
    {
        icon: Code2,
        title: 'DSA Ka Jugaad',
        description: 'Idhar udhar mat bhatko. Love Babbar aur Striver ki sheets follow karo. Progress track karo aur master ban jao.',
        link: '/patterns',
        linkText: 'SOLVE KARNA SHURU KARO',
        linkColor: 'text-yellow-500',
        iconColorClass: 'group-hover:text-yellow-500',
    },
    {
        icon: Building2,
        title: 'Company Ka Naksha',
        description: 'TCS ho ya Google, sabka rasta alag hai. Hum batayenge kab kya padhna hai. Taiyari ekdum solid hogi.',
        link: '/courses',
        linkText: 'NAKSHA DEKHO',
        linkColor: 'text-orange-500',
        iconColorClass: 'group-hover:text-purple-500',
    },
];

export default function FeaturesSection() {
    return (
        <section className="py-16 md:py-24 bg-[#0a0a0a]">
            <div className="container-babua">
                {/* Section Heading */}
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                        <span className="text-white">Sab Kuch Milega, Bas</span>
                    </h2>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold italic mb-4">
                        <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-600 bg-clip-text text-transparent">
                            Mehnat Karna Hai
                        </span>
                    </h2>
                    {/* Squiggly underline */}
                    <div className="flex justify-center mb-6">
                        <svg width="200" height="12" viewBox="0 0 200 12" fill="none">
                            <path
                                d="M2 6 Q 12 2, 22 6 T 42 6 T 62 6 T 82 6 T 102 6 T 122 6 T 142 6 T 162 6 T 182 6 T 198 6"
                                stroke="url(#squiggle-gradient)"
                                strokeWidth="3"
                                fill="none"
                                strokeLinecap="round"
                            />
                            <defs>
                                <linearGradient id="squiggle-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#facc15" />
                                    <stop offset="50%" stopColor="#f97316" />
                                    <stop offset="100%" stopColor="#ea580c" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
                        Desi engineers ke liye banaya gaya complete toolset. Mushkil cheezon ko asaan banate hain, wo bhi apni bhasha mein.
                    </p>
                </div>

                {/* Feature Cards - Dark Background with Animated Border */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {features.map((feature, index) => {
                        const IconComponent = feature.icon;
                        return (
                            <div
                                key={index}
                                className="relative group"
                            >
                                {/* Animated gradient border */}
                                <div
                                    className="absolute -inset-[2px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{
                                        background: 'linear-gradient(45deg, #f97316, #eab308, #a855f7, #f97316)',
                                        backgroundSize: '300% 300%',
                                        animation: 'gradient-rotate 3s linear infinite',
                                    }}
                                ></div>

                                {/* Card content */}
                                <div className="relative bg-[#151515] rounded-3xl p-6 md:p-8 transition-all duration-300 group-hover:-translate-y-2 h-full">
                                    {/* Icon */}
                                    <div className="w-12 h-12 bg-[#252525] rounded-xl flex items-center justify-center mb-6 border border-gray-700/50 transition-all duration-300 group-hover:border-orange-500/50 group-hover:bg-[#2a2a2a]">
                                        <IconComponent className={`w-6 h-6 text-gray-400 transition-colors duration-300 ${feature.iconColorClass}`} />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-white mb-4">
                                        {feature.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                        {feature.description}
                                    </p>

                                    {/* Button (Disabled Link) */}
                                    <div
                                        className={`inline-flex items-center gap-2 ${feature.linkColor} font-semibold text-sm uppercase tracking-wide transition-colors cursor-default`}
                                    >
                                        {feature.linkText}
                                        <span className="text-lg">→</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* CSS for animated gradient border */}
            <style>{`
                @keyframes gradient-rotate {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </section>
    );
}




