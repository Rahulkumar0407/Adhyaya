import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Columns } from 'lucide-react';
import ThreeBackground from '../common/ThreeBackground';
import gsap from 'gsap';

// Floating code snippets data
const floatingCodeSnippets = [
    { code: 'DSA ke chakkar mein Project gol ho gaya! 🤯', color: 'purple' },
    { code: 'Resume pick hi nahi ho raha bhai 😭', color: 'yellow' },
    { code: 'System Design ne dimaag ka dahi kar diya 😵‍💫', color: 'green' },
    { code: 'HR round mein kya bolne ka? 🤔', color: 'blue' },
    { code: 'LeetCode contest mein rank gir gayi 📉', color: 'orange' },
    { code: 'Off-campus apply kiya par reply nahi aaya 🚫', color: 'purple' },
    { code: 'DP samajh nahi aa raha yaar 😫', color: 'gray' },
    { code: 'Managerial round mein atak gaya 🥲', color: 'yellow' },
    { code: 'Mock interview mein blank ho gaya 😶', color: 'green' },
    { code: 'CTC sunke chakkar aa gaya 🤑', color: 'blue' },
    { code: 'CP karein ya Dev? Confused hoon! 🤷‍♂️', color: 'orange' },
    { code: 'Referral maang maang ke thak gaya 🙏', color: 'purple' },
];

// Floating Code Snippet Component
function FloatingCodeSnippet({ code, color, index }) {
    const snippetRef = useRef(null);

    useEffect(() => {
        if (!snippetRef.current) return;

        const direction = index % 2 === 0 ? -1 : 1;

        // Initial Burst Target (Push far out)
        // Push slightly outside the main content area initially
        const burstX = direction * (400 + Math.random() * 200);
        const burstY = (Math.random() - 0.5) * 500;

        // Reset to center
        gsap.set(snippetRef.current, { x: 0, y: 0, opacity: 0, scale: 0 });

        // Phase 1: Burst Out (Shoot Out)
        const tl = gsap.timeline();

        tl.to(snippetRef.current, {
            x: burstX,
            y: burstY,
            opacity: 1,
            scale: 1,
            duration: 1.5 + Math.random(), // Varied speed for natural burst
            ease: "back.out(1.2)",
            delay: 0.5 + index * 0.1 // Cascade start
        });

        // Phase 2: Perpetual Float (Keep Flowing)
        const startFloating = () => {
            if (!snippetRef.current) return;
            // Random point anywhere on screen
            const floatX = (Math.random() - 0.5) * window.innerWidth * 0.9;
            const floatY = (Math.random() - 0.5) * window.innerHeight * 0.8;
            const duration = 8 + Math.random() * 6; // Slow, floaty

            gsap.to(snippetRef.current, {
                x: floatX,
                y: floatY,
                rotation: Math.random() * 60 - 30,
                duration: duration,
                ease: "sine.inOut",
                onComplete: startFloating
            });
        };

        // Start floating chain after burst
        tl.call(startFloating);

        // Opacity Logic: Fade if over main content
        const checkOverlap = () => {
            if (!snippetRef.current) return;
            // Use quick getter for performance
            const currentX = gsap.getProperty(snippetRef.current, "x");
            const currentY = gsap.getProperty(snippetRef.current, "y");

            // Danger Zone (Main Content Area)
            // Approx 700px wide (x +/- 350), 400px tall (y +/- 200) centered from the origin (which is screen center)
            const inDangerZone = Math.abs(currentX) < 350 && Math.abs(currentY) < 200;

            gsap.to(snippetRef.current, {
                opacity: inDangerZone ? 0.1 : 0.8, // Fade almost away if blocking text, else high visibility
                duration: 0.5,
                overwrite: "auto"
            });
        };

        gsap.ticker.add(checkOverlap);

        return () => {
            gsap.killTweensOf(snippetRef.current);
            gsap.ticker.remove(checkOverlap);
        };
    }, [index]);

    const colorClasses = {
        purple: 'text-purple-400 border-purple-500/30 shadow-purple-500/20',
        yellow: 'text-yellow-300 border-yellow-500/30 shadow-yellow-500/20',
        green: 'text-green-400 border-green-500/30 shadow-green-500/20',
        blue: 'text-blue-300 border-blue-500/30 shadow-blue-500/20',
        orange: 'text-orange-400 border-orange-500/30 shadow-orange-500/20',
        gray: 'text-gray-400 border-gray-500/30 shadow-gray-500/20',
    };

    return (
        <div
            ref={snippetRef}
            className={`absolute font-mono text-xs md:text-sm px-3 py-1.5 rounded-lg bg-[#1a1a1a] border backdrop-blur-sm shadow-xl pointer-events-none z-0 whitespace-nowrap ${colorClasses[color]}`}
            style={{
                top: '55%', // Approx center of code editor
                left: '50%',
                transform: 'translate(-50%, -50%)', // Original Center
                boxShadow: `0 0 15px currentColor`,
            }}
        >
            {code}
        </div>
    );
}

export default function HeroSection() {
    const mockupRef = useRef(null);
    const sectionRef = useRef(null);

    return (
        <section
            ref={sectionRef}
            className="pt-32 md:pt-40 pb-16 md:pb-20 relative overflow-visible min-h-screen"
            style={{
                background: 'linear-gradient(to bottom, #1a1a1a 0%, #2d1f0f 100%)'
            }}
        >
            {/* Three.js Background */}
            <ThreeBackground />

            {/* Floating Code Snippets */}
            {floatingCodeSnippets.map((snippet, index) => (
                <FloatingCodeSnippet
                    key={index}
                    code={snippet.code}
                    color={snippet.color}
                    index={index}
                />
            ))}

            {/* Decorative gradient orb */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="container-babua relative z-10">
                {/* Centered Content */}
                <div className="text-center max-w-3xl mx-auto">
                    {/* Main Heading */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                        <span className="text-white">Ka Ho Babua?</span>
                        <br />
                        <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 bg-clip-text text-transparent">Placement </span>
                        <span className="text-white">Phodna</span>
                        <br />
                        <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 bg-clip-text text-transparent">Hai?</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-gray-400 text-base md:text-lg mb-8 max-w-xl mx-auto">
                        Engineering ka dard hum samajhte hain. <span className="text-white font-medium italic">Desi style</span> mein padho, interview crack karo, aur offer letter ghar le jao. Tension lene ka nahi!
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30 group"
                        >
                            Padhai Shuru Karein (Free)
                            <span className="text-lg group-hover:translate-x-1 transition-transform">🚀</span>
                        </Link>
                        <button
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#2a2a2a] border border-gray-600 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:border-orange-500"
                        >
                            Raasta Dekhein
                            <Columns className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Trust Badges - Social Proof & Zero Risk */}
                    <div className="flex items-center justify-center gap-8 text-sm mb-12">
                        <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                            <span className="text-green-500">✓</span>
                            <span>No Credit Card Req</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                            <span className="text-orange-500">🔥</span>
                            <span>Join 10k+ IIT/NIT Students</span>
                        </div>
                    </div>

                    {/* Code Editor Mockup with Hover Rotate */}
                    <div className="relative max-w-3xl mx-auto group" ref={mockupRef}>

                        {/* Glowing background shadow */}
                        <div
                            className="absolute inset-0 -inset-x-8 -inset-y-8 bg-orange-500/20 rounded-[40px] blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                        ></div>
                        <div
                            className="absolute inset-0 -inset-x-4 -inset-y-4 bg-gradient-to-br from-orange-500/30 via-transparent to-yellow-500/20 rounded-[40px] blur-2xl opacity-50"
                        ></div>

                        <div
                            className="relative bg-[#1a1a1a] rounded-3xl border border-gray-700/50 overflow-hidden transition-transform duration-500 ease-out group-hover:rotate-1 group-hover:scale-[1.02]"
                            style={{
                                boxShadow: '0 0 80px rgba(249, 115, 22, 0.3), 0 0 120px rgba(249, 115, 22, 0.15), 0 25px 80px -20px rgba(0, 0, 0, 0.6)'
                            }}
                        >
                            {/* Browser header */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-[#252525] border-b border-gray-700/50">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <div className="bg-[#1a1a1a] rounded px-4 py-1 text-xs text-gray-500">
                                        babua-lms.dev
                                    </div>
                                </div>
                            </div>

                            {/* Code Content */}
                            <div className="p-6 font-mono text-left text-xs md:text-sm bg-[#0d0d0d]">
                                <div className="space-y-1">
                                    <div><span className="text-gray-500">1</span>  <span className="text-purple-400">const</span> <span className="text-blue-300">babua</span> = <span className="text-yellow-300">require</span>(<span className="text-green-400">'placement-phodna'</span>);</div>
                                    <div><span className="text-gray-500">2</span></div>
                                    <div><span className="text-gray-500">3</span>  <span className="text-purple-400">async function</span> <span className="text-yellow-300">crackInterview</span>() {"{"}</div>
                                    <div><span className="text-gray-500">4</span>    <span className="text-purple-400">const</span> <span className="text-blue-300">dsa</span> = <span className="text-purple-400">await</span> babua.<span className="text-yellow-300">learnPatterns</span>();</div>
                                    <div><span className="text-gray-500">5</span>    <span className="text-purple-400">const</span> <span className="text-blue-300">confidence</span> = babua.<span className="text-yellow-300">practice</span>(<span className="text-orange-400">100</span>);</div>
                                    <div><span className="text-gray-500">6</span>    </div>
                                    <div><span className="text-gray-500">7</span>    <span className="text-purple-400">return</span> <span className="text-green-400">'🎉 Offer Letter Mil Gaya!'</span>;</div>
                                    <div><span className="text-gray-500">8</span>  {"}"}</div>
                                    <div><span className="text-gray-500">9</span></div>
                                    <div><span className="text-gray-500">10</span> <span className="text-yellow-300">crackInterview</span>(); <span className="text-gray-600">// Ab chalega kaam! 🚀</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Speech Bubble - Top Right */}
                        <div className="absolute -top-4 -right-4 md:right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-2 rounded-2xl text-sm font-bold shadow-lg z-10 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
                            "Ab Place Hoga Babua!"
                            <div className="absolute -bottom-2 left-6 w-4 h-4 bg-yellow-400 rotate-45"></div>
                        </div>



                        {/* Person Emoji - Bottom Right */}
                        <div className="absolute -bottom-6 -right-2 md:right-8 w-20 h-20 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center shadow-lg z-10 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                            <span className="text-4xl">😤</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
