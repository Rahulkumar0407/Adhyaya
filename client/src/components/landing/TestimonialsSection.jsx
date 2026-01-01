import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Coffee } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
    {
        id: 1,
        text: "Babua saved my life! The LLD section is pure gold. Amazon cracked in 2 months!",
        name: "Rahul",
        role: "SDE-1",
        avatar: "👨‍💻",
    },
    {
        id: 2,
        text: "DBMS ka Godown was so fun to learn. Finally understood Joins without falling asleep.",
        name: "Priya",
        role: "Data Engineer",
        avatar: "👩‍💻",
    },
];

export default function TestimonialsSection() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.testimonial-card', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                },
                y: 40,
                opacity: 0,
                duration: 0.6,
                stagger: 0.2,
                ease: 'power3.out',
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-12 md:py-16 lg:py-24 bg-white">
            <div className="container-babua">
                {/* Section Header */}
                <div className="flex items-center gap-2 md:gap-3 mb-8 md:mb-12">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 rounded-lg md:rounded-xl flex items-center justify-center">
                        <Coffee className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                    </div>
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Chai Tapri Talks</h2>
                </div>

                {/* Testimonials Grid - Two Cards */}
                <div className="grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={testimonial.id}
                            className="testimonial-card bg-white rounded-xl md:rounded-2xl p-5 md:p-6 lg:p-8 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-start gap-4">
                                {/* Avatar on left for first, right for second */}
                                {index === 0 && (
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-2xl md:text-3xl flex-shrink-0">
                                        {testimonial.avatar}
                                    </div>
                                )}
                                
                                {/* Quote text */}
                                <div className="flex-1">
                                    <p className="text-gray-700 text-sm md:text-base lg:text-lg leading-relaxed mb-4">
                                        "{testimonial.text}"
                                    </p>
                                    
                                    {/* Author info - aligned right */}
                                    <div className="text-right">
                                        <p className="text-gray-500 text-xs md:text-sm">- {testimonial.name}, {testimonial.role}</p>
                                    </div>
                                </div>

                                {/* Avatar on right for second */}
                                {index === 1 && (
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-2xl md:text-3xl flex-shrink-0">
                                        {testimonial.avatar}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
