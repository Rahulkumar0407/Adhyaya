import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
    Home, Bell, Gift, BookOpen, Crown, Rocket, Mic,
    Linkedin, Github, Globe, Flame, GraduationCap, ArrowRight, Sparkles, Star, Coins, Trophy, ChevronRight, RotateCcw, MessageCircle
} from 'lucide-react';

// Rewards-themed 3D Background
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

        const rewards = [];

        // 1. Floating Trophies (gold cylinders with sphere top)
        for (let i = 0; i < 8; i++) {
            const group = new THREE.Group();

            // Trophy base
            const baseGeometry = new THREE.CylinderGeometry(0.4, 0.6, 0.8, 12);
            const baseMaterial = new THREE.MeshBasicMaterial({
                color: 0xfbbf24,
                wireframe: true,
                transparent: true,
                opacity: 0.25,
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            group.add(base);

            // Trophy cup
            const cupGeometry = new THREE.SphereGeometry(0.5, 12, 12);
            const cup = new THREE.Mesh(cupGeometry, baseMaterial);
            cup.position.y = 0.6;
            cup.scale.y = 0.8;
            group.add(cup);

            const side = i % 2 === 0 ? -1 : 1;
            group.position.x = side * (22 + Math.random() * 23);
            group.position.y = (Math.random() - 0.5) * 50;
            group.position.z = (Math.random() - 0.5) * 20 - 10;

            const scale = Math.random() * 1.2 + 0.8;
            group.scale.set(scale, scale, scale);

            group.userData = {
                rotationSpeed: Math.random() * 0.01 + 0.005,
                floatSpeed: Math.random() * 0.3 + 0.2,
                floatOffset: Math.random() * Math.PI * 2,
            };

            rewards.push(group);
            scene.add(group);
        }

        // 2. Spinning Coins (torus shapes)
        const coinGeometry = new THREE.TorusGeometry(0.8, 0.15, 8, 24);
        const coinColors = [0xf97316, 0xfbbf24, 0xf59e0b];

        for (let i = 0; i < 18; i++) {
            const material = new THREE.MeshBasicMaterial({
                color: coinColors[i % coinColors.length],
                wireframe: true,
                transparent: true,
                opacity: 0.2 + Math.random() * 0.1,
            });

            const coin = new THREE.Mesh(coinGeometry, material);
            const side = i % 2 === 0 ? -1 : 1;
            coin.position.x = side * (24 + Math.random() * 21);
            coin.position.y = (Math.random() - 0.5) * 50;
            coin.position.z = (Math.random() - 0.5) * 20 - 10;

            const scale = Math.random() * 1.5 + 0.6;
            coin.scale.set(scale, scale, scale);

            coin.userData = {
                rotationSpeed: Math.random() * 0.04 + 0.02,
                floatSpeed: Math.random() * 0.5 + 0.3,
                floatOffset: Math.random() * Math.PI * 2,
            };

            rewards.push(coin);
            scene.add(coin);
        }

        // 3. Gift Boxes (cubes with ribbon)
        const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
        const ribbonGeometry = new THREE.BoxGeometry(1.1, 0.15, 0.15);

        for (let i = 0; i < 6; i++) {
            const group = new THREE.Group();

            // Box
            const boxMaterial = new THREE.MeshBasicMaterial({
                color: 0xf97316,
                wireframe: true,
                transparent: true,
                opacity: 0.2,
            });
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            group.add(box);

            // Ribbon (2 crossing bars)
            const ribbonMaterial = new THREE.MeshBasicMaterial({
                color: 0xfbbf24,
                wireframe: true,
                transparent: true,
                opacity: 0.25,
            });
            const ribbon1 = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
            const ribbon2 = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
            ribbon2.rotation.z = Math.PI / 2;
            group.add(ribbon1, ribbon2);

            const side = i % 2 === 0 ? -1 : 1;
            group.position.x = side * (26 + Math.random() * 19);
            group.position.y = (Math.random() - 0.5) * 50;
            group.position.z = (Math.random() - 0.5) * 20 - 10;

            const scale = Math.random() * 1.3 + 0.7;
            group.scale.set(scale, scale, scale);

            group.userData = {
                rotationSpeed: (Math.random() - 0.5) * 0.015,
                floatSpeed: Math.random() * 0.4 + 0.25,
                floatOffset: Math.random() * Math.PI * 2,
            };

            rewards.push(group);
            scene.add(group);
        }

        // 4. Star Sparkles
        const starGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(120 * 3);
        for (let i = 0; i < 120 * 3; i += 3) {
            const side = (i / 3) % 2 === 0 ? -1 : 1;
            positions[i] = side * (20 + Math.random() * 25);
            positions[i + 1] = (Math.random() - 0.5) * 60;
            positions[i + 2] = (Math.random() - 0.5) * 30 - 10;
        }
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const starMaterial = new THREE.PointsMaterial({
            color: 0xfbbf24,
            size: 0.1,
            transparent: true,
            opacity: 0.7,
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        let animationId;
        const clock = new THREE.Clock();

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            rewards.forEach((reward) => {
                if (reward.userData.rotationSpeed !== undefined) {
                    reward.rotation.x += reward.userData.rotationSpeed;
                    reward.rotation.y += reward.userData.rotationSpeed * 0.7;
                }
                reward.position.y += Math.sin(elapsedTime * reward.userData.floatSpeed + reward.userData.floatOffset) * 0.012;
            });

            stars.rotation.y = elapsedTime * 0.015;
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




const earnSteps = [
    {
        icon: Linkedin,
        title: 'Connect LinkedIn',
        description: 'Link your professional identity',
        points: 10,
        color: 'from-blue-500 to-blue-600',
        iconColor: '#3b82f6',
    },
    {
        icon: Github,
        title: 'Connect GitHub',
        description: 'Show off your code repos',
        points: 10,
        color: 'from-violet-400 to-purple-500',
        iconColor: '#a855f7',
    },
    {
        icon: Globe,
        title: 'Connect Portfolio',
        description: 'Your personal website',
        points: 10,
        color: 'from-emerald-500 to-teal-500',
        iconColor: '#10b981',
    },
    {
        icon: BookOpen,
        title: 'Complete One Topic',
        description: 'Finish a topic in any course',
        points: 30,
        color: 'from-fuchsia-500 to-pink-500',
        iconColor: '#d946ef',
    },
    {
        icon: Flame,
        title: '30 Day Streak',
        description: 'Login and learn daily',
        points: 50,
        color: 'from-amber-400 to-yellow-500',
        iconColor: '#fbbf24',
    },
    {
        icon: GraduationCap,
        title: 'Complete Full Course',
        description: 'Master an entire course',
        points: 100,
        color: 'from-yellow-400 to-amber-500',
        iconColor: '#f59e0b',
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
    const { user } = useAuth();
    const userName = user?.name?.split(' ')[0] || 'Babua';

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

            {/* Gradient Orbs */}
            <div className="fixed top-0 right-1/4 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="fixed top-1/2 right-0 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>



            <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-900/60 to-amber-900/60 border border-orange-500/30 rounded-full text-amber-400 text-sm mb-4">
                        <Trophy className="w-4 h-4" />
                        Your Rewards Journey
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-3">
                        <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Rewards</span>
                        <span className="text-white"> Center</span>
                    </h1>

                    <p className="text-orange-100/60 text-lg max-w-xl mx-auto">
                        Jitna seekhoge, utna kamaaoge! Track your progress and level up.
                    </p>
                </div>

                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    {/* Points Card */}
                    <div className="bg-gradient-to-br from-orange-950/60 to-transparent backdrop-blur rounded-2xl p-5 border border-amber-500/30 hover:border-amber-500/50 transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-wider">
                                <Coins className="w-4 h-4" />
                                Total Points
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Star className="w-5 h-5 text-purple-900 fill-purple-900" />
                            </div>
                        </div>
                        <div className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                            {userPoints.toLocaleString()}
                        </div>
                        <div className="text-orange-100/50 text-sm mt-1">Babua Coins</div>
                    </div>

                    {/* Current Level Card */}
                    <div className="bg-gradient-to-br from-orange-950/60 to-transparent backdrop-blur rounded-2xl p-5 border border-orange-500/30 hover:border-orange-500/50 transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-orange-400 text-xs uppercase tracking-wider">
                                <Crown className="w-4 h-4" />
                                Current Level
                            </div>
                            <div className="text-3xl group-hover:animate-bounce">{currentLevel.emoji}</div>
                        </div>
                        <div className="text-2xl font-bold text-white">{currentLevel.name}</div>
                        <div className="text-orange-100/50 text-sm mt-1">Level {currentLevel.level}</div>
                    </div>

                    {/* Next Level Card */}
                    <div className="bg-gradient-to-br from-orange-950/60 to-transparent backdrop-blur rounded-2xl p-5 border border-orange-500/30 hover:border-orange-500/50 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-orange-400 text-xs uppercase tracking-wider">
                                <Rocket className="w-4 h-4" />
                                Next Level
                            </div>
                            {nextLevel && <div className="text-2xl">{nextLevel.emoji}</div>}
                        </div>
                        {nextLevel ? (
                            <>
                                <div className="text-xl font-bold text-white mb-2">{nextLevel.name}</div>
                                <div className="w-full h-2 bg-orange-950/60 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full transition-all duration-500"
                                        style={{ width: `${progressToNext}%` }}
                                    ></div>
                                </div>
                                <div className="text-orange-100/50 text-xs mt-2">
                                    {nextLevel.minPoints - userPoints} points to go
                                </div>
                            </>
                        ) : (
                            <div className="text-amber-400 font-bold">Max Level! 🎉</div>
                        )}
                    </div>
                </div>

                {/* How to Earn Section */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-purple-900" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">How to Earn Points</h2>
                            <p className="text-orange-100/50 text-sm">Complete tasks to earn Babua Coins</p>
                        </div>
                    </div>

                    {/* Earn Steps - Horizontal Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {earnSteps.map((step, index) => {
                            const IconComponent = step.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-gradient-to-br from-orange-950/50 to-transparent backdrop-blur rounded-xl p-4 border border-orange-700/30 hover:border-orange-500/50 transition-all hover:scale-[1.02] group cursor-pointer"
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
                                            <p className="text-orange-100/50 text-sm mb-2">{step.description}</p>
                                            <div className={`inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r ${step.color} rounded-full`}>
                                                <span className="text-white font-bold text-sm">+{step.points}</span>
                                                <span className="text-white/70 text-xs">pts</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-orange-500/50 group-hover:text-orange-400 transition-colors" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Level Progression */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                            <Crown className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Level Progression</h2>
                            <p className="text-orange-100/50 text-sm">Your journey from Naya Babua to Legend</p>
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
                                            ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-2 border-amber-500/50 scale-105'
                                            : isCompleted
                                                ? 'bg-orange-950/40 border border-orange-600/30'
                                                : 'bg-orange-950/20 border border-orange-800/20 opacity-60'
                                            }`}
                                    >
                                        {isActive && (
                                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-400 text-purple-900 text-[10px] font-bold rounded-full">
                                                YOU
                                            </div>
                                        )}
                                        <div className={`text-2xl mb-1 ${isCompleted ? '' : 'grayscale'}`}>{level.emoji}</div>
                                        <div className={`text-xs font-bold mb-0.5 ${isCompleted ? `bg-gradient-to-r ${level.color} bg-clip-text text-transparent` : 'text-orange-500/50'}`}>
                                            Lvl {level.level}
                                        </div>
                                        <div className={`text-[10px] ${isCompleted ? 'text-white' : 'text-orange-500/50'}`}>
                                            {level.name}
                                        </div>
                                        <div className="text-[9px] text-orange-400/40 mt-1">
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
                    <div className="h-1 bg-orange-950/60 rounded-full">
                        <div
                            className="h-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 rounded-full transition-all duration-500"
                            style={{
                                width: `${Math.min(100, (currentLevel.level / levels.length) * 100)}%`
                            }}
                        ></div>
                    </div>
                    <div className="absolute -top-2 left-0 text-xs text-orange-400/60">Level {currentLevel.level}</div>
                    <div className="absolute -top-2 right-0 text-xs text-orange-400/60">Level {levels.length}</div>
                </div>

                {/* Why Points Matter */}
                <div className="bg-gradient-to-r from-orange-950/60 via-transparent to-orange-950/60 rounded-2xl p-6 border border-orange-500/20 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">💡</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">Why collect points?</h3>
                            <p className="text-orange-100/60 text-sm leading-relaxed">
                                Points = <span className="text-amber-400 font-medium">Karma</span>.
                                Your dedication reflected in numbers. Unlock <span className="text-white font-medium">paid tasks</span>,
                                get <span className="text-amber-400 font-medium">exclusive access</span>, and earn real rewards! 🚀
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-purple-900 font-bold rounded-2xl hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105 transition-all"
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
