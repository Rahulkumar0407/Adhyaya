import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import {
    Home, Mic, RotateCcw, Gift, ArrowRight, Bell,
    CheckCircle2, Code2, Layers, Database, MessageCircle,
    Zap, Sparkles, Brain, Layout, Settings as SettingsIcon,
    Clock, Target, BookOpen, Play, ChevronRight, Star
} from 'lucide-react';
import RevisionSession from '../components/revision/RevisionSession';
import RevisionResults from '../components/revision/RevisionResults';
import { dsaCourseData } from '../data/dsaCourse';
import { courseData as sdCourseData } from '../data/systemDesignCourse';
import { dbmsCourseData } from '../data/dbmsCourse';
import AdaptiveRevision from './AdaptiveRevision';
import UserProfileDropdown from '../components/common/UserProfileDropdown';

// ===== THREE.JS ANIMATED BACKGROUND =====
function RevisionBackground() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 50;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // Floating particles with different colors
        const particles = [];
        const colors = [0xff6b35, 0x22d3ee, 0xa855f7, 0x10b981, 0xf472b6];

        // Create floating book/card shapes
        for (let i = 0; i < 30; i++) {
            const geometry = new THREE.BoxGeometry(
                Math.random() * 2 + 1,
                Math.random() * 0.3 + 0.1,
                Math.random() * 1.5 + 0.5
            );
            const material = new THREE.MeshBasicMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                transparent: true,
                opacity: 0.15 + Math.random() * 0.1,
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = (Math.random() - 0.5) * 100;
            mesh.position.y = (Math.random() - 0.5) * 60;
            mesh.position.z = (Math.random() - 0.5) * 40 - 20;
            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;
            mesh.userData = {
                speedX: (Math.random() - 0.5) * 0.02,
                speedY: (Math.random() - 0.5) * 0.01,
                rotSpeed: Math.random() * 0.01
            };
            particles.push(mesh);
            scene.add(mesh);
        }

        // Brain neurons
        const neuronGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const neurons = [];
        for (let i = 0; i < 40; i++) {
            const material = new THREE.MeshBasicMaterial({
                color: i % 2 === 0 ? 0xff6b35 : 0x22d3ee,
                transparent: true,
                opacity: 0.3 + Math.random() * 0.2,
            });
            const neuron = new THREE.Mesh(neuronGeometry, material);
            neuron.position.x = (Math.random() - 0.5) * 80;
            neuron.position.y = (Math.random() - 0.5) * 50;
            neuron.position.z = (Math.random() - 0.5) * 30 - 10;
            neuron.userData = {
                speed: Math.random() * 0.5 + 0.2,
                offset: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 2 + 1
            };
            neurons.push(neuron);
            scene.add(neuron);
        }

        // Synaptic connections
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xff6b35,
            transparent: true,
            opacity: 0.08
        });
        const lines = [];
        for (let i = 0; i < neurons.length; i++) {
            for (let j = i + 1; j < neurons.length; j++) {
                if (neurons[i].position.distanceTo(neurons[j].position) < 20) {
                    const geometry = new THREE.BufferGeometry().setFromPoints([
                        neurons[i].position,
                        neurons[j].position
                    ]);
                    const line = new THREE.Line(geometry, lineMaterial);
                    lines.push({ line, a: neurons[i], b: neurons[j] });
                    scene.add(line);
                }
            }
        }

        let animationId;
        const clock = new THREE.Clock();

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            // Animate particles
            particles.forEach(p => {
                p.position.x += p.userData.speedX;
                p.position.y += p.userData.speedY;
                p.rotation.x += p.userData.rotSpeed;
                p.rotation.y += p.userData.rotSpeed * 0.5;

                // Wrap around
                if (p.position.x > 60) p.position.x = -60;
                if (p.position.x < -60) p.position.x = 60;
                if (p.position.y > 40) p.position.y = -40;
                if (p.position.y < -40) p.position.y = 40;
            });

            // Animate neurons
            neurons.forEach(n => {
                n.position.y += Math.sin(t * n.userData.speed + n.userData.offset) * 0.02;
                n.scale.setScalar(1 + Math.sin(t * n.userData.pulseSpeed) * 0.2);
            });

            // Update connections
            lines.forEach(({ line, a, b }) => {
                const pos = line.geometry.attributes.position.array;
                pos[0] = a.position.x; pos[1] = a.position.y; pos[2] = a.position.z;
                pos[3] = b.position.x; pos[4] = b.position.y; pos[5] = b.position.z;
                line.geometry.attributes.position.needsUpdate = true;
            });

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
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return <div ref={containerRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
}

// ===== MANUAL REVISION COMPONENT =====
function ManualRevision({ onSwitchMode }) {
    const { user } = useAuth();
    const [step, setStep] = useState('selection');
    const [selectedCourse, setSelectedCourse] = useState('dsa');
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [duration, setDuration] = useState(30);
    const [sessionResults, setSessionResults] = useState(null);

    const userName = user?.name?.split(' ')[0] || 'Coder';

    const courses = [
        { id: 'dsa', name: 'DSA', icon: Code2, data: dsaCourseData, color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-500/10', textColor: 'text-orange-400', borderColor: 'border-orange-500/30' },
        { id: 'system-design', name: 'System Design', icon: Layers, data: sdCourseData, color: 'from-cyan-500 to-blue-500', bgColor: 'bg-cyan-500/10', textColor: 'text-cyan-400', borderColor: 'border-cyan-500/30' },
        { id: 'dbms', name: 'DBMS', icon: Database, data: dbmsCourseData, color: 'from-violet-500 to-purple-500', bgColor: 'bg-violet-500/10', textColor: 'text-violet-400', borderColor: 'border-violet-500/30' }
    ];

    const getTopics = () => courses.find(c => c.id === selectedCourse)?.data.sections || [];
    const getCurrentCourse = () => courses.find(c => c.id === selectedCourse);

    const handleStart = () => {
        if (!selectedTopic) return;
        setStep('session');
    };

    const handleFinish = (results) => {
        setSessionResults(results);
        setStep('results');
    };

    const handleRetry = () => {
        setStep('selection');
        setSessionResults(null);
        setSelectedTopic(null);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-gray-200 relative overflow-hidden">
            <RevisionBackground />

            {/* Gradient Orbs */}
            <div className="fixed top-[-20%] right-[-10%] w-[60%] h-[60%] bg-orange-600/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="fixed bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="fixed top-[40%] left-[30%] w-[30%] h-[30%] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Main Content */}
            <main className="relative z-10 container mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                    {step === 'selection' && (
                        <motion.div
                            key="selection"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="max-w-6xl mx-auto"
                        >
                            {/* Hero Header */}
                            <div className="text-center mb-10">
                                <div className="flex items-center justify-center gap-4 mb-6">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-full border border-orange-500/20">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                                        <span className="text-sm font-medium text-orange-300">Manual Mode</span>
                                    </div>
                                    <button
                                        onClick={onSwitchMode}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-sm transition-all"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Switch Mode
                                    </button>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                                    Revision Session
                                </h1>
                                <p className="text-gray-500 max-w-lg mx-auto">
                                    Pick a topic and test your understanding with AI-generated questions
                                </p>
                            </div>

                            <div className="grid lg:grid-cols-12 gap-8">
                                {/* Left Panel: Controls */}
                                <div className="lg:col-span-4 space-y-6">
                                    {/* Domain Selection Card */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl"
                                    >
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                                                <Target className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-lg font-bold text-white">Choose Domain</h3>
                                        </div>

                                        <div className="space-y-2">
                                            {courses.map((course, idx) => {
                                                const isSelected = selectedCourse === course.id;
                                                return (
                                                    <motion.button
                                                        key={course.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.4 + idx * 0.1 }}
                                                        onClick={() => { setSelectedCourse(course.id); setSelectedTopic(null); }}
                                                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${isSelected
                                                            ? `bg-gradient-to-r ${course.color} shadow-lg shadow-orange-500/20`
                                                            : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10'
                                                            }`}
                                                    >
                                                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : course.bgColor}`}>
                                                            <course.icon className={`w-5 h-5 ${isSelected ? 'text-white' : course.textColor}`} />
                                                        </div>
                                                        <span className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                                            {course.name}
                                                        </span>
                                                        {isSelected && (
                                                            <CheckCircle2 className="w-5 h-5 text-white ml-auto" />
                                                        )}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>

                                    {/* Duration Selection Card */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl"
                                    >
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
                                                <Clock className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-lg font-bold text-white">Session Duration</h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {[20, 30].map(mins => (
                                                <button
                                                    key={mins}
                                                    onClick={() => setDuration(mins)}
                                                    className={`relative py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 overflow-hidden ${duration === mins
                                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                                                        }`}
                                                >
                                                    {duration === mins && (
                                                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                                                    )}
                                                    <span className="relative z-10">{mins} min</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>

                                    {/* Start Button */}
                                    <motion.button
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                        onClick={handleStart}
                                        disabled={!selectedTopic}
                                        className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all duration-300 group ${!selectedTopic
                                            ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98]'
                                            }`}
                                    >
                                        <Play className={`w-5 h-5 ${selectedTopic ? 'group-hover:scale-110 transition-transform' : ''}`} />
                                        Begin Revision
                                        <ArrowRight className={`w-5 h-5 ${selectedTopic ? 'group-hover:translate-x-1 transition-transform' : ''}`} />
                                    </motion.button>

                                    {/* Info Card */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                        className="bg-gradient-to-br from-violet-500/10 to-purple-500/5 backdrop-blur-xl rounded-2xl p-5 border border-violet-500/20"
                                    >
                                        <div className="flex items-center gap-2 mb-4">
                                            <BookOpen className="w-4 h-4 text-violet-400" />
                                            <h4 className="text-sm font-semibold text-violet-300">How it works</h4>
                                        </div>
                                        <ul className="space-y-2 text-sm text-gray-400">
                                            <li className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2" />
                                                AI-generated questions from your topic
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2" />
                                                Mix of MCQ, code & conceptual
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2" />
                                                Timed session - stay focused!
                                            </li>
                                        </ul>
                                    </motion.div>
                                </div>

                                {/* Right Panel: Topic Selection */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="lg:col-span-8"
                                >
                                    <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl h-full">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 bg-gradient-to-br ${getCurrentCourse()?.color || 'from-orange-500 to-red-500'} rounded-xl`}>
                                                    <BookOpen className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">Select a Topic</h3>
                                                    <p className="text-sm text-gray-500">{getTopics().length} topics available</p>
                                                </div>
                                            </div>
                                            {selectedTopic && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-lg border border-green-500/30">
                                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                    <span className="text-sm text-green-300 font-medium">Selected</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {getTopics().map((topic, idx) => {
                                                    const isSelected = selectedTopic?.id === topic.id;
                                                    return (
                                                        <motion.button
                                                            key={topic.id}
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: 0.5 + idx * 0.02 }}
                                                            onClick={() => setSelectedTopic(topic)}
                                                            className={`group relative p-4 rounded-xl text-left transition-all duration-300 overflow-hidden ${isSelected
                                                                ? `bg-gradient-to-br ${getCurrentCourse()?.color || 'from-orange-500 to-red-500'} shadow-lg`
                                                                : 'bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20'
                                                                }`}
                                                        >
                                                            {/* Hover Glow */}
                                                            {!isSelected && (
                                                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            )}

                                                            <div className="relative z-10">
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <span className={`text-xs font-mono font-bold ${isSelected ? 'text-white/70' : 'text-gray-600'}`}>
                                                                        #{String(idx + 1).padStart(2, '0')}
                                                                    </span>
                                                                    {isSelected && (
                                                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                                                    )}
                                                                </div>
                                                                <h4 className={`font-semibold text-sm leading-snug line-clamp-2 mb-2 ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                                                    {topic.title}
                                                                </h4>
                                                                {topic.lessons && (
                                                                    <div className={`flex items-center gap-1 text-xs ${isSelected ? 'text-white/60' : 'text-gray-500'}`}>
                                                                        <BookOpen className="w-3 h-3" />
                                                                        {topic.lessons.length} lessons
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {/* Session Mode */}
                    {(step === 'session' || step === 'results') && (
                        <motion.div
                            key="session"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.5 }}
                            className="max-w-4xl mx-auto"
                        >
                            {step === 'session' && selectedTopic && (
                                <RevisionSession
                                    course={courses.find(c => c.id === selectedCourse)?.name}
                                    topic={selectedTopic}
                                    topicData={selectedTopic}
                                    duration={duration}
                                    onFinish={handleFinish}
                                    themeColor="orange"
                                />
                            )}

                            {step === 'results' && sessionResults && (
                                <RevisionResults
                                    results={sessionResults}
                                    onRetry={handleRetry}
                                    themeColor="orange"
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Custom Scrollbar Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.25);
                }
            `}</style>
        </div>
    );
}

// ===== MAIN REVISION PAGE =====
export default function RevisionPage() {
    const { user, token } = useAuth();
    const [mode, setMode] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const checkPreference = async () => {
            if (!user || !token) {
                setShowModal(true);
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${API_URL}/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) {
                    setShowModal(true);
                    setLoading(false);
                    return;
                }

                const data = await res.json();

                if (data.success) {
                    const pref = data.data.revisionMode;
                    if (pref && pref !== 'unset') {
                        setMode(pref);
                    } else {
                        setShowModal(true);
                    }
                } else {
                    setShowModal(true);
                }
            } catch (error) {
                console.error('Failed to fetch preference:', error);
                setShowModal(true);
            } finally {
                setLoading(false);
            }
        };

        checkPreference();
    }, [user, token]);

    const handleSelectMode = async (selectedMode) => {
        if (selectedMode === 'adaptive' && (!user || !token)) {
            window.location.href = '/login?redirect=/revision';
            return;
        }

        try {
            setMode(selectedMode);
            setShowModal(false);
            localStorage.setItem('hasSeenRevisionModeModal', 'true');

            if (user && token) {
                await fetch(`${API_URL}/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ revisionMode: selectedMode })
                });
            }
        } catch (error) {
            console.error('Failed to save preference:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-cyan-500/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
            </div>
        );
    }

    return (
        <>

            {mode === 'adaptive' && <AdaptiveRevision onSwitchMode={() => setShowModal(true)} />}
            {mode === 'manual' && <ManualRevision onSwitchMode={() => setShowModal(true)} />}

            {/* Mode Selection Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    >
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="relative bg-[#151518] border border-gray-800 rounded-2xl max-w-xl w-full p-8 shadow-2xl"
                        >
                            {/* Back Link */}
                            <Link
                                to="/dashboard"
                                className="absolute top-6 right-8 text-xs font-medium text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 group"
                            >
                                <Home className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                                <span>Back to Dashboard</span>
                            </Link>

                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                                    <RotateCcw className="w-7 h-7 text-orange-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">How would you like to revise?</h2>
                                <p className="text-gray-500 text-sm">Choose the approach that works best for you</p>
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                                {/* Adaptive Option */}
                                <button
                                    onClick={() => handleSelectMode('adaptive')}
                                    className="w-full p-5 bg-[#1a1a1f] hover:bg-[#1f1f25] border border-gray-800 hover:border-orange-500/40 rounded-xl text-left transition-all group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 bg-orange-500/15 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/25 transition-colors">
                                            <Zap className="w-5 h-5 text-orange-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-white">Adaptive AI Mode</h3>
                                                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-bold uppercase rounded">Best</span>
                                                {(!user || !token) && (
                                                    <span className="px-2 py-0.5 bg-yellow-500/15 text-yellow-400 text-[10px] font-bold uppercase rounded">Login needed</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 leading-relaxed">
                                                AI creates a personalized revision plan based on your weak areas. Uses spaced repetition for better retention.
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-orange-400 transition-colors flex-shrink-0 mt-1" />
                                    </div>
                                </button>

                                {/* Manual Option */}
                                <button
                                    onClick={() => handleSelectMode('manual')}
                                    className="w-full p-5 bg-[#1a1a1f] hover:bg-[#1f1f25] border border-gray-800 hover:border-cyan-500/40 rounded-xl text-left transition-all group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 bg-cyan-500/15 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/25 transition-colors">
                                            <Layout className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-white mb-1">Manual Mode</h3>
                                            <p className="text-sm text-gray-500 leading-relaxed">
                                                You pick the topics and duration. Great when you know exactly what you want to practice.
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transition-colors flex-shrink-0 mt-1" />
                                    </div>
                                </button>
                            </div>

                            <p className="mt-6 text-center text-xs text-gray-600">
                                You can switch modes anytime from the revision page
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
