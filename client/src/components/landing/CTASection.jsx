import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flag } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function CTASection() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.cta-content > *', {
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
        <section ref={sectionRef} className="py-16 md:py-20 lg:py-32 relative overflow-hidden" style={{
            backgroundImage: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
            backgroundColor: '#ffffff'
        }}>
            <div className="container-babua">
                <div className="cta-content text-center max-w-2xl mx-auto">
                    {/* Flag icon */}
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-lg animate-float">
                        <Flag className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
                    </div>

                    {/* Heading */}
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
                        <span className="text-gray-900">Welcome to</span>{' '}
                        <span className="text-green-600">Placement Nagar</span>
                    </h2>

                    {/* Subtext */}
                    <p className="text-gray-600 text-base md:text-lg lg:text-xl mb-8 md:mb-10 leading-relaxed">
                        Babua, ab interview tumhara hai. Your dream offer letter is waiting.
                    </p>

                    {/* CTA Button */}
                    <Link 
                        to="/register" 
                        className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-blue-600 text-white font-semibold rounded-lg md:rounded-full text-base md:text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                        Start Your Ride 🚀
                    </Link>

                    {/* Supporting text */}
                    <div className="mt-8 md:mt-10">
                        <p className="text-sm md:text-base text-gray-500">
                            Join <span className="font-bold text-gray-900">10,000+</span> Students today
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
