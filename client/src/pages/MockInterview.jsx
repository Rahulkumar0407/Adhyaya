import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import * as THREE from 'three';
import {
    Home, Bell, Gift, Mic, Video, Clock, ArrowRight, Play, Users,
    CheckCircle, Star, Target, Sparkles, MessageSquare, Brain, Zap, Lock, RotateCcw, Wallet, AlertCircle, History
} from 'lucide-react';
import InterviewSession from '../components/interview/InterviewSession';
import InterviewResults from '../components/interview/InterviewResults';
import InterviewSetup from '../components/interview/InterviewSetup';

// Animated Background
function InterviewBackground() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // Create floating geometric shapes
        const shapes = [];
        const geometries = [
            new THREE.IcosahedronGeometry(1, 0),
            new THREE.OctahedronGeometry(1, 0),
            new THREE.TetrahedronGeometry(1, 0),
        ];

        const colors = [0x06b6d4, 0x8b5cf6, 0x3b82f6, 0x10b981];

        for (let i = 0; i < 20; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = new THREE.MeshBasicMaterial({
                color: colors[i % colors.length],
                wireframe: true,
                transparent: true,
                opacity: 0.15 + Math.random() * 0.1,
            });
            const mesh = new THREE.Mesh(geometry, material);

            const side = i % 2 === 0 ? -1 : 1;
            mesh.position.x = side * (20 + Math.random() * 25);
            mesh.position.y = (Math.random() - 0.5) * 50;
            mesh.position.z = (Math.random() - 0.5) * 20 - 10;

            const scale = Math.random() * 2 + 0.5;
            mesh.scale.set(scale, scale, scale);

            mesh.userData = {
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                },
                floatSpeed: Math.random() * 0.5 + 0.2,
                floatOffset: Math.random() * Math.PI * 2,
            };

            shapes.push(mesh);
            scene.add(mesh);
        }

        // Particles
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(100 * 3);
        for (let i = 0; i < 100 * 3; i += 3) {
            const side = (i / 3) % 2 === 0 ? -1 : 1;
            positions[i] = side * (15 + Math.random() * 30);
            positions[i + 1] = (Math.random() - 0.5) * 60;
            positions[i + 2] = (Math.random() - 0.5) * 30 - 10;
        }
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0x06b6d4,
            size: 0.05,
            transparent: true,
            opacity: 0.5,
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        let animationId;
        const clock = new THREE.Clock();

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            shapes.forEach((shape) => {
                shape.rotation.x += shape.userData.rotationSpeed.x;
                shape.rotation.y += shape.userData.rotationSpeed.y;
                shape.position.y += Math.sin(elapsedTime * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.01;
            });

            particles.rotation.y = elapsedTime * 0.015;
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

            // Comprehensive cleanup
            if (scene) {
                scene.traverse((object) => {
                    if (object.geometry) {
                        object.geometry.dispose();
                    }
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach(material => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                });
            }

            if (renderer) {
                renderer.dispose();
                if (containerRef.current && renderer.domElement) {
                    try {
                        containerRef.current.removeChild(renderer.domElement);
                    } catch (e) {
                        // Ignore if already removed
                    }
                }
            }
        };
    }, []);

    return <div ref={containerRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
}

// Navigation items
const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Mock Interview', href: '/mock-interview', icon: Mic, active: true },
    { name: 'Revision', href: '/revision', icon: RotateCcw },
    { name: 'Rewards', href: '/how-to-earn', icon: Gift },
    { name: 'Connect', href: '/mentors', icon: Users },
];

// Interview types
const interviewTypes = [
    {
        id: 'hr',
        title: 'HR / Behavioral',
        description: 'Practice soft skills, STAR method, and confidence building',
        icon: Users,
        color: 'from-pink-500 to-rose-500',
        bgGlow: 'bg-pink-500/20',
        duration: '30 mins',
        difficulty: 'Easy',
        questions: '6-8 behavioral questions',
        available: true,
        voiceFirst: true,
    },
    {
        id: 'dsa',
        title: 'DSA Interview',
        description: 'Complete DSA round - concepts, problem-solving, and live coding like real interviews',
        icon: Brain,
        color: 'from-cyan-500 to-blue-500',
        bgGlow: 'bg-cyan-500/20',
        duration: '45 mins',
        difficulty: 'Medium-Hard',
        questions: 'Theory + 2-3 coding problems',
        available: true,
        voiceFirst: true, // Starts with voice, can switch to code
        mixedMode: true, // Supports both voice and code
    },
    {
        id: 'system-design',
        title: 'System Design',
        description: 'Design scalable systems with mixed voice + text diagrams',
        icon: Target,
        color: 'from-purple-500 to-pink-500',
        bgGlow: 'bg-purple-500/20',
        duration: '45 mins',
        difficulty: 'Hard',
        questions: '1-2 design problems',
        available: true,
    },
];

// Companies for practice
const companies = [
    { name: 'Google', logo: '🔵' },
    { name: 'Amazon', logo: '📦' },
    { name: 'Microsoft', logo: '🪟' },
    { name: 'Meta', logo: '🔷' },
    { name: 'Apple', logo: '🍎' },
    { name: 'Netflix', logo: '🎬' },
];

// Features
const features = [
    {
        icon: Video,
        title: 'AI Video Interview',
        description: 'Practice with realistic AI interviewer',
    },
    {
        icon: Clock,
        title: 'Real-time Analysis',
        description: 'Get instant feedback on your answers',
    },
    {
        icon: Star,
        title: 'Performance Score',
        description: 'Track your improvement over time',
    },
    {
        icon: CheckCircle,
        title: 'Detailed Review',
        description: 'See model answers and explanations',
    },
];

export default function MockInterview() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const userName = user?.name?.split(' ')[0] || 'Babua';
    const [selectedType, setSelectedType] = useState(null);
    const [customRole, setCustomRole] = useState('');
    const [interviewState, setInterviewState] = useState('selection'); // selection, setup, session, results
    const [interviewResults, setInterviewResults] = useState(null);
    const [interviewConfig, setInterviewConfig] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    // Wallet/Points state
    const [walletBalance, setWalletBalance] = useState(0);
    const [isLoadingWallet, setIsLoadingWallet] = useState(false);
    const [isCharging, setIsCharging] = useState(false);
    const [walletError, setWalletError] = useState('');
    const INTERVIEW_COST = 100; // 100 babua points

    // Fetch wallet balance on mount
    useEffect(() => {
        const fetchWalletBalance = async () => {
            if (!user) return;
            setIsLoadingWallet(true);
            try {
                const response = await api.get('/wallet');
                if (response.data.success) {
                    setWalletBalance(response.data.data.balance);
                }
            } catch (error) {
                console.error('Error fetching wallet:', error);
            } finally {
                setIsLoadingWallet(false);
            }
        };
        fetchWalletBalance();
    }, [user]);

    const startInterview = async () => {
        if (!selectedType) return;
        if (selectedType === 'custom' && !customRole.trim()) return;

        // Check if user has enough points
        if (walletBalance < INTERVIEW_COST) {
            setWalletError(`Insufficient balance! You need ${INTERVIEW_COST} babua points. Current: ${walletBalance} points.`);
            return;
        }

        setIsCharging(true);
        setWalletError('');

        try {
            // Charge for interview
            const response = await api.post('/wallet/interview/charge', {
                interviewType: selectedType === 'custom' ? customRole : selectedType
            });

            if (response.data.success) {
                setWalletBalance(response.data.data.newBalance);
                setInterviewState('setup'); // Go to setup screen first
            } else {
                setWalletError(response.data.message || 'Failed to charge for interview');
            }
        } catch (error) {
            console.error('Error charging for interview:', error);
            setWalletError(error.response?.data?.message || 'Failed to start interview. Please try again.');
        } finally {
            setIsCharging(false);
        }
    };

    const handleInterviewEnd = () => {
        setInterviewState('selection');
        setSelectedType(null);
        setInterviewConfig(null);
    };

    const handleSetupComplete = (config) => {
        setInterviewConfig(config);
        setInterviewState('session');
    };

    const handleSetupBack = () => {
        setInterviewState('selection');
    };

    const handleInterviewResults = (results) => {
        setInterviewResults(results);
        setInterviewState('results');
    };

    const handleRetry = () => {
        setInterviewResults(null);
        setInterviewState('session');
    };

    // Show interview setup
    if (interviewState === 'setup') {
        return (
            <InterviewSetup
                selectedType={selectedType}
                customRole={customRole}
                onStart={handleSetupComplete}
                onBack={handleSetupBack}
            />
        );
    }

    // Show interview session
    if (interviewState === 'session') {
        return (
            <InterviewSession
                interviewType={selectedType}
                customRole={customRole}
                config={interviewConfig}
                onEnd={handleInterviewEnd}
                onResults={handleInterviewResults}
            />
        );
    }

    // Show results
    if (interviewState === 'results' && interviewResults) {
        return (
            <InterviewResults
                results={interviewResults}
                interviewType={selectedType}
                onRetry={handleRetry}
                onClose={handleInterviewEnd}
            />
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#020617]">
            {/* Animated 3D Background */}
            <InterviewBackground />

            {/* Premium Gradient Orbs */}
            <div className="fixed top-[-10%] right-[-5%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="fixed bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none"></div>



            <main className="container mx-auto px-6 py-12 max-w-7xl relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-20 animate-in fade-in slide-in-from-top-8 duration-1000">
                    <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 rounded-full text-cyan-400 text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-2xl">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                        AI-Powered Practice
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] rounded-md border border-cyan-500/30">PRO</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
                        <span className="text-white">Master Your </span>
                        <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">Interview</span>
                    </h1>

                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium mb-6">
                        Experience the future of interview prep. Dynamic questions, real-time AI feedback, and <span className="text-cyan-400 font-bold">personalized coaching.</span>
                    </p>

                    <Link
                        to="/interview-history"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all text-sm font-bold"
                    >
                        <History className="w-4 h-4" />
                        View Past Interviews & Weak Points
                    </Link>
                </div>

                {/* Features Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 hover:border-cyan-500/40 transition-all duration-500 group hover:translate-y-[-8px] shadow-2xl">
                            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-500 border border-white/5 shadow-inner">
                                <feature.icon className="w-7 h-7 text-cyan-400" />
                            </div>
                            <h3 className="text-white font-black text-lg mb-2 tracking-tight">{feature.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed font-medium">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* Interview Types */}
                <div className="mb-20">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tight">Choose Your Path</h2>
                                <p className="text-slate-400 font-medium">Select a specialized round to begin</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {interviewTypes.map((type) => (
                            <div
                                key={type.id}
                                onClick={() => type.available && setSelectedType(type.id)}
                                className={`group relative cursor-pointer h-full ${!type.available && 'opacity-60'}`}
                            >
                                {/* Glow effect */}
                                <div className={`absolute -inset-1 bg-gradient-to-r ${type.color} rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-20 transition-all duration-700`}></div>

                                <div className={`relative h-full bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 border-2 transition-all duration-500 shadow-2xl flex flex-col ${selectedType === type.id ? 'border-cyan-500 bg-slate-900/60' : 'border-white/5 hover:border-white/20'}`}>
                                    {type.comingSoon && (
                                        <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/20">
                                            <Lock className="w-3 h-3" />
                                            Coming Soon
                                        </div>
                                    )}

                                    <div className="flex items-start gap-6 flex-1">
                                        <div className={`w-20 h-20 flex-shrink-0 bg-gradient-to-br ${type.color} rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-700 border border-white/20`}>
                                            <type.icon className="w-10 h-10 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{type.title}</h3>
                                            <p className="text-slate-400 text-sm mb-6 leading-relaxed font-medium">{type.description}</p>

                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="px-4 py-1.5 bg-white/5 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/5 flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-cyan-400" />
                                                    {type.duration}
                                                </span>
                                                <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl border ${type.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    type.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}>
                                                    {type.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Custom role input */}
                                    {type.isCustom && (
                                        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <input
                                                type="text"
                                                value={customRole}
                                                onChange={(e) => setCustomRole(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                placeholder="e.g., Frontend Developer, SDE-2"
                                                className="w-full px-6 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all font-bold"
                                            />
                                        </div>
                                    )}

                                </div>
                            </div>
                        ))}

                        {/* Paid Real Interview Card */}
                        <div
                            onClick={() => navigate('/interviewers/premium')}
                            className="group relative cursor-pointer"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-amber-500 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-30 transition-all duration-700"></div>
                            <div className="relative bg-[#1e1b4b]/40 backdrop-blur-2xl rounded-[2.5rem] p-8 border-2 border-rose-500/30 hover:border-rose-500/50 transition-all duration-500 shadow-2xl overflow-hidden">
                                <div className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_4px_15px_rgba(244,63,94,0.4)]">
                                    <Sparkles className="w-3 h-3" />
                                    Premium
                                </div>

                                <div className="flex items-start gap-6">
                                    <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-amber-500 rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-all duration-700 border border-white/20">
                                        <Users className="w-10 h-10 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-rose-100 mb-2 tracking-tight">Real Interview</h3>
                                        <p className="text-slate-400 text-sm mb-6 leading-relaxed font-medium">Connect with top-tier engineers from MAANG/Product based companies.</p>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="px-4 py-2 bg-rose-500/20 text-rose-300 text-sm font-black rounded-xl border border-rose-500/30">
                                                ₹399 <span className="text-[10px] opacity-60 font-medium">/ session</span>
                                            </span>
                                            <span className="px-4 py-2 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-amber-500/20">
                                                Live 1:1
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 flex items-center justify-between">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-[#1e1b4b] flex items-center justify-center text-lg">{['👨‍💼', '👩‍💼', '👨‍🚀', '👩‍🔬'][i - 1]}</div>
                                        ))}
                                        <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-[#1e1b4b] flex items-center justify-center text-[10px] font-black text-white">+20</div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate('/interviewers/premium');
                                        }}
                                        className="px-6 py-3 bg-white text-rose-900 font-black uppercase tracking-widest text-xs rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Book Slot
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats / CTA Section */}
                <div className="relative bg-gradient-to-br from-slate-900/80 via-slate-950/90 to-slate-900/80 rounded-[3rem] p-12 border border-white/10 text-center shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                    <div className="relative z-10">
                        {/* Wallet Balance & Cost Badge */}
                        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                            <div className="inline-flex items-center gap-3 px-5 py-2 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20 shadow-2xl">
                                <Wallet className="w-4 h-4" />
                                Cost: {INTERVIEW_COST} Points
                            </div>
                            <div className={`inline-flex items-center gap-3 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-2xl ${walletBalance >= INTERVIEW_COST
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                <Sparkles className="w-4 h-4" />
                                {isLoadingWallet ? 'Loading...' : `Balance: ${walletBalance} Points`}
                            </div>
                        </div>

                        {/* Error Message */}
                        {walletError && (
                            <div className="mb-6 px-6 py-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center gap-3 max-w-xl mx-auto">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <span className="text-red-300 text-sm font-medium">{walletError}</span>
                                <Link to="/wallet" className="text-amber-400 hover:text-amber-300 text-sm font-bold ml-2 underline">
                                    Add Points →
                                </Link>
                            </div>
                        )}

                        <h3 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Ready to level up?</h3>
                        <p className="text-slate-400 mb-10 max-w-xl mx-auto text-lg font-medium leading-relaxed">
                            Practicing with AI increases your success rate by <span className="text-cyan-400 font-black">300%</span>. Each session costs <span className="text-amber-400 font-bold">{INTERVIEW_COST} babua points</span>.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button
                                onClick={startInterview}
                                disabled={!selectedType || (selectedType === 'custom' && !customRole.trim()) || isCharging || walletBalance < INTERVIEW_COST}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-widest rounded-[2rem] hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-[0.95] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {isCharging ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Charging Points...
                                    </>
                                ) : (
                                    <>
                                        <Video className="w-6 h-6" />
                                        {selectedType ? `Start ${selectedType === 'custom' ? customRole || 'Custom' : selectedType.toUpperCase()} (${INTERVIEW_COST} pts)` : 'Select A Round'}
                                        <ArrowRight className="w-6 h-6" />
                                    </>
                                )}
                            </button>
                            <Link
                                to="/dashboard"
                                className="text-slate-400 hover:text-white font-black uppercase tracking-widest text-sm transition-all hover:translate-x-[-4px]"
                            >
                                ← Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );

}
