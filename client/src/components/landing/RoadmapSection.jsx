import { useState, useEffect, useRef } from 'react';
import { Search, Coffee, Target, Trophy } from 'lucide-react';

export default function RoadmapSection() {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    const steps = [
        {
            number: 1,
            icon: Search,
            title: 'Sikho',
            description: 'Level check karo aur sahi path chuno',
            color: 'bg-blue-500',
            iconBg: 'bg-blue-500',
        },
        {
            number: 2,
            icon: Coffee,
            title: 'Ghisai',
            description: '100+ Ghante ki solid mehnat',
            color: 'bg-orange-500',
            iconBg: 'bg-orange-500',
        },
        {
            number: 3,
            icon: Target,
            title: 'Practice',
            description: 'Sheets aur real company questions',
            color: 'bg-purple-500',
            iconBg: 'bg-purple-500',
        },
        {
            number: 4,
            icon: Trophy,
            title: 'Phod Diya',
            description: 'Top companies mein selection!',
            color: 'bg-green-500',
            iconBg: 'bg-green-500',
        },
    ];

    return (
        <section id="roadmap-section" ref={sectionRef} className="py-20 bg-[#0f0f0f] scroll-mt-24">
            <div className="container-babua">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 italic">
                        Mastery Tak Ka Safar
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Basic se lekar Boardroom tak, hum saath rahenge.
                    </p>
                </div>

                {/* Roadmap Steps */}
                <div className="relative">
                    {/* Animated Progress Line */}
                    <div className="hidden md:block absolute top-16 left-[10%] right-[10%] h-1">
                        {/* Background line (gray) */}
                        <div className="absolute inset-0 bg-gray-800 rounded-full"></div>
                        {/* Animated gradient line */}
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-orange-500 via-purple-500 to-green-500 rounded-full transition-all duration-[2000ms] ease-out"
                            style={{ width: isVisible ? '100%' : '0%' }}
                        ></div>
                    </div>

                    {/* Steps Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center text-center"
                                style={{
                                    opacity: isVisible ? 1 : 0,
                                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                                    transition: `opacity 0.5s ease ${index * 0.3}s, transform 0.5s ease ${index * 0.3}s`
                                }}
                            >
                                {/* Icon with number badge */}
                                <div className="relative mb-4">
                                    <div className={`w-16 h-16 ${step.iconBg} rounded-2xl flex items-center justify-center shadow-lg`}>
                                        <step.icon className="w-8 h-8 text-white" />
                                    </div>
                                    {/* Number badge */}
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#2a2a2a] border-2 border-[#0f0f0f] rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">{step.number}</span>
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>

                                {/* Description */}
                                <p className="text-gray-400 text-sm max-w-[180px]">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
