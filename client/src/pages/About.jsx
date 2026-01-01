import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, Users, BookOpen, Award, ArrowLeft, Linkedin, Sparkles, Zap, Heart } from 'lucide-react';
import gsap from 'gsap';
import ThreeBackground from '../components/common/ThreeBackground';

// Floating element for creativity
function FloatingElement({ children, delay = 0, className = "" }) {
    const ref = useRef(null);

    useEffect(() => {
        gsap.fromTo(ref.current,
            { opacity: 0, y: 50, scale: 0.8 },
            { opacity: 1, y: 0, scale: 1, duration: 1, delay, ease: "back.out(1.7)" }
        );

        gsap.to(ref.current, {
            y: -10,
            duration: 3 + Math.random() * 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: delay + 1
        });
    }, [delay]);

    return <div ref={ref} className={className}>{children}</div>;
}

export default function About() {
    const containerRef = useRef(null);

    useEffect(() => {
        // Stagger animate all sections
        gsap.fromTo(".about-section",
            { opacity: 0, y: 60 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power3.out" }
        );
    }, []);

    const challenges = [
        {
            icon: BookOpen,
            title: "Scattered Resources",
            description: "Quality learning materials scattered across multiple platforms",
            color: "from-red-500 to-orange-500"
        },
        {
            icon: Target,
            title: "No Clear Roadmap",
            description: "Confusion about what to study and in what order",
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: Award,
            title: "Interview Anxiety",
            description: "Fear due to lack of proper preparation and practice",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: Users,
            title: "No Peer Support",
            description: "Learning in isolation without a supportive community",
            color: "from-green-500 to-emerald-500"
        }
    ];

    const teamMembers = [
        {
            name: "Ishan Gupta",
            image: "https://nexagen.netlify.app/assets/Ishan-CB4uR6yC.png",
            linkedin: "https://linkedin.com/in/ishan-gupta-08686631a",
            quote: "Education should be accessible to everyone"
        },
        {
            name: "Rahul Kumar",
            image: "https://nexagen.netlify.app/assets/Rahul-sXmDOdBC.png",
            linkedin: "https://linkedin.com/in/rahulkumarmait",
            quote: "Building the future of learning"
        }
    ];

    return (
        <div
            ref={containerRef}
            className="min-h-screen relative overflow-hidden"
            style={{
                background: 'linear-gradient(to bottom, #1a1a1a 0%, #2d1f0f 50%, #1a1a1a 100%)'
            }}
        >
            {/* Three.js Background */}
            <ThreeBackground />

            {/* Decorative Orbs */}
            <div className="absolute top-20 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute top-1/2 left-0 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl -translate-x-1/2"></div>
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-orange-600/15 rounded-full blur-3xl translate-y-1/2"></div>

            <div className="relative z-10 pt-24 pb-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>

                    {/* Hero Section */}
                    <div className="about-section text-center mb-20 relative">
                        <FloatingElement delay={0.2} className="inline-block">
                            <div className="relative">
                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl blur-2xl opacity-30 scale-110"></div>
                                <div className="relative inline-flex items-center gap-4 bg-[#1a1a1a]/80 backdrop-blur-sm px-8 py-6 rounded-3xl border border-orange-500/30">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-orange-500/40">
                                        अ
                                    </div>
                                    <div className="text-left">
                                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 bg-clip-text text-transparent">
                                            ADHYAYA
                                        </h1>
                                        <p className="text-white/60 text-sm mt-1">अध्याय • A New Chapter in Learning</p>
                                    </div>
                                </div>
                            </div>
                        </FloatingElement>

                        <p className="text-xl text-white/60 max-w-2xl mx-auto mt-8">
                            Empowering India's engineering talent with <span className="text-orange-400 font-semibold">desi style</span> learning.
                            <br />
                            <span className="text-yellow-400">Har engineer ko haath mein offer letter!</span> 🚀
                        </p>
                    </div>

                    {/* Mission Section */}
                    <div className="about-section mb-16">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-[40px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative bg-[#1a1a1a]/60 backdrop-blur-md rounded-[32px] p-8 md:p-12 border border-white/10 overflow-hidden">
                                {/* Floating icons */}
                                <div className="absolute top-4 right-4 text-orange-500/20">
                                    <Sparkles className="w-24 h-24" />
                                </div>

                                <div className="relative z-10 flex flex-col md:flex-row items-start gap-8">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30">
                                        <Target className="w-10 h-10 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                            Hamara <span className="text-orange-400">Mission</span>
                                        </h2>
                                        <p className="text-lg text-white/70 leading-relaxed">
                                            ADHYAYA is on a mission to democratize quality tech education for every engineering student in India.
                                            We believe that <span className="text-orange-400 font-medium">talent has no zip code</span> — whether you're from
                                            Delhi, Patna, or a small town, you deserve the same quality preparation.
                                        </p>
                                        <p className="text-lg text-white/70 leading-relaxed mt-4">
                                            We provide <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent font-bold">100% FREE</span> pattern-centric
                                            learning with a community-driven approach — learn like you're being mentored by a senior who's been there, done that.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Challenges Section */}
                    <div className="about-section mb-16">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Students Ka <span className="text-red-400">Dard</span> 😤
                            </h2>
                            <p className="text-white/60 max-w-xl mx-auto">
                                We understand the struggles that every engineering student faces
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {challenges.map((challenge, index) => (
                                <FloatingElement
                                    key={index}
                                    delay={0.3 + index * 0.15}
                                    className="h-full"
                                >
                                    <div className="group relative h-full">
                                        <div className={`absolute inset-0 bg-gradient-to-r ${challenge.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
                                        <div className="relative h-full bg-[#1a1a1a]/60 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${challenge.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                                    <challenge.icon className="w-7 h-7 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
                                                    <p className="text-white/60">{challenge.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </FloatingElement>
                            ))}
                        </div>
                    </div>

                    {/* Vision Section */}
                    <div className="about-section mb-20">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-[40px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative bg-gradient-to-br from-orange-500/10 to-yellow-500/10 backdrop-blur-md rounded-[32px] p-8 md:p-12 border border-orange-500/20 overflow-hidden">
                                {/* Floating icons */}
                                <div className="absolute bottom-4 left-4 text-yellow-500/20">
                                    <Zap className="w-32 h-32" />
                                </div>

                                <div className="relative z-10 flex flex-col md:flex-row items-start gap-8">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/30">
                                        <Eye className="w-10 h-10 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                            Hamara <span className="text-yellow-400">Vision</span>
                                        </h2>
                                        <p className="text-lg text-white/70 leading-relaxed">
                                            We envision a future where <span className="text-yellow-400 font-medium">every engineering student in India</span> has
                                            access to world-class interview preparation, regardless of their background.
                                        </p>
                                        <p className="text-lg text-white/70 leading-relaxed mt-4">
                                            ADHYAYA aims to become the <span className="text-orange-400 font-medium">#1 free platform</span> for placement preparation,
                                            building a community of <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent font-bold">1 Million+ learners</span> who
                                            support each other and celebrate every offer letter together!
                                        </p>
                                        <div className="mt-6 inline-flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-full">
                                            <span className="text-yellow-400 font-bold">Ab placement hoga, tension nahi!</span>
                                            <span className="text-2xl">💪</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team Section */}
                    <div className="about-section">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Meet The <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">Founders</span> 👨‍💻
                            </h2>
                            <p className="text-white/60 max-w-xl mx-auto">
                                The passionate minds working to make quality education accessible to all
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                            {teamMembers.map((member, index) => (
                                <FloatingElement
                                    key={index}
                                    delay={0.5 + index * 0.2}
                                    className="w-full md:w-80"
                                >
                                    <div className="group relative">
                                        {/* Glow effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-[32px] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 scale-90"></div>

                                        <div className="relative bg-[#1a1a1a]/60 backdrop-blur-md rounded-[32px] p-8 border border-white/10 group-hover:border-orange-500/30 transition-all duration-500 text-center">
                                            {/* Photo with creative frame */}
                                            <div className="relative w-40 h-40 mx-auto mb-6">
                                                {/* Animated ring */}
                                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 animate-spin-slow opacity-50" style={{ animationDuration: '8s' }}></div>
                                                <div className="absolute inset-1 rounded-full bg-[#1a1a1a]"></div>
                                                <img
                                                    src={member.image}
                                                    alt={member.name}
                                                    className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] rounded-full object-cover"
                                                />
                                                {/* Online indicator */}
                                                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-[#1a1a1a] animate-pulse"></div>
                                            </div>

                                            {/* Name */}
                                            <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>

                                            {/* Quote */}
                                            <p className="text-white/50 text-sm italic mb-4">"{member.quote}"</p>

                                            {/* LinkedIn Button */}
                                            <a
                                                href={member.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30"
                                            >
                                                <Linkedin className="w-5 h-5" />
                                                Connect
                                            </a>
                                        </div>
                                    </div>
                                </FloatingElement>
                            ))}
                        </div>

                        {/* Made with love */}
                        <div className="text-center mt-16">
                            <p className="text-white/40 flex items-center justify-center gap-2">
                                Made with <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" /> in Bharat 🇮🇳
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom animation styles */}
            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            `}</style>
        </div>
    );
}
