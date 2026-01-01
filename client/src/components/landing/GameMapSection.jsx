import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const mapStops = [
    {
        id: 1,
        title: 'Start Point',
        subtitle: 'Your Journey Begins',
        icon: '📍',
        active: false,
        color: 'bg-muted',
    },
    {
        id: 2,
        title: 'DSA Station',
        subtitle: 'Algorithms ki Gali',
        icon: '🛣️',
        active: true,
        isRoad: true,
    },
    {
        id: 3,
        title: 'System Design Chowk',
        subtitle: 'Architecture ka Adda',
        icon: '🏗️',
        active: false,
        color: 'bg-purple-100',
    },
    {
        id: 4,
        title: 'CS Fundamentals Park',
        subtitle: 'OS/DBMS ka Maidan',
        icon: '⚙️',
        active: false,
        color: 'bg-amber-100',
    },
];

export default function GameMapSection() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Stagger animation for cards
            gsap.from('.map-card', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
                y: 40,
                opacity: 0,
                duration: 0.6,
                stagger: 0.15,
                ease: 'power3.out',
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-12 md:py-16 lg:py-24 bg-white"
        >
            <div className="container-babua">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-8 md:mb-12">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs md:text-sm font-bold text-gray-700 tracking-wider uppercase">
                            EXPLORE YOUR MAP
                        </span>
                    </div>
                    <button className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-blue-100 rounded-lg md:rounded-full text-blue-600 text-xs md:text-sm font-medium hover:bg-blue-200 transition-all">
                        <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Tech City Tour</span>
                        <span className="sm:hidden">Tour</span>
                    </button>
                </div>

                {/* Map Path - Horizontal Scrollable */}
                <div className="relative">
                    {/* Horizontal Scrollable Container */}
                    <div className="overflow-x-auto pb-4 hide-scrollbar">
                        <div className="flex gap-4 md:gap-6 min-w-max">
                            {/* Start Point */}
                            <Link
                                to="/patterns"
                                className="flex flex-col items-center min-w-[120px] md:min-w-[150px]"
                            >
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-full flex items-center justify-center mb-3 md:mb-4 shadow-lg">
                                    <MapPin className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                </div>
                                <button className="px-4 md:px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg md:rounded-full text-xs md:text-sm">
                                    Start Point
                                </button>
                            </Link>

                            {/* Dashed Line Connector */}
                            <div className="flex items-center px-2">
                                <div className="w-8 md:w-16 h-0.5 border-t-2 border-dashed border-gray-400"></div>
                            </div>

                            {/* DSA Station */}
                            <Link
                                to="/patterns"
                                className="map-card bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg min-w-[200px] md:min-w-[280px] hover:shadow-xl transition-all"
                            >
                                {/* Road Image */}
                                <div className="w-full h-24 md:h-32 bg-gray-800 rounded-lg md:rounded-xl mb-3 md:mb-4 overflow-hidden relative">
                                    {/* Road perspective effect */}
                                    <div className="absolute inset-0">
                                        {/* Road lines converging to center */}
                                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-yellow-400 transform -skew-y-12"></div>
                                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-yellow-300 transform -skew-y-6"></div>
                                        
                                        {/* Traffic lights on sides */}
                                        <div className="absolute top-2 left-2 w-3 h-8 md:w-4 md:h-10 bg-red-500 rounded-full"></div>
                                        <div className="absolute top-2 right-2 w-3 h-8 md:w-4 md:h-10 bg-yellow-400 rounded-full"></div>
                                        
                                        {/* Road markings */}
                                        <div className="absolute top-1/4 left-1/4 w-1 h-2 bg-white opacity-50"></div>
                                        <div className="absolute top-1/4 right-1/4 w-1 h-2 bg-white opacity-50"></div>
                                        <div className="absolute bottom-1/4 left-1/3 w-1 h-2 bg-white opacity-50"></div>
                                        <div className="absolute bottom-1/4 right-1/3 w-1 h-2 bg-white opacity-50"></div>
                                    </div>
                                </div>
                                <h3 className="font-bold text-blue-600 text-base md:text-lg mb-1">{mapStops[1].title}</h3>
                                <p className="text-gray-500 text-xs md:text-sm">{mapStops[1].subtitle}</p>
                            </Link>

                            {/* More stations (partially visible) */}
                            {mapStops.slice(2).map((stop) => (
                                <div key={stop.id} className="flex items-center">
                                    <div className="w-2 h-2 border-t-2 border-dashed border-gray-400 mr-2"></div>
                                    <Link
                                        to="/patterns"
                                        className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg min-w-[200px] md:min-w-[280px] hover:shadow-xl transition-all opacity-60"
                                    >
                                        <div className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 ${stop.color || 'bg-gray-100'} rounded-xl flex items-center justify-center text-2xl md:text-3xl`}>
                                            {stop.icon}
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-base md:text-lg mb-1">{stop.title}</h3>
                                        <p className="text-gray-500 text-xs md:text-sm">{stop.subtitle}</p>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
