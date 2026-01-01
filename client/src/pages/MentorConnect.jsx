import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import {
    Phone, Clock, Star, Shield, Users, ArrowRight,
    CheckCircle, XCircle, Sparkles, Video, MessageCircle,
    BadgeCheck, Zap, TrendingUp, Heart, Play, HelpCircle
} from 'lucide-react';
import MentorCard from '../components/mentorship/MentorCard';

// ===== THREE.JS ANIMATED BACKGROUND =====
function ConnectBackground() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 35;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // Create floating connection nodes (spheres)
        const nodes = [];
        const nodeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const colors = [0xf97316, 0xfbbf24, 0xef4444, 0x8b5cf6];

        for (let i = 0; i < 30; i++) {
            const material = new THREE.MeshBasicMaterial({
                color: colors[i % colors.length],
                transparent: true,
                opacity: 0.4 + Math.random() * 0.3,
            });
            const node = new THREE.Mesh(nodeGeometry, material);

            const side = i % 2 === 0 ? -1 : 1;
            node.position.x = side * (15 + Math.random() * 30);
            node.position.y = (Math.random() - 0.5) * 60;
            node.position.z = (Math.random() - 0.5) * 30 - 10;

            node.userData = {
                floatSpeed: Math.random() * 0.5 + 0.2,
                floatOffset: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 2 + 1,
            };

            nodes.push(node);
            scene.add(node);
        }

        // Create connection lines between nearby nodes
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xf97316,
            transparent: true,
            opacity: 0.15,
        });

        const lines = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dist = nodes[i].position.distanceTo(nodes[j].position);
                if (dist < 20) {
                    const geometry = new THREE.BufferGeometry().setFromPoints([
                        nodes[i].position,
                        nodes[j].position
                    ]);
                    const line = new THREE.Line(geometry, lineMaterial);
                    lines.push({ line, nodeA: nodes[i], nodeB: nodes[j] });
                    scene.add(line);
                }
            }
        }

        // Create floating rings
        const rings = [];
        const ringGeometry = new THREE.TorusGeometry(2, 0.08, 8, 32);
        for (let i = 0; i < 8; i++) {
            const material = new THREE.MeshBasicMaterial({
                color: i % 2 === 0 ? 0xf97316 : 0xfbbf24,
                transparent: true,
                opacity: 0.2,
            });
            const ring = new THREE.Mesh(ringGeometry, material);
            const side = i % 2 === 0 ? -1 : 1;
            ring.position.x = side * (20 + Math.random() * 20);
            ring.position.y = (Math.random() - 0.5) * 50;
            ring.position.z = -15 + Math.random() * 10;
            ring.rotation.x = Math.random() * Math.PI;
            ring.rotation.y = Math.random() * Math.PI;
            ring.userData = { rotSpeed: (Math.random() - 0.5) * 0.02 };
            rings.push(ring);
            scene.add(ring);
        }

        // Particle sparkles
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(200 * 3);
        for (let i = 0; i < 200 * 3; i += 3) {
            const side = (i / 3) % 2 === 0 ? -1 : 1;
            positions[i] = side * (10 + Math.random() * 40);
            positions[i + 1] = (Math.random() - 0.5) * 80;
            positions[i + 2] = (Math.random() - 0.5) * 40 - 15;
        }
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.08,
            transparent: true,
            opacity: 0.6,
        });
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        let animationId;
        const clock = new THREE.Clock();

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            nodes.forEach((node) => {
                node.position.y += Math.sin(elapsedTime * node.userData.floatSpeed + node.userData.floatOffset) * 0.015;
                node.scale.setScalar(1 + Math.sin(elapsedTime * node.userData.pulseSpeed) * 0.1);
            });

            // Update connection lines
            lines.forEach(({ line, nodeA, nodeB }) => {
                const positions = line.geometry.attributes.position.array;
                positions[0] = nodeA.position.x;
                positions[1] = nodeA.position.y;
                positions[2] = nodeA.position.z;
                positions[3] = nodeB.position.x;
                positions[4] = nodeB.position.y;
                positions[5] = nodeB.position.z;
                line.geometry.attributes.position.needsUpdate = true;
            });

            rings.forEach((ring) => {
                ring.rotation.x += ring.userData.rotSpeed;
                ring.rotation.y += ring.userData.rotSpeed * 0.5;
            });

            particles.rotation.y = elapsedTime * 0.01;
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            if (containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return <div ref={containerRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
}



// ===== STEP CARD COMPONENT =====
const StepCard = ({ step, title, description, icon: Icon, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className="relative group"
    >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/50 to-amber-500/50 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
        <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-orange-500/40 transition-all duration-500">
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg shadow-orange-500/30">
                {step}
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-white/10">
                <Icon className="w-7 h-7 text-orange-400" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm">{description}</p>
        </div>
    </motion.div>
);

// ===== TRUST BADGE COMPONENT =====
const TrustBadge = ({ icon: Icon, title, description }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="text-center group"
    >
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/10 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-8 h-8 text-orange-400" />
        </div>
        <h4 className="font-bold text-white mb-1">{title}</h4>
        <p className="text-sm text-slate-400">{description}</p>
    </motion.div>
);

// ===== MAIN COMPONENT =====
const MentorConnect = () => {
    const featuredMentors = [
        { id: 1, name: 'Rahul Sharma', avatar: 'RS', headline: 'SDE @ Google', expertise: ['DSA', 'System Design', 'Python'], rating: 4.9, reviews: 127, rate: 15, isOnline: true, isVerified: true },
        { id: 2, name: 'Priya Singh', avatar: 'PS', headline: 'Backend Lead @ Flipkart', expertise: ['Node.js', 'MongoDB', 'AWS'], rating: 4.8, reviews: 89, rate: 12, isOnline: true, isVerified: true },
        { id: 3, name: 'Amit Kumar', avatar: 'AK', headline: 'SDE-2 @ Microsoft', expertise: ['DSA', 'C++', 'Interview Prep'], rating: 4.9, reviews: 156, rate: 20, isOnline: false, isVerified: true },
        { id: 4, name: 'Sneha Patel', avatar: 'SP', headline: 'Full Stack @ Razorpay', expertise: ['React', 'Node.js', 'PostgreSQL'], rating: 4.7, reviews: 64, rate: 9, isOnline: true, isVerified: true },
    ];

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0a06 0%, #1a1008 50%, #0f0a06 100%)' }}>
            {/* Three.js Animated Background */}
            <ConnectBackground />

            {/* Premium Gradient Orbs */}
            <div className="fixed top-[-10%] right-[-10%] w-[60%] h-[60%] bg-orange-600/15 rounded-full blur-[150px] pointer-events-none animate-pulse" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/15 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-orange-500/5 rounded-full blur-[200px] pointer-events-none" />

            {/* ===== HERO SECTION ===== */}
            <section className="relative pt-20 pb-32 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 rounded-full text-orange-400 text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-2xl backdrop-blur-sm">
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-ping" />
                            India's Most Affordable Mentorship
                            <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] rounded-md">LIVE</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
                            <span className="text-white">Expert Guidance, Cheaper than a </span>
                            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">Chocolate 🍫</span>
                        </h1>

                        <p className="text-orange-100/60 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
                            <span className="block text-red-400 font-bold mb-2">⚠️ Don't let a bad interview cost you a ₹20 LPA offer.</span>
                            Instant guidance from mentors at <span className="text-orange-400 font-bold">Google, Microsoft</span> starting at just ₹9/min.
                            <span className="text-white font-bold ml-2">Pay only for what you use.</span>
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 mb-12">
                            <Link
                                to="/mentors/list"
                                className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black uppercase tracking-widest rounded-2xl hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:scale-105 transition-all duration-500"
                            >
                                <Users className="w-6 h-6" />
                                Find a Mentor
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                to="/doubts/ask"
                                className="inline-flex items-center gap-3 px-10 py-5 bg-cyan-500/10 border-2 border-cyan-500/50 text-cyan-400 font-black uppercase tracking-widest rounded-2xl hover:bg-cyan-500/20 hover:border-cyan-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-500"
                            >
                                <HelpCircle className="w-6 h-6" />
                                Ask a Doubt
                            </Link>

                            <button
                                onClick={() => {
                                    // Find first online mentor or mock action
                                    const onlineMentor = featuredMentors.find(m => m.isOnline);
                                    if (onlineMentor) {
                                        window.location.href = `/call/${onlineMentor.id}`;
                                    } else {
                                        // Fallback to list
                                        window.location.href = '/mentors/list?online=true';
                                    }
                                }}
                                className="inline-flex items-center gap-3 px-10 py-5 bg-emerald-500/10 border-2 border-emerald-500/50 text-emerald-400 font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-500/20 hover:border-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-500 cursor-pointer"
                            >
                                <Zap className="w-6 h-6" />
                                Instant Call
                            </button>
                        </div>

                        {/* Trust Stats */}
                        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30">
                                    <Users className="w-6 h-6 text-orange-400" />
                                </div>
                                <div className="text-left">
                                    <div className="text-2xl font-black text-white">500+</div>
                                    <div className="text-slate-500 text-sm">Verified Mentors</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                                    <Star className="w-6 h-6 text-amber-400 fill-current" />
                                </div>
                                <div className="text-left">
                                    <div className="text-2xl font-black text-white">4.8</div>
                                    <div className="text-slate-500 text-sm">Avg Rating</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                                    <Phone className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div className="text-left">
                                    <div className="text-2xl font-black text-white">10k+</div>
                                    <div className="text-slate-500 text-sm">Calls Completed</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="relative py-24 px-4">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-950/30 to-transparent pointer-events-none" />
                <div className="max-w-6xl mx-auto relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                            How It <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Works</span>
                        </h2>
                        <p className="text-orange-100/60 text-lg">Get expert help in 4 simple steps</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StepCard step={1} title="Choose a Mentor" description="Browse by expertise, ratings, and availability. Filter by price range." icon={Users} delay={0} />
                        <StepCard step={2} title="See Clear Pricing" description="Every mentor shows per-minute rate upfront. No hidden charges." icon={Clock} delay={0.1} />
                        <StepCard step={3} title="Start Your Call" description="Connect instantly or schedule for later. HD video + screen sharing." icon={Video} delay={0.2} />
                        <StepCard step={4} title="Pay Per Minute" description="Pay exactly for time used. See live cost during your call." icon={TrendingUp} delay={0.3} />
                    </div>
                </div>
            </section>

            {/* ===== FEATURED MENTORS ===== */}
            <section className="relative py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-end justify-between mb-12"
                    >
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                                Featured <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Mentors</span>
                            </h2>
                            <p className="text-orange-100/60">Top-rated mentors ready to help you</p>
                        </div>
                        <Link
                            to="/mentors/list"
                            className="hidden md:inline-flex items-center gap-2 text-orange-400 font-bold hover:text-orange-300 transition-colors"
                        >
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredMentors.map((mentor, idx) => (
                            <MentorCard
                                key={mentor.id}
                                mentor={{
                                    ...mentor,
                                    user: { name: mentor.name, avatar: mentor.avatar },
                                    ratePerMinute: mentor.rate,
                                    totalReviews: mentor.reviews,
                                    expertise: mentor.expertise
                                }}
                                onInstantCall={() => window.location.href = `/call/${mentor.id}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== TRUST SECTION ===== */}
            <section className="relative py-24 px-4">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-950/20 to-transparent pointer-events-none" />
                <div className="max-w-5xl mx-auto relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                            Trust & <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Safety</span>
                        </h2>
                        <p className="text-orange-100/60 text-lg">Your security and satisfaction is our priority</p>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-8">
                        <TrustBadge icon={BadgeCheck} title="Verified Mentors" description="Every mentor is background verified" />
                        <TrustBadge icon={Shield} title="Secure Payments" description="Razorpay powered secure processing" />
                        <TrustBadge icon={Clock} title="Fair Billing" description="Pay exactly for minutes used" />
                        <TrustBadge icon={Heart} title="Satisfaction Guarantee" description="Not happy? Get a full refund" />
                    </div>
                </div>
            </section>

            {/* ===== BECOME A MENTOR CTA ===== */}
            <section className="relative py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative bg-gradient-to-br from-orange-600/30 via-amber-600/20 to-orange-600/30 rounded-[3rem] p-12 text-center border border-white/10 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50" />
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 rounded-full mb-6 border border-white/10">
                                <Sparkles className="w-4 h-4 text-orange-400" />
                                <span className="text-white font-bold text-sm">Join 500+ Mentors</span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                                Want to Earn by Helping Students?
                            </h2>
                            <p className="text-orange-100/80 text-lg mb-10 max-w-2xl mx-auto">
                                Set your own rates, choose your hours, and help students crack interviews.
                                Earn <span className="text-emerald-400 font-bold">₹3000-15000/month</span> in your free time.
                            </p>

                            <Link
                                to="/become-mentor"
                                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black uppercase tracking-widest rounded-2xl hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] hover:scale-105 transition-all duration-500"
                            >
                                Apply as Mentor
                                <ArrowRight className="w-6 h-6" />
                            </Link>

                            <div className="flex items-center justify-center gap-8 mt-10 text-slate-300 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    <span>Flexible Hours</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    <span>Set Your Rate</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    <span>Weekly Payouts</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default MentorConnect;
