import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
    Home, Bell, Gift, BookOpen, Crown, Rocket, Mic,
    Linkedin, Github, Globe, Flame, GraduationCap, ArrowRight, Sparkles, Star, Coins, Trophy, ChevronRight, RotateCcw, MessageCircle
} from 'lucide-react';
import ReferralSection from '../components/rewards/ReferralSection';

// Rewards-themed 3D Background with Gems and Crystals
function RewardsBackground() {
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

        const objects = [];

        // Warm gold/amber colors
        const goldColors = [0xfbbf24, 0xf59e0b, 0xd97706, 0xeab308];

        // Helper function to distribute objects evenly across the screen
        const getEvenPosition = (index, total, spread = 90) => {
            const segment = spread / total;
            return (index * segment) - (spread / 2) + (segment / 2) + (Math.random() - 0.5) * segment * 0.5;
        };

        // 1. COINS - Torus geometry (back layer)
        for (let i = 0; i < 6; i++) {
            const geometry = new THREE.TorusGeometry(1.2, 0.35, 8, 20);
            const material = new THREE.MeshBasicMaterial({
                color: goldColors[i % goldColors.length],
                wireframe: true,
                transparent: true,
                opacity: 0.15 + Math.random() * 0.08,
            });
            const coin = new THREE.Mesh(geometry, material);

            // Position coins on edges, back layer (z: -25 to -35)
            coin.position.x = getEvenPosition(i, 6, 100);
            coin.position.y = (i % 2 === 0 ? 1 : -1) * (15 + Math.random() * 15);
            coin.position.z = -28 - Math.random() * 8;
            coin.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.4;

            const scale = Math.random() * 0.5 + 1.0;
            coin.scale.set(scale, scale, scale);

            coin.userData = {
                rotationSpeed: { x: 0, y: (Math.random() - 0.5) * 0.015 },
                floatSpeed: Math.random() * 0.25 + 0.1,
                floatOffset: Math.random() * Math.PI * 2,
            };

            objects.push(coin);
            scene.add(coin);
        }

        // 2. CROWNS - Cone with points (mid-back layer)
        for (let i = 0; i < 5; i++) {
            const group = new THREE.Group();

            // Base ring
            const baseGeometry = new THREE.TorusGeometry(0.9, 0.12, 6, 16);
            const baseMaterial = new THREE.MeshBasicMaterial({
                color: goldColors[i % goldColors.length],
                wireframe: true,
                transparent: true,
                opacity: 0.18,
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.rotation.x = Math.PI / 2;
            group.add(base);

            // Crown points
            const pointCount = 5;
            for (let j = 0; j < pointCount; j++) {
                const pointGeometry = new THREE.ConeGeometry(0.2, 0.9, 4);
                const pointMaterial = new THREE.MeshBasicMaterial({
                    color: goldColors[(i + j) % goldColors.length],
                    wireframe: true,
                    transparent: true,
                    opacity: 0.15,
                });
                const point = new THREE.Mesh(pointGeometry, pointMaterial);
                const angle = (j / pointCount) * Math.PI * 2;
                point.position.x = Math.cos(angle) * 0.75;
                point.position.z = Math.sin(angle) * 0.75;
                point.position.y = 0.45;
                group.add(point);
            }

            // Position crowns mid-screen, mid-back layer (z: -18 to -24)
            group.position.x = getEvenPosition(i, 5, 80) + 8;
            group.position.y = (i % 2 === 0 ? 1 : -1) * (8 + Math.random() * 12);
            group.position.z = -20 - Math.random() * 5;

            const scale = Math.random() * 0.4 + 0.9;
            group.scale.set(scale, scale, scale);

            group.userData = {
                rotationSpeed: { x: 0, y: Math.random() * 0.01 + 0.004 },
                floatSpeed: Math.random() * 0.2 + 0.1,
                floatOffset: Math.random() * Math.PI * 2,
            };

            objects.push(group);
            scene.add(group);
        }

        // 3. TROPHIES - Cylinder + cup shape (mid-front layer)
        for (let i = 0; i < 5; i++) {
            const group = new THREE.Group();

            // Cup body (cylinder)
            const cupGeometry = new THREE.CylinderGeometry(0.6, 0.4, 1.2, 8, 1, true);
            const cupMaterial = new THREE.MeshBasicMaterial({
                color: goldColors[i % goldColors.length],
                wireframe: true,
                transparent: true,
                opacity: 0.18,
            });
            const cup = new THREE.Mesh(cupGeometry, cupMaterial);
            group.add(cup);

            // Base
            const baseGeometry = new THREE.CylinderGeometry(0.45, 0.6, 0.25, 8);
            const baseMaterial = new THREE.MeshBasicMaterial({
                color: goldColors[i % goldColors.length],
                wireframe: true,
                transparent: true,
                opacity: 0.12,
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.y = -0.8;
            group.add(base);

            // Position trophies, mid-front layer (z: -10 to -16)
            group.position.x = getEvenPosition(i, 5, 75) - 5;
            group.position.y = (i % 2 === 0 ? 1 : -1) * (5 + Math.random() * 18);
            group.position.z = -12 - Math.random() * 5;

            const scale = Math.random() * 0.5 + 1.0;
            group.scale.set(scale, scale, scale);

            group.userData = {
                rotationSpeed: { x: 0, y: Math.random() * 0.008 + 0.003 },
                floatSpeed: Math.random() * 0.25 + 0.12,
                floatOffset: Math.random() * Math.PI * 2,
            };

            objects.push(group);
            scene.add(group);
        }

        // 4. STARS - Octahedron (front layer, edges of screen)
        for (let i = 0; i < 8; i++) {
            const geometry = new THREE.OctahedronGeometry(0.9, 0);
            const material = new THREE.MeshBasicMaterial({
                color: goldColors[i % goldColors.length],
                wireframe: true,
                transparent: true,
                opacity: 0.2 + Math.random() * 0.08,
            });
            const star = new THREE.Mesh(geometry, material);

            // Position stars on edges, front layer (z: -5 to -12)
            star.position.x = getEvenPosition(i, 8, 95);
            star.position.y = (i % 2 === 0 ? 1 : -1) * (12 + Math.random() * 15);
            star.position.z = -6 - Math.random() * 6;

            const scale = Math.random() * 0.6 + 1.0;
            star.scale.set(scale, scale * 1.2, scale);

            star.userData = {
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.012,
                    y: (Math.random() - 0.5) * 0.015,
                },
                floatSpeed: Math.random() * 0.3 + 0.15,
                floatOffset: Math.random() * Math.PI * 2,
            };

            objects.push(star);
            scene.add(star);
        }

        // 5. Sparkle particles - spread across full screen
        const sparkleGeometry = new THREE.BufferGeometry();
        const sparklePositions = new Float32Array(120 * 3);
        for (let i = 0; i < 120 * 3; i += 3) {
            sparklePositions[i] = (Math.random() - 0.5) * 100;
            sparklePositions[i + 1] = (Math.random() - 0.5) * 75;
            sparklePositions[i + 2] = (Math.random() - 0.5) * 40 - 10;
        }
        sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));

        const sparkleMaterial = new THREE.PointsMaterial({
            color: 0xfbbf24,
            size: 0.1,
            transparent: true,
            opacity: 0.5,
        });

        const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
        scene.add(sparkles);

        let animationId;
        const clock = new THREE.Clock();

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            objects.forEach((obj) => {
                if (obj.userData.rotationSpeed) {
                    obj.rotation.x += obj.userData.rotationSpeed.x;
                    obj.rotation.y += obj.userData.rotationSpeed.y;
                }
                // Floating motion
                obj.position.y += Math.sin(elapsedTime * obj.userData.floatSpeed + obj.userData.floatOffset) * 0.015;

                // Subtle pulse effect for gems
                if (obj.userData.pulseSpeed) {
                    const pulse = 1 + Math.sin(elapsedTime * obj.userData.pulseSpeed) * 0.05;
                    obj.scale.setScalar(obj.scale.x * pulse / (1 + Math.sin((elapsedTime - 0.016) * obj.userData.pulseSpeed) * 0.05));
                }
            });

            // Rotate particle systems
            sparkles.rotation.y = elapsedTime * 0.02;
            sparkles.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1;

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

            // Proper cleanup
            scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });

            renderer.dispose();
            if (containerRef.current && renderer.domElement) {
                try {
                    containerRef.current.removeChild(renderer.domElement);
                } catch (e) { }
            }
        };
    }, []);

    return <div ref={containerRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
}




const earnSteps = [
    {
        icon: Linkedin,
        title: 'Connect LinkedIn',
        description: 'Link your professional identity',
        points: 10,
        color: 'from-blue-500 to-blue-600',
        iconColor: '#3b82f6',
        route: '/settings?section=social',
    },
    {
        icon: Github,
        title: 'Connect GitHub',
        description: 'Show off your code repos',
        points: 10,
        color: 'from-violet-400 to-purple-500',
        iconColor: '#a855f7',
        route: '/settings?section=social',
    },
    {
        icon: Globe,
        title: 'Connect Portfolio',
        description: 'Your personal website',
        points: 10,
        color: 'from-emerald-500 to-teal-500',
        iconColor: '#10b981',
        route: '/settings?section=social',
    },
    {
        icon: BookOpen,
        title: 'Complete One Topic',
        description: 'Finish a topic in any course',
        points: 30,
        color: 'from-fuchsia-500 to-pink-500',
        iconColor: '#d946ef',
        route: '/dsa',
    },
    {
        icon: Flame,
        title: '30 Day Streak',
        description: 'Login and learn daily',
        points: 50,
        color: 'from-amber-400 to-yellow-500',
        iconColor: '#fbbf24',
        route: '/dashboard',
    },
    {
        icon: GraduationCap,
        title: 'Complete Full Course',
        description: 'Master an entire course',
        points: 100,
        color: 'from-yellow-400 to-amber-500',
        iconColor: '#f59e0b',
        route: '/dsa',
    },
];

const levels = [
    { level: 1, name: 'Naya Babua', minPoints: 0, emoji: '🐣', color: 'from-gray-400 to-gray-500' },
    { level: 2, name: 'Padhai Shuru', minPoints: 100, emoji: '📚', color: 'from-green-400 to-emerald-500' },
    { level: 3, name: 'DSA Explorer', minPoints: 300, emoji: '🔍', color: 'from-blue-400 to-cyan-500' },
    { level: 4, name: 'Code Warrior', minPoints: 600, emoji: '⚔️', color: 'from-purple-400 to-violet-500' },
    { level: 5, name: 'Offer Collector', minPoints: 1000, emoji: '💼', color: 'from-amber-400 to-yellow-500' },
    { level: 6, name: 'Babua Legend', minPoints: 2000, emoji: '👑', color: 'from-yellow-400 to-amber-500' },
];

// Get current level based on points
const getCurrentLevel = (points) => {
    for (let i = levels.length - 1; i >= 0; i--) {
        if (points >= levels[i].minPoints) {
            return levels[i];
        }
    }
    return levels[0];
};

// Get next level
const getNextLevel = (points) => {
    for (let i = 0; i < levels.length; i++) {
        if (points < levels[i].minPoints) {
            return levels[i];
        }
    }
    return null; // Max level reached
};

export default function HowToEarn() {
    const { user, refreshUser } = useAuth();
    const userName = user?.name?.split(' ')[0] || 'Babua';

    // Refresh user data on mount to get latest points
    useEffect(() => {
        refreshUser();

        // Optional: Poll every 15 seconds to keep points fresh
        const interval = setInterval(refreshUser, 15000);
        return () => clearInterval(interval);
    }, []);

    // Get real points from user data
    const userPoints = user?.babuaCoins || 0;
    const currentLevel = getCurrentLevel(userPoints);
    const nextLevel = getNextLevel(userPoints);

    // Calculate progress to next level
    const progressToNext = nextLevel
        ? Math.min(100, ((userPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100)
        : 100;

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0a06 0%, #1a1008 50%, #0f0a06 100%)' }}>
            {/* Animated 3D Background */}
            <RewardsBackground />

            {/* Gradient Orbs - Warm Amber Theme */}
            <div className="fixed top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="fixed top-1/2 right-0 w-72 h-72 bg-yellow-500/8 rounded-full blur-3xl pointer-events-none"></div>
            <div className="fixed top-1/4 left-1/4 w-64 h-64 bg-amber-400/8 rounded-full blur-3xl pointer-events-none"></div>



            <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-900/50 to-orange-900/50 border border-amber-500/30 rounded-full text-amber-300 text-sm mb-4">
                        <Trophy className="w-4 h-4" />
                        Your Rewards Journey
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-3">
                        <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300 bg-clip-text text-transparent">Rewards</span>
                        <span className="text-white"> Center</span>
                    </h1>

                    <p className="text-amber-100/60 text-lg max-w-xl mx-auto">
                        Jitna seekhoge, utna kamaaoge! Track your progress and level up.
                    </p>
                </div>

                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    {/* Points Card */}
                    <div className="bg-gradient-to-br from-amber-950/40 to-transparent backdrop-blur rounded-2xl p-5 border border-amber-500/25 hover:border-amber-400/40 transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-wider">
                                <Coins className="w-4 h-4" />
                                Total Points
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Star className="w-5 h-5 text-white fill-white" />
                            </div>
                        </div>
                        <div className="text-4xl font-bold bg-gradient-to-r from-amber-300 to-yellow-300 bg-clip-text text-transparent">
                            {userPoints.toLocaleString()}
                        </div>
                        <div className="text-amber-100/50 text-sm mt-1">Babua Coins</div>
                    </div>

                    {/* Current Level Card */}
                    <div className="bg-gradient-to-br from-amber-950/40 to-transparent backdrop-blur rounded-2xl p-5 border border-orange-500/25 hover:border-orange-400/40 transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-orange-400 text-xs uppercase tracking-wider">
                                <Crown className="w-4 h-4" />
                                Current Level
                            </div>
                            <div className="text-3xl group-hover:animate-bounce">{currentLevel.emoji}</div>
                        </div>
                        <div className="text-2xl font-bold text-white">{currentLevel.name}</div>
                        <div className="text-amber-100/50 text-sm mt-1">Level {currentLevel.level}</div>
                    </div>

                    {/* Next Level Card */}
                    <div className="bg-gradient-to-br from-amber-950/40 to-transparent backdrop-blur rounded-2xl p-5 border border-yellow-500/25 hover:border-yellow-400/40 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-yellow-400 text-xs uppercase tracking-wider">
                                <Rocket className="w-4 h-4" />
                                Next Level
                            </div>
                            {nextLevel && <div className="text-2xl">{nextLevel.emoji}</div>}
                        </div>
                        {nextLevel ? (
                            <>
                                <div className="text-xl font-bold text-white mb-2">{nextLevel.name}</div>
                                <div className="w-full h-2 bg-amber-950/60 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-500"
                                        style={{ width: `${progressToNext}%` }}
                                    ></div>
                                </div>
                                <div className="text-amber-200/50 text-xs mt-2">
                                    {nextLevel.minPoints - userPoints} points to go
                                </div>
                            </>
                        ) : (
                            <div className="text-amber-300 font-bold">Max Level! 🎉</div>
                        )}
                    </div>
                </div>

                {/* How to Earn Section */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">How to Earn Points</h2>
                            <p className="text-amber-100/50 text-sm">Complete tasks to earn Babua Coins</p>
                        </div>
                    </div>

                    {/* Earn Steps - Horizontal Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {earnSteps.map((step, index) => {
                            const IconComponent = step.icon;
                            return (
                                <Link
                                    to={step.route}
                                    key={index}
                                    className="bg-gradient-to-br from-amber-950/30 to-transparent backdrop-blur rounded-xl p-4 border border-amber-700/25 hover:border-amber-500/40 transition-all hover:scale-[1.02] group cursor-pointer"
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                                            style={{ backgroundColor: `${step.iconColor}20` }}
                                        >
                                            <IconComponent className="w-6 h-6" style={{ color: step.iconColor }} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                                            <p className="text-amber-100/50 text-sm mb-2">{step.description}</p>
                                            <div className={`inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r ${step.color} rounded-full`}>
                                                <span className="text-white font-bold text-sm">+{step.points}</span>
                                                <span className="text-white/70 text-xs">pts</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-amber-500/40 group-hover:text-amber-400 transition-colors" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Level Progression */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                            <Crown className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Level Progression</h2>
                            <p className="text-amber-100/50 text-sm">Your journey from Naya Babua to Legend</p>
                        </div>
                    </div>

                    {/* Level Timeline */}
                    <div className="relative">
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
                            {levels.map((level, index) => {
                                const isActive = currentLevel.level === level.level;
                                const isCompleted = userPoints >= level.minPoints;

                                return (
                                    <div
                                        key={index}
                                        className={`relative text-center p-3 rounded-xl transition-all ${isActive
                                            ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-400/50 scale-105'
                                            : isCompleted
                                                ? 'bg-amber-950/30 border border-amber-600/30'
                                                : 'bg-amber-950/15 border border-amber-800/20 opacity-60'
                                            }`}
                                    >
                                        {isActive && (
                                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                                                YOU
                                            </div>
                                        )}
                                        <div className={`text-2xl mb-1 ${isCompleted ? '' : 'grayscale'}`}>{level.emoji}</div>
                                        <div className={`text-xs font-bold mb-0.5 ${isCompleted ? `bg-gradient-to-r ${level.color} bg-clip-text text-transparent` : 'text-amber-500/40'}`}>
                                            Lvl {level.level}
                                        </div>
                                        <div className={`text-[10px] ${isCompleted ? 'text-white' : 'text-amber-500/40'}`}>
                                            {level.name}
                                        </div>
                                        <div className="text-[9px] text-amber-400/30 mt-1">
                                            {level.minPoints}+
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Progress Line Divider */}
                <div className="relative mb-8">
                    <div className="h-1 bg-amber-950/50 rounded-full">
                        <div
                            className="h-full bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 rounded-full transition-all duration-500"
                            style={{
                                width: `${Math.min(100, (currentLevel.level / levels.length) * 100)}%`
                            }}
                        ></div>
                    </div>
                    <div className="absolute -top-2 left-0 text-xs text-amber-400/50">Level {currentLevel.level}</div>
                    <div className="absolute -top-2 right-0 text-xs text-amber-400/50">Level {levels.length}</div>
                </div>

                {/* Why Points Matter */}
                <div className="bg-gradient-to-r from-amber-950/40 via-transparent to-amber-950/40 rounded-2xl p-6 border border-amber-500/20 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">💎</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">Why collect points?</h3>
                            <p className="text-amber-100/60 text-sm leading-relaxed">
                                Points = <span className="text-amber-400 font-medium">Karma</span>.
                                Your dedication reflected in numbers. Unlock <span className="text-white font-medium">paid tasks</span>,
                                get <span className="text-yellow-400 font-medium">exclusive access</span>, and earn real rewards! 🚀
                            </p>
                        </div>
                    </div>
                </div>

                {/* Referral Section */}
                <ReferralSection />

                {/* CTA */}
                <div className="text-center">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-amber-500/25 hover:scale-105 transition-all"
                    >
                        <Rocket className="w-5 h-5" />
                        Start Earning
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </main>
        </div>
    );
}
