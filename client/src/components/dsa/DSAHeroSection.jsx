import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function DSAHeroSection() {
    const heroRef = useRef(null);
    const scooterRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Floating animation for scooter
            gsap.to(scooterRef.current, {
                y: -10,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={heroRef}
            className="py-12 md:py-16 bg-gradient-to-b from-white via-blue-50/30 to-white"
        >
            <div className="container-babua">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left Content */}
                    <div className="order-2 lg:order-1">
                        {/* NEW BATCH Banner */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider">
                                NEW BATCH STARTING
                            </span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                            <span className="text-blue-900">Babua, DSA se</span>{' '}
                            <span className="text-blue-600">dar</span>{' '}
                            <span className="text-blue-900">lagta hai?</span>
                        </h1>

                        {/* Description */}
                        <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed max-w-lg">
                            Chinta mat kar, hum hain na. Join the road journey to conquer algorithms together with desi style and easy logic.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                            <Link
                                to="/dsa/roadmap"
                                className="px-6 md:px-8 py-3 md:py-4 bg-blue-600 text-white font-semibold rounded-lg md:rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg text-center"
                            >
                                Start DSA Ride 🚀
                            </Link>
                            <Link
                                to="/dsa/roadmap"
                                className="px-6 md:px-8 py-3 md:py-4 bg-white border-2 border-gray-300 text-blue-900 font-semibold rounded-lg md:rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg text-center"
                            >
                                View Roadmap 🗺️
                            </Link>
                        </div>
                    </div>

                    {/* Right Illustration */}
                    <div className="order-1 lg:order-2">
                        <div className="relative rounded-3xl p-6 md:p-8 pt-12 md:pt-16 pb-8 md:pb-12 overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-white shadow-xl">
                            {/* Speech Bubble */}
                            <div className="relative mb-6 md:mb-8">
                                <div className="bg-white rounded-2xl px-4 md:px-6 py-3 md:py-4 shadow-lg mx-auto max-w-xs md:max-w-sm">
                                    <p className="text-gray-800 font-medium text-center text-sm md:text-base">
                                        "Arrays toh bas shuruwat hai!"
                                    </p>
                                    {/* Bubble tail */}
                                    <div className="absolute -bottom-2 md:-bottom-3 left-1/2 -translate-x-1/2 w-4 md:w-6 h-4 md:h-6 bg-white transform rotate-45"></div>
                                </div>
                            </div>

                            {/* Yellow Scooter Illustration */}
                            <div ref={scooterRef} className="relative flex justify-center">
                                <div className="relative w-56 md:w-72 h-40 md:h-48">
                                    {/* Scooter body - Yellow */}
                                    <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 w-48 md:w-64 h-32 md:h-40">
                                        {/* Main body */}
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 md:w-52 h-24 md:h-28 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-t-3xl rounded-b-lg shadow-lg">
                                            {/* Seat */}
                                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 md:w-20 h-4 bg-yellow-600 rounded-full"></div>
                                            {/* Handlebar */}
                                            <div className="absolute top-2 left-2 w-2 h-8 md:h-10 bg-yellow-600 rounded-full"></div>
                                            <div className="absolute top-2 right-2 w-2 h-8 md:h-10 bg-yellow-600 rounded-full"></div>
                                        </div>

                                        {/* Wheels */}
                                        <div className="absolute bottom-0 left-4 md:left-6 w-12 md:w-14 h-12 md:h-14 bg-slate-700 rounded-full border-4 border-slate-500 flex items-center justify-center">
                                            <div className="w-4 md:w-5 h-4 md:h-5 bg-slate-400 rounded-full"></div>
                                        </div>
                                        <div className="absolute bottom-0 right-4 md:right-6 w-12 md:w-14 h-12 md:h-14 bg-slate-700 rounded-full border-4 border-slate-500 flex items-center justify-center">
                                            <div className="w-4 md:w-5 h-4 md:h-5 bg-slate-400 rounded-full"></div>
                                        </div>

                                        {/* Headlight */}
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 md:w-5 h-4 md:h-5 bg-yellow-300 rounded-full shadow-lg shadow-yellow-300/50"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

