import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function PracticeCTASection() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.practice-content > *', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.12,
                ease: 'power3.out',
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-12 md:py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white"
        >
            <div className="container-babua">
                <div className="practice-content max-w-4xl mx-auto">
                    {/* Dark Card */}
                    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl md:rounded-3xl p-8 md:p-12 shadow-2xl">
                        {/* Bicep Icon */}
                        <div className="flex justify-center mb-6 md:mb-8">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-3xl md:text-4xl">💪</span>
                            </div>
                        </div>

                        {/* Heading */}
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-4 md:mb-6 text-white">
                            "Babua, practice karega{' '}
                            <span className="text-blue-400">tabhi</span>{' '}
                            <span className="text-cyan-400">crack</span> karega"
                        </h2>

                        {/* Subtitle */}
                        <p className="text-gray-300 text-center text-base md:text-lg mb-8 md:mb-10 leading-relaxed">
                            Theory padh li? Ab maidan mein aao aur questions solve karo.
                        </p>

                        {/* CTA Button */}
                        <div className="flex justify-center">
                            <Link
                                to="/dsa/practice"
                                className="inline-flex items-center gap-2 px-8 md:px-10 py-3 md:py-4 bg-blue-600 text-white font-semibold rounded-lg md:rounded-full text-base md:text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-blue-700"
                            >
                                <Zap className="w-5 h-5 md:w-6 md:h-6" />
                                Practice Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

