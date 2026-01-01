import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as THREE from 'three';
import {
    Play, Flame, Lock, BookOpen, Grid3X3,
    Database, Server, Network, Cpu, Brain,
    Bell, Gift, MessageCircle, X, Home, Send,
    Github, Twitter, Linkedin, Sparkles, Zap, Trophy, Target, ArrowRight, Mic, RotateCcw
} from 'lucide-react';
import { getTotalLessons as getSDTotalLessons } from '../data/systemDesignCourse';
import { getDbmsTotalLessons } from '../data/dbmsCourse';
import { getTotalLessons as getDSATotalLessons } from '../data/dsaCourse';
import Footer from '../components/common/Footer';

// Quotes for inspiration
const quotes = [
    { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
    { text: "Programming is the art of telling a computer what to do.", author: "Donald Knuth" },
];

// Animated Background Component
function AnimatedBackground() {
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

        // Create floating shapes with stone grey + moss green tones
        const shapes = [];
        const geometries = [
            new THREE.IcosahedronGeometry(1, 0),
            new THREE.OctahedronGeometry(1, 0),
            new THREE.TetrahedronGeometry(1, 0),
            new THREE.TorusGeometry(0.8, 0.3, 8, 16),
        ];

        const colors = [0x4b5563, 0x6b7280, 0x65a30d, 0x84cc16]; // Stone grey + moss green

        for (let i = 0; i < 20; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = new THREE.MeshBasicMaterial({
                color: colors[i % colors.length],
                wireframe: true,
                transparent: true,
                opacity: 0.18 + Math.random() * 0.1,
            });
            const mesh = new THREE.Mesh(geometry, material);

            const side = i % 2 === 0 ? -1 : 1;
            mesh.position.x = side * (15 + Math.random() * 30);
            mesh.position.y = (Math.random() - 0.5) * 60;
            mesh.position.z = (Math.random() - 0.5) * 30 - 10;

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
        const positions = new Float32Array(150 * 3);
        for (let i = 0; i < 150 * 3; i += 3) {
            const side = (i / 3) % 2 === 0 ? -1 : 1;
            positions[i] = side * (10 + Math.random() * 35);
            positions[i + 1] = (Math.random() - 0.5) * 70;
            positions[i + 2] = (Math.random() - 0.5) * 40 - 10;
        }
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0xa3e635, // Lime green
            size: 0.06,
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

            particles.rotation.y = elapsedTime * 0.02;
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

export default function Dashboard() {
    const { user, token } = useAuth();
    const [streak, setStreak] = useState(0);
    const [randomQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

    // Course progress from localStorage
    const [sdProgress, setSDProgress] = useState(0);
    const [dbmsProgress, setDBMSProgress] = useState(0);
    const [dsaProgress, setDSAProgress] = useState(0);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Load course progress from localStorage
    useEffect(() => {
        const sdCompleted = localStorage.getItem('sdCourseProgress');
        if (sdCompleted) {
            try {
                const completedLessons = JSON.parse(sdCompleted);
                const totalLessons = getSDTotalLessons();
                setSDProgress(Math.round((completedLessons.length / totalLessons) * 100));
            } catch (e) { console.error('Failed to parse SD progress:', e); }
        }

        const dbmsCompleted = localStorage.getItem('dbmsCourseProgress');
        if (dbmsCompleted) {
            try {
                const completedLessons = JSON.parse(dbmsCompleted);
                const totalLessons = getDbmsTotalLessons();
                setDBMSProgress(Math.round((completedLessons.length / totalLessons) * 100));
            } catch (e) { console.error('Failed to parse DBMS progress:', e); }
        }

        const dsaCompleted = localStorage.getItem('dsa-completed-items');
        if (dsaCompleted) {
            try {
                const completedItems = JSON.parse(dsaCompleted);
                const totalLessons = getDSATotalLessons();
                setDSAProgress(Math.round((completedItems.length / totalLessons) * 100));
            } catch (e) { console.error('Failed to parse DSA progress:', e); }
        }
    }, []);

    // Fetch streak
    useEffect(() => {
        const fetchStreak = async () => {
            try {
                const res = await fetch(`${API_URL}/profile/streak`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) setStreak(data.data.currentStreak || 0);
            } catch (error) { console.error('Failed to fetch streak:', error); }
        };
        if (token) fetchStreak();
    }, [token]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Suprabhat';
        if (hour < 17) return 'Namaskar';
        return 'Shubh Sandhya';
    };

    const userName = user?.name?.split(' ')[0] || 'Babua';

    // Course data with dynamic progress
    const courses = [
        {
            id: 'dsa',
            name: 'Data Structures & Algorithms',
            description: 'Master Graphs, Trees, and DP. Placement ka Raja!',
            icon: Grid3X3,
            color: 'from-orange-500 to-yellow-500',
            bgGlow: 'bg-orange-500/20',
            startLink: '/dsa-shuru-karein',
            syllabusLink: '/dsa-syllabus',
            progress: dsaProgress,
            badge: '🔥 HOT',
            featured: true,
        },
        {
            id: 'system-design',
            name: 'System Design',
            description: 'HLD & LLD: Zero se Million users tak scale karo.',
            icon: Server,
            color: 'from-purple-500 to-pink-500',
            bgGlow: 'bg-purple-500/20',
            startLink: '/system-design',
            syllabusLink: '/system-design-syllabus',
            progress: sdProgress,
            badge: '⚡ NEW',
        },
        {
            id: 'dbms',
            name: 'DBMS',
            description: 'SQL, Normalization & ACID. Data ka backbone.',
            icon: Database,
            color: 'from-emerald-500 to-teal-500',
            bgGlow: 'bg-emerald-500/20',
            startLink: '/dbms',
            syllabusLink: '/dbms-syllabus',
            progress: dbmsProgress,
            badge: '📚 COMPLETE',
        },
    ];

    const comingSoonCourses = [
        { name: 'Computer Networks', icon: Network, emoji: '🌐' },
        { name: 'Operating Systems', icon: Cpu, emoji: '⚙️' },
        { name: 'AI / ML', icon: Brain, emoji: '🤖' },
    ];

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1f2937 0%, #374151 30%, #1f2937 60%, #111827 100%)' }}>
            {/* Animated 3D Background */}
            <AnimatedBackground />

            {/* Gradient Orbs - Stone Grey + Moss Green */}
            <div className="fixed top-0 right-0 w-96 h-96 bg-gray-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 w-80 h-80 bg-lime-500/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
            <div className="fixed top-1/2 left-1/4 w-72 h-72 bg-green-600/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
            <div className="fixed bottom-1/4 right-1/4 w-64 h-64 bg-gray-400/10 rounded-full blur-3xl pointer-events-none"></div>



            {/* Main Content */}
            <main className="relative z-10 container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700/50 border border-lime-500/30 rounded-full text-lime-400 text-sm mb-6">
                        <Sparkles className="w-4 h-4" />
                        Live Learning Platform
                        <span className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                        <span className="text-white">{getGreeting()}, </span>
                        <span className="text-lime-400">{userName}!</span>
                    </h1>

                    <p className="text-gray-400 text-lg max-w-xl mx-auto mb-6">
                        "{randomQuote.text}" <span className="text-gray-500">— {randomQuote.author}</span>
                    </p>

                    {/* Stats Row */}
                    <div className="flex flex-wrap justify-center gap-6 mb-8">
                        <div className="flex items-center gap-3 px-5 py-3 bg-gray-700/40 backdrop-blur border border-gray-600/40 rounded-2xl hover:border-lime-500/40 hover:bg-gray-700/60 transition-all group">
                            <div className="w-12 h-12 bg-gradient-to-br from-lime-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all shadow-lg shadow-lime-500/20">
                                <Flame className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-left">
                                <div className="text-2xl font-bold text-white">{streak}</div>
                                <div className="text-xs text-lime-400/60 uppercase">Day Streak 🔥</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Featured DSA Course */}
                <div className="mb-8">
                    <div className="relative group">
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-lime-500/20 via-green-600/15 to-lime-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>

                        <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-lime-500/20 overflow-hidden group-hover:border-lime-500/40 transition-all duration-500 group-hover:scale-[1.01]"
                            style={{ boxShadow: '0 0 40px rgba(132, 204, 22, 0.1)' }}>
                            {/* Animated gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-lime-500/5 via-transparent to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="relative p-8 md:p-10">
                                <div className="flex flex-wrap items-start justify-between gap-6">
                                    <div className="flex-1 min-w-[280px]">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-3 py-1 bg-gradient-to-r from-lime-500 to-green-600 text-white text-xs font-bold rounded-full shadow-lg shadow-lime-500/30">
                                                🔥 PLACEMENT ESSENTIAL
                                            </span>
                                            <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                                                <Zap className="w-4 h-4 text-lime-400" />
                                                45h content
                                            </span>
                                        </div>

                                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                            Data Structures & <span className="text-lime-400">Algorithms</span>
                                        </h2>

                                        <p className="text-gray-400 mb-6 max-w-lg">
                                            Master Graphs, Trees, and DP. The single most important subject for cracking interviews at Google, Amazon, Microsoft, and more!
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4">
                                            <Link to="/dsa-shuru-karein" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-lime-500 to-green-600 text-white font-bold rounded-full hover:scale-105 transition-transform shadow-lg shadow-lime-500/30">
                                                <Play className="w-5 h-5" fill="currentColor" />
                                                Shuru Karein
                                            </Link>
                                            <Link to="/syllabus/dsa" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700/60 text-white font-semibold rounded-full border border-gray-600 hover:bg-gray-700 hover:border-lime-500/30 hover:scale-105 transition-all">
                                                <BookOpen className="w-5 h-5" />
                                                Syllabus
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Progress Circle */}
                                    <div className="relative w-32 h-32">
                                        <svg className="w-full h-full -rotate-90">
                                            <circle cx="64" cy="64" r="56" stroke="rgba(75, 85, 99, 0.4)" strokeWidth="8" fill="none" />
                                            <circle cx="64" cy="64" r="56" stroke="url(#progressGrad)" strokeWidth="8" fill="none" strokeLinecap="round"
                                                strokeDasharray={`${courses[0].progress * 3.51} 351`} />
                                            <defs>
                                                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#84cc16" />
                                                    <stop offset="100%" stopColor="#16a34a" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <span className="text-2xl font-bold text-white">{courses[0].progress}%</span>
                                                <p className="text-xs text-gray-500">Complete</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Other Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {courses.slice(1).map((course, idx) => (
                        <div key={course.id} className="group relative">
                            {/* Glow */}
                            <div className={`absolute -inset-0.5 ${course.bgGlow} rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>

                            <div className="relative bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-6 hover:border-lime-500/30 transition-all duration-300 group-hover:scale-[1.02] group-hover:bg-gray-800/80">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-14 h-14 bg-gradient-to-br ${course.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all`}>
                                        <course.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <span className="text-xs font-bold px-2 py-1 bg-gray-700/60 text-gray-300 rounded-full">{course.badge}</span>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2">{course.name}</h3>
                                <p className="text-gray-400 text-sm mb-4">{course.description}</p>

                                {/* Progress */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div className={`h-full bg-gradient-to-r ${course.color} rounded-full transition-all duration-500`} style={{ width: `${course.progress}%` }}></div>
                                    </div>
                                    <span className="text-sm text-gray-400">{course.progress}%</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link to={course.startLink} className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${course.color} text-white text-sm font-semibold rounded-full hover:scale-105 transition-transform shadow-lg`}>
                                        <Play className="w-4 h-4" fill="currentColor" />
                                        Start
                                    </Link>
                                    <Link to={course.syllabusLink} className="flex items-center gap-2 px-4 py-2 bg-gray-700/60 text-white text-sm font-medium rounded-full hover:bg-gray-700 transition-colors">
                                        <BookOpen className="w-4 h-4" />
                                        Syllabus
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Coming Soon */}
                <div className="bg-gray-800/50 backdrop-blur rounded-2xl border border-gray-700/50 p-6 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Lock className="w-5 h-5 text-lime-500/60" />
                        <span className="text-gray-400 font-medium">JALDI AANE WALA (Coming Soon)</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {comingSoonCourses.map((course) => (
                            <div key={course.name} className="flex items-center gap-3 px-4 py-3 bg-gray-700/30 rounded-xl border border-gray-600/30 opacity-60 hover:opacity-100 hover:bg-gray-700/50 hover:border-lime-500/20 transition-all cursor-pointer">
                                <span className="text-2xl">{course.emoji}</span>
                                <span className="text-gray-300 font-medium">{course.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer transparent />

            {/* Floating Chai Tapri Button - Links directly to page */}
            <Link
                to="/chai-tapri"
                className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-lime-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-lime-500/30 hover:scale-110 transition-all z-50 group"
            >
                <span className="text-2xl group-hover:animate-bounce">☕</span>
            </Link>
        </div>
    );
}
