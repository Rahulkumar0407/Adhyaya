import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function HeroIllustration() {
    const containerRef = useRef(null);
    const rickshawRef = useRef(null);
    const bubbleRef = useRef(null);
    const cloudRef1 = useRef(null);
    const cloudRef2 = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Floating rickshaw animation
            gsap.to(rickshawRef.current, {
                y: -15,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });

            // Speech bubble subtle bounce
            gsap.to(bubbleRef.current, {
                y: -8,
                duration: 2.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: 0.3,
            });

            // Cloud animations
            gsap.to(cloudRef1.current, {
                x: 20,
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });

            gsap.to(cloudRef2.current, {
                x: -15,
                duration: 5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full max-w-xl mx-auto"
        >
            {/* Background with sky gradient */}
            <div className="relative bg-gradient-to-b from-sky-200 via-sky-100 to-sky-50 rounded-3xl p-8 pt-16 pb-12 shadow-xl overflow-hidden">

                {/* Decorative clouds */}
                <div
                    ref={cloudRef1}
                    className="absolute top-6 left-6 w-16 h-8 bg-white rounded-full opacity-80 shadow-sm"
                >
                    <div className="absolute -left-2 top-2 w-8 h-6 bg-white rounded-full"></div>
                    <div className="absolute -right-2 top-2 w-10 h-6 bg-white rounded-full"></div>
                </div>

                <div
                    ref={cloudRef2}
                    className="absolute top-12 right-8 w-12 h-6 bg-white rounded-full opacity-70 shadow-sm"
                >
                    <div className="absolute -left-2 top-1 w-6 h-5 bg-white rounded-full"></div>
                    <div className="absolute -right-1 top-1 w-7 h-5 bg-white rounded-full"></div>
                </div>

                {/* Speech Bubble */}
                <div
                    ref={bubbleRef}
                    className="relative bg-white rounded-2xl px-6 py-4 mb-6 shadow-lg mx-auto max-w-sm"
                >
                    <p className="text-slate-700 font-medium text-center text-sm md:text-base">
                        "Babua, interview crack karna chahte ho?"
                    </p>
                    {/* Bubble tail */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white transform rotate-45 shadow-lg"></div>

                    {/* Mentor avatar */}
                    <div className="absolute -top-5 -right-3 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 border-4 border-white shadow-lg flex items-center justify-center">
                        <span className="text-2xl">👨‍🏫</span>
                    </div>
                </div>

                {/* Auto Rickshaw Illustration */}
                <div ref={rickshawRef} className="relative flex justify-center mt-4">
                    <div className="relative">
                        {/* Main rickshaw body */}
                        <div className="relative w-72 h-48">
                            {/* Rickshaw base - Green body */}
                            <div className="absolute bottom-8 left-8 right-8 h-28 bg-gradient-to-b from-emerald-400 to-emerald-500 rounded-t-3xl rounded-b-lg shadow-lg">
                                {/* Driver cabin */}
                                <div className="absolute -left-2 top-0 w-20 h-full bg-gradient-to-b from-amber-400 to-amber-500 rounded-t-2xl rounded-bl-lg">
                                    {/* Windshield */}
                                    <div className="absolute top-2 left-2 right-2 h-12 bg-sky-200 rounded-t-xl border-2 border-amber-600"></div>
                                    {/* Driver emoji */}
                                    <div className="absolute top-14 left-1/2 -translate-x-1/2 text-2xl">👨</div>
                                </div>

                                {/* Passenger area stripes */}
                                <div className="absolute right-4 top-4 bottom-4 left-24 bg-amber-400 rounded-lg overflow-hidden">
                                    <div className="h-full w-full flex flex-col justify-evenly">
                                        <div className="h-1 bg-amber-500"></div>
                                        <div className="h-1 bg-amber-500"></div>
                                        <div className="h-1 bg-amber-500"></div>
                                    </div>
                                </div>

                                {/* Canopy */}
                                <div className="absolute -top-3 left-20 right-2 h-4 bg-emerald-600 rounded-t-lg"></div>
                            </div>

                            {/* Wheels */}
                            <div className="absolute bottom-2 left-10 w-12 h-12 bg-slate-700 rounded-full border-4 border-slate-500 flex items-center justify-center">
                                <div className="w-4 h-4 bg-slate-400 rounded-full"></div>
                            </div>
                            <div className="absolute bottom-2 right-12 w-12 h-12 bg-slate-700 rounded-full border-4 border-slate-500 flex items-center justify-center">
                                <div className="w-4 h-4 bg-slate-400 rounded-full"></div>
                            </div>
                            <div className="absolute bottom-2 right-4 w-10 h-10 bg-slate-700 rounded-full border-4 border-slate-500 flex items-center justify-center">
                                <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                            </div>

                            {/* Headlight */}
                            <div className="absolute bottom-14 left-4 w-4 h-4 bg-yellow-300 rounded-full shadow-lg shadow-yellow-300/50"></div>
                        </div>

                        {/* Road/shadow */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-60 h-3 bg-slate-300/50 rounded-full blur-sm"></div>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute bottom-4 left-4 text-2xl animate-bounce-slow">🌟</div>
                <div className="absolute top-20 right-4 text-xl animate-wiggle">✨</div>
            </div>
        </div>
    );
}
