import { useEffect, useRef } from 'react';
import { Coffee } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
    {
        id: 1,
        name: 'Rahul K.',
        role: 'SDE-1',
        company: 'Flipkart',
        quote: 'Arre babua, DP samajh nahi aa raha tha, ab makkhan hai! The roadmap is literally a lifesaver.',
        avatar: '👨‍💻',
    },
    {
        id: 2,
        name: 'Priya S.',
        role: 'Intern',
        company: 'Amazon',
        quote: 'Graph City was scary but the visual explanations made it so easy. Best desi style learning platform!',
        avatar: '👩‍💻',
    },
    {
        id: 3,
        name: 'Amit J.',
        role: 'Final Year Student',
        company: '',
        quote: 'Placement season se pehle ye course mil gaya, ab confidence level 100 pe hai. Thanks Babua!',
        avatar: '🧑‍💻',
    },
];

export default function DSATestimonialsSection() {
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
        <section ref={sectionRef} className="py-12 md:py-16 lg:py-24 bg-gray-50">
            <div className="container-babua">
                {/* Section Header */}
                <div className="text-center mb-8 md:mb-12">
                    <div className="inline-flex items-center justify-center mb-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-100 rounded-xl md:rounded-2xl flex items-center justify-center">
                            <Coffee className="w-6 h-6 md:w-7 md:h-7 text-orange-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                        Chai Tapri Talks
                    </h2>
                    <p className="text-gray-600 text-sm md:text-base">
                        Sun lo kya kehte hain woh jinhone DSA crack kiya.
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="testimonial-card bg-white rounded-xl md:rounded-2xl p-6 md:p-8 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                            {/* Quote */}
                            <div className="mb-6">
                                <div className="text-4xl text-gray-300 font-serif mb-2">"</div>
                                <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                                    {testimonial.quote}
                                </p>
                            </div>

                            {/* Author Info */}
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-2xl md:text-3xl flex-shrink-0">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm md:text-base">
                                        {testimonial.name}
                                    </p>
                                    <p className="text-gray-600 text-xs md:text-sm">
                                        {testimonial.role}
                                        {testimonial.company && ` at ${testimonial.company}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

