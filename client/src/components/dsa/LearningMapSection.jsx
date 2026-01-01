import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Lock, Salad, Link2, Layers, TreePine } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stations = [
    {
        id: 1,
        label: 'Easy Station 1',
        title: 'Start Point',
        description: 'Arrays & Strings ki duniya.',
        icon: Salad,
        progress: 100,
        status: 'completed',
        buttonText: 'Revisit Station 🔄',
        buttonColor: 'bg-green-600',
    },
    {
        id: 2,
        label: 'Medium Station 2',
        title: 'Linked List Nagar',
        description: 'Nodes ko connect karna seekho.',
        icon: Link2,
        progress: 40,
        status: 'current',
        buttonText: 'Enter Station →',
        buttonColor: 'bg-blue-600',
    },
    {
        id: 3,
        label: 'Medium Station 3',
        title: 'Stack & Queue Chowk',
        description: 'LIFO aur FIFO ka khel.',
        icon: Layers,
        progress: 0,
        status: 'locked',
        buttonText: 'Locked 🔒',
        buttonColor: 'bg-gray-400',
    },
    {
        id: 4,
        label: 'Hard Station 4',
        title: 'Tree Jungle',
        description: 'Recursion ke ped ped...',
        icon: TreePine,
        progress: 0,
        status: 'locked',
        buttonText: 'Locked 🔒',
        buttonColor: 'bg-gray-400',
    },
];

export default function LearningMapSection() {
    const sectionRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    useEffect(() => {
        const ctx = gsap.context(() => {
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

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 320; // Width of card + gap
            const currentScroll = scrollContainerRef.current.scrollLeft;
            const newScroll = direction === 'left' 
                ? currentScroll - scrollAmount 
                : currentScroll + scrollAmount;
            
            scrollContainerRef.current.scrollTo({
                left: newScroll,
                behavior: 'smooth'
            });

            // Update scroll buttons
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                    setCanScrollLeft(scrollLeft > 0);
                    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
                }
            }, 100);
        }
    };

    return (
        <section
            ref={sectionRef}
            className="py-12 md:py-16 lg:py-24 bg-white"
        >
            <div className="container-babua">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            Your Learning Map 🗺️
                        </h2>
                        <p className="text-gray-600 text-sm md:text-base">
                            Apni manzil door nahi hai, bas chalte raho.
                        </p>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="hidden md:flex items-center gap-2">
                        <button
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className={`p-2 rounded-full border-2 transition-all ${
                                canScrollLeft 
                                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
                                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                            }`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className={`p-2 rounded-full border-2 transition-all ${
                                canScrollRight 
                                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
                                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                            }`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Horizontal Scrollable Cards */}
                <div className="relative">
                    <div
                        ref={scrollContainerRef}
                        className="overflow-x-auto pb-4 hide-scrollbar scroll-smooth"
                        onScroll={() => {
                            if (scrollContainerRef.current) {
                                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                                setCanScrollLeft(scrollLeft > 0);
                                setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
                            }
                        }}
                    >
                        <div className="flex gap-4 md:gap-6 min-w-max">
                            {stations.map((station, index) => {
                                const IconComponent = station.icon;
                                const isCompleted = station.status === 'completed';
                                const isCurrent = station.status === 'current';
                                const isLocked = station.status === 'locked';

                                return (
                                    <div key={station.id} className="relative">
                                        {/* Current Location Label */}
                                        {isCurrent && (
                                            <div className="absolute -top-6 left-0 right-0 z-10 flex justify-center">
                                                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                                                    CURRENT LOCATION
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div
                                            className="map-card bg-white rounded-xl md:rounded-2xl p-5 md:p-6 shadow-lg min-w-[280px] md:min-w-[320px] hover:shadow-xl transition-all relative"
                                        >
                                            {/* Status Badge */}
                                            {isCompleted && (
                                                <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            )}

                                        {/* Label */}
                                        <div className="mb-3">
                                            <span className={`text-xs font-bold ${
                                                station.label.includes('Easy') ? 'text-green-600' :
                                                station.label.includes('Medium') ? 'text-blue-600' :
                                                'text-red-600'
                                            }`}>
                                                {station.label}
                                            </span>
                                        </div>

                                        {/* Icon */}
                                        <div className={`w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                                            isCompleted ? 'bg-green-100' :
                                            isCurrent ? 'bg-blue-100' :
                                            'bg-gray-100'
                                        }`}>
                                            <IconComponent className={`w-8 h-8 md:w-10 md:h-10 ${
                                                isCompleted ? 'text-green-600' :
                                                isCurrent ? 'text-blue-600' :
                                                'text-gray-400'
                                            }`} />
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 text-center">
                                            {station.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-sm md:text-base text-gray-600 mb-4 text-center">
                                            {station.description}
                                        </p>

                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs text-gray-500">Progress</span>
                                                <span className="text-xs font-semibold text-gray-700">{station.progress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        isCompleted ? 'bg-green-500' :
                                                        isCurrent ? 'bg-blue-500' :
                                                        'bg-gray-300'
                                                    }`}
                                                    style={{ width: `${station.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Button */}
                                        <button
                                            disabled={isLocked}
                                            className={`w-full ${station.buttonColor} text-white font-semibold py-2.5 md:py-3 rounded-lg md:rounded-full transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105`}
                                        >
                                            {station.buttonText}
                                        </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

