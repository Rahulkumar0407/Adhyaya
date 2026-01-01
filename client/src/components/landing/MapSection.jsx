import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Navigation } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function MapSection() {
    const sectionRef = useRef(null);
    const cardsRef = useRef([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Stagger animation for checkpoint cards
            gsap.from(cardsRef.current, {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
                x: 100,
                opacity: 0,
                duration: 0.6,
                stagger: 0.15,
                ease: 'power3.out',
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const checkpoints = [
        {
            id: 1,
            icon: '📍',
            title: 'Start Point',
            subtitle: 'Your Journey Begins',
            active: false,
            color: 'from-slate-100 to-slate-200',
            borderColor: 'border-slate-300',
        },
        {
            id: 2,
            icon: '🛣️',
            title: 'DSA Station',
            subtitle: 'Algorithms ki Gali',
            active: true,
            color: 'from-sky-400 to-blue-500',
            borderColor: 'border-sky-400',
            image: true,
        },
        {
            id: 3,
            icon: '🏗️',
            title: 'System Design Chowk',
            subtitle: 'Architecture ka Adda',
            active: false,
            color: 'from-purple-100 to-purple-200',
            borderColor: 'border-purple-300',
        },
        {
            id: 4,
            icon: '🎡',
            title: 'CS Fundamentals Park',
            subtitle: 'OS/DBMS ka Maidan',
            active: false,
            color: 'from-amber-100 to-orange-200',
            borderColor: 'border-amber-300',
        },
    ];

    return (
        <section
            ref={sectionRef}
            className="py-16 lg:py-24 bg-gradient-to-b from-white to-sky-50"
        >
            <div className="max-w-desktop mx-auto px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-sm font-bold text-slate-600 tracking-wider uppercase">
                            Explore Your Map
                        </span>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200 text-sm font-medium text-slate-700 hover:shadow-md transition-shadow">
                        <MapPin className="w-4 h-4 text-babua-primary" />
                        Tech City Tour
                    </button>
                </div>

                {/* Horizontal Map Path */}
                <div className="relative">
                    {/* Connecting path line */}
                    <div className="absolute top-1/2 left-0 right-0 h-2 bg-gradient-to-r from-slate-200 via-sky-300 to-slate-200 rounded-full -translate-y-1/2 z-0"></div>

                    {/* Checkpoint Cards */}
                    <div className="relative z-10 flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory lg:overflow-visible lg:justify-between">
                        {checkpoints.map((checkpoint, idx) => (
                            <div
                                key={checkpoint.id}
                                ref={(el) => (cardsRef.current[idx] = el)}
                                className={`
                                    snap-center flex-shrink-0 w-64 lg:w-auto lg:flex-1
                                    bg-gradient-to-br ${checkpoint.color}
                                    rounded-2xl p-5 border-2 ${checkpoint.borderColor}
                                    shadow-lg cursor-pointer
                                    transform transition-all duration-300
                                    hover:scale-105 hover:shadow-xl
                                    ${checkpoint.active ? 'ring-4 ring-sky-300 ring-opacity-50' : ''}
                                `}
                            >
                                {checkpoint.image ? (
                                    // DSA Station with road illustration
                                    <div className="text-center">
                                        <div className="w-full h-24 bg-slate-700 rounded-xl mb-4 overflow-hidden relative">
                                            {/* Road illustration */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-1 h-full bg-amber-400"></div>
                                            </div>
                                            <div className="absolute top-2 left-2 right-2 h-1 bg-white/30 rounded"></div>
                                            <div className="absolute bottom-2 left-2 right-2 h-1 bg-white/30 rounded"></div>
                                            {/* Stars */}
                                            <div className="absolute top-3 left-4 text-xs">⭐</div>
                                            <div className="absolute top-5 right-6 text-xs">✨</div>
                                            <div className="absolute bottom-4 left-8 text-xs">⭐</div>
                                        </div>
                                        <h3 className="font-bold text-white text-lg">{checkpoint.title}</h3>
                                        <p className="text-white/80 text-sm">{checkpoint.subtitle}</p>
                                    </div>
                                ) : (
                                    // Regular checkpoint card
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-xl shadow-md flex items-center justify-center text-3xl">
                                            {checkpoint.icon}
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg">{checkpoint.title}</h3>
                                        <p className="text-slate-600 text-sm">{checkpoint.subtitle}</p>
                                    </div>
                                )}

                                {/* Active indicator */}
                                {checkpoint.active && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                        <Navigation className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
