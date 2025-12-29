import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
    { value: '10k+', label: 'PADHAAKU BABUAS' },
    { value: '50+', label: 'DREAM NAUKRI' },
    { value: '1.2M', label: 'SAWAAL HAL' },
    { value: '92%', label: 'SELECTION PAKKA' },
];

export default function StatsSection() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.stat-item', {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-12 md:py-16"
            style={{ background: '#1a1a1a' }}
        >
            <div className="container-babua">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-item text-center">
                            <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-orange-500 mb-2">
                                {stat.value}
                            </div>
                            <div className="text-xs md:text-sm text-gray-400 tracking-wider font-medium">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
