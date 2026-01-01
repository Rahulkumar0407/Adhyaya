import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import {
    LayoutDashboard, MessageSquare, Clock, Wallet,
    Star, Users, CheckCircle, ArrowRight, Brain,
    TrendingUp, Calendar, Zap, AlertCircle, BookOpen,
    GraduationCap, Award, PenTool
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import PendingCallsManager from '../components/mentorship/PendingCallsManager';
import UpcomingCallsSchedule from '../components/mentorship/UpcomingCallsSchedule';

// ===== TEACHER-THEMED THREE.JS BACKGROUND =====
function TeacherBackground() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 40;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        const objects = [];

        // Floating Books
        for (let i = 0; i < 15; i++) {
            const geometry = new THREE.BoxGeometry(2, 0.3, 1.5);
            const material = new THREE.MeshBasicMaterial({
                color: [0xef4444, 0xf472b6, 0x94a3b8, 0xf97316][i % 4],
                transparent: true,
                opacity: 0.12 + Math.random() * 0.08,
            });
            const book = new THREE.Mesh(geometry, material);
            book.position.x = (Math.random() - 0.5) * 80;
            book.position.y = (Math.random() - 0.5) * 50;
            book.position.z = (Math.random() - 0.5) * 30 - 15;
            book.rotation.x = Math.random() * 0.5;
            book.rotation.y = Math.random() * Math.PI;
            book.rotation.z = Math.random() * 0.3;
            book.userData = {
                speedY: (Math.random() - 0.5) * 0.01,
                rotSpeed: Math.random() * 0.005,
                floatOffset: Math.random() * Math.PI * 2
            };
            objects.push(book);
            scene.add(book);
        }

        // Graduation Caps (simple representation)
        for (let i = 0; i < 8; i++) {
            const group = new THREE.Group();

            // Cap base
            const baseGeom = new THREE.BoxGeometry(1.8, 0.1, 1.8);
            const baseMat = new THREE.MeshBasicMaterial({
                color: [0xef4444, 0xfb923c, 0xf472b6][i % 3],
                transparent: true,
                opacity: 0.15
            });
            const base = new THREE.Mesh(baseGeom, baseMat);
            group.add(base);

            // Cap top
            const topGeom = new THREE.BoxGeometry(1.2, 0.4, 1.2);
            const topMat = new THREE.MeshBasicMaterial({
                color: [0xdb2777, 0xfb923c, 0xef4444][i % 3],
                transparent: true,
                opacity: 0.12
            });
            const top = new THREE.Mesh(topGeom, topMat);
            top.position.y = -0.2;
            group.add(top);

            group.position.x = (Math.random() - 0.5) * 70;
            group.position.y = (Math.random() - 0.5) * 40;
            group.position.z = (Math.random() - 0.5) * 25 - 10;
            group.rotation.z = Math.random() * 0.5;
            group.userData = {
                speedY: (Math.random() - 0.5) * 0.008,
                rotSpeed: Math.random() * 0.003,
                floatOffset: Math.random() * Math.PI * 2
            };
            objects.push(group);
            scene.add(group);
        }

        // Pencils (cylinders)
        for (let i = 0; i < 12; i++) {
            const geometry = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8);
            const material = new THREE.MeshBasicMaterial({
                color: 0xfb923c,
                transparent: true,
                opacity: 0.1 + Math.random() * 0.08,
            });
            const pencil = new THREE.Mesh(geometry, material);
            pencil.position.x = (Math.random() - 0.5) * 90;
            pencil.position.y = (Math.random() - 0.5) * 55;
            pencil.position.z = (Math.random() - 0.5) * 35 - 12;
            pencil.rotation.x = Math.random() * Math.PI;
            pencil.rotation.z = Math.random() * Math.PI;
            pencil.userData = {
                speedY: (Math.random() - 0.5) * 0.012,
                rotSpeed: Math.random() * 0.008,
                floatOffset: Math.random() * Math.PI * 2
            };
            objects.push(pencil);
            scene.add(pencil);
        }

        // Light Bulbs (Ideas/Knowledge spheres)
        const sphereGeom = new THREE.SphereGeometry(0.4, 16, 16);
        for (let i = 0; i < 20; i++) {
            const material = new THREE.MeshBasicMaterial({
                color: i % 2 === 0 ? 0xfb923c : 0xf472b6,
                transparent: true,
                opacity: 0.15 + Math.random() * 0.1,
            });
            const sphere = new THREE.Mesh(sphereGeom, material);
            sphere.position.x = (Math.random() - 0.5) * 100;
            sphere.position.y = (Math.random() - 0.5) * 60;
            sphere.position.z = (Math.random() - 0.5) * 30 - 10;
            sphere.userData = {
                pulseSpeed: Math.random() * 2 + 1,
                floatOffset: Math.random() * Math.PI * 2,
                floatSpeed: Math.random() * 0.5 + 0.3
            };
            objects.push(sphere);
            scene.add(sphere);
        }

        // Connection lines (knowledge network)
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xf472b6,
            transparent: true,
            opacity: 0.05
        });

        let animationId;
        const clock = new THREE.Clock();

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            objects.forEach(obj => {
                if (obj.userData.speedY) {
                    obj.position.y += Math.sin(t + obj.userData.floatOffset) * 0.02;
                    obj.rotation.y += obj.userData.rotSpeed;
                }
                if (obj.userData.pulseSpeed) {
                    const scale = 1 + Math.sin(t * obj.userData.pulseSpeed) * 0.2;
                    obj.scale.setScalar(scale);
                    obj.position.y += Math.sin(t * obj.userData.floatSpeed + obj.userData.floatOffset) * 0.01;
                }
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

const MentorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Data States
    const [stats, setStats] = useState({
        earnings: 0,
        rating: 0,
        totalSessions: 0,
        activeDoubts: 0
    });
    const [assignedDoubts, setAssignedDoubts] = useState([]);
    const [availableDoubts, setAvailableDoubts] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [mentorProfile, setMentorProfile] = useState(null);
    const [upcomingCalls, setUpcomingCalls] = useState([]);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);

            const [
                assignedRes,
                availableRes,
                walletRes,
                mentorProfileRes
            ] = await Promise.allSettled([
                api.get('/doubts/mentor/assigned'),
                api.get('/doubts/mentor/available'),
                api.get('/wallet'),
                api.get('/mentors/me')
            ]);

            if (assignedRes.status === 'fulfilled' && assignedRes.value.data.success) {
                setAssignedDoubts(assignedRes.value.data.data?.doubts || []);
            }

            if (availableRes.status === 'fulfilled' && availableRes.value.data.success) {
                setAvailableDoubts(availableRes.value.data.data?.doubts || []);
            }

            if (walletRes.status === 'fulfilled' && walletRes.value.data.success) {
                setWallet(walletRes.value.data.data);
            }

            if (mentorProfileRes.status === 'fulfilled' && mentorProfileRes.value.data.success) {
                setMentorProfile(mentorProfileRes.value.data.data);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClaimDoubt = async (doubtId) => {
        try {
            const response = await api.post(`/doubts/mentor/claim/${doubtId}`);
            if (response.data.success) {
                fetchAllData();
                setActiveTab('doubts');
            }
        } catch (error) {
            console.error('Error claiming doubt:', error);
            alert('Failed to claim doubt');
        }
    };

    const toggleAvailability = async () => {
        try {
            const newStatus = !mentorProfile?.isOnline;
            const response = await api.patch('/mentors/availability', { isOnline: newStatus });
            if (response.data.success) {
                setMentorProfile(prev => ({ ...prev, isOnline: newStatus }));
            }
        } catch (error) {
            console.error('Error toggling availability:', error);
        }
    };

    if (loading) return <Loader />;

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-red-900/40 to-slate-900/60 p-6 rounded-2xl border border-red-500/20 relative overflow-hidden backdrop-blur-sm"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Wallet className="w-16 h-16 text-red-400" />
                    </div>
                    <p className="text-slate-400 text-sm mb-1 font-medium">Total Earnings</p>
                    <h3 className="text-3xl font-black text-white">₹{wallet?.balance || 0}</h3>
                    <div className="mt-4 text-xs font-bold text-rose-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +12% this week
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-pink-900/40 to-slate-900/60 p-6 rounded-2xl border border-pink-500/20 relative overflow-hidden backdrop-blur-sm"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Star className="w-16 h-16 text-pink-400" />
                    </div>
                    <p className="text-slate-400 text-sm mb-1 font-medium">Mentor Rating</p>
                    <h3 className="text-3xl font-black text-white">{mentorProfile?.rating || 'New'}</h3>
                    <div className="mt-4 text-xs font-bold text-indigo-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-indigo-400" />
                        Top Rated
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-orange-900/40 to-slate-900/60 p-6 rounded-2xl border border-orange-500/20 relative overflow-hidden backdrop-blur-sm"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <MessageSquare className="w-16 h-16 text-orange-400" />
                    </div>
                    <p className="text-slate-400 text-sm mb-1 font-medium">Active Doubts</p>
                    <h3 className="text-3xl font-black text-white">{assignedDoubts.length}</h3>
                    <Link to="#" onClick={() => setActiveTab('doubts')} className="mt-4 text-xs font-bold text-indigo-400 hover:text-indigo-300 block">
                        View Active Chats &rarr;
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-slate-800/40 to-slate-900/60 p-6 rounded-2xl border border-slate-500/20 relative overflow-hidden backdrop-blur-sm"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Clock className="w-16 h-16 text-slate-400" />
                    </div>
                    <p className="text-slate-400/70 text-sm mb-1 font-medium">Avg Response</p>
                    <h3 className="text-3xl font-black text-white">2m</h3>
                    <div className="mt-4 text-xs font-bold text-slate-400">
                        Keep it under 5m
                    </div>
                </motion.div>
            </div>

            {/* Quick Actions & Feed */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Available Doubts Feed */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="md:col-span-2 bg-gradient-to-br from-[#1e293b]/90 to-[#0f172a]/90 rounded-2xl border border-red-500/10 overflow-hidden backdrop-blur-xl"
                >
                    <div className="p-6 border-b border-red-500/10 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-red-400" />
                            Student Doubts Pool
                        </h3>
                        <span className="text-xs font-bold bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/30">
                            {availableDoubts.length} New
                        </span>
                    </div>
                    <div className="divide-y divide-slate-800 max-h-[400px] overflow-y-auto">
                        {(!availableDoubts || availableDoubts.length === 0) ? (
                            <div className="p-8 text-center text-slate-500">
                                <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                No new doubts available at the moment.
                            </div>
                        ) : (Array.isArray(availableDoubts) ? availableDoubts : []).map(doubt => (
                            <div key={doubt._id} className="p-4 hover:bg-red-500/5 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="px-2 py-1 rounded bg-red-500/20 text-red-300 text-xs font-bold uppercase">
                                        {doubt.subject}
                                    </span>
                                    <span className="text-emerald-400 font-bold text-sm">
                                        ₹{doubt.price || 49}
                                    </span>
                                </div>
                                <h4 className="text-white font-bold mb-1 truncate">{doubt.title}</h4>
                                <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                                    {doubt.description}
                                </p>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => handleClaimDoubt(doubt._id)}
                                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-lg text-sm hover:from-red-400 hover:to-pink-400 transition-all shadow-lg shadow-red-500/20"
                                    >
                                        Claim & Help
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-slate-900/30 text-center border-t border-slate-800">
                        <button onClick={() => setActiveTab('doubts')} className="text-sm text-red-400 hover:text-red-300 font-bold">
                            View All Available &rarr;
                        </button>
                    </div>
                </motion.div>

                {/* Right Column: Calls & Tips */}
                <div className="space-y-6">
                    {/* Pending Call Requests */}
                    <PendingCallsManager />

                    {/* Pro Tip */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-br from-red-600/20 to-pink-700/20 rounded-2xl p-6 border border-red-500/30 backdrop-blur-sm"
                    >
                        <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                            <Award className="w-5 h-5 text-red-400" />
                            Ambassador Program
                        </h4>
                        <p className="text-slate-400 text-sm mb-4">
                            Refer other mentors and earn 5% of their lifetime earnings!
                        </p>
                        <button className="w-full py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-lg text-sm hover:from-red-400 hover:to-pink-400 transition-all shadow-lg shadow-red-500/20">
                            Copy Referral Link
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );

    const renderDoubtsTab = () => (
        <div className="grid md:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
            {/* Available Column */}
            <div className="bg-gradient-to-br from-[#1e293b]/90 to-[#0f172a]/90 rounded-2xl border border-red-500/10 flex flex-col overflow-hidden backdrop-blur-xl">
                <div className="p-4 border-b border-red-500/10 bg-slate-900/30 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        Available for Claiming
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-xs font-bold">
                        {availableDoubts.length}
                    </span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {availableDoubts.map(doubt => (
                        <div key={doubt._id} className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 hover:border-red-500/30 transition-all">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">{doubt.subject}</span>
                                <span className="text-emerald-400 font-bold">₹{doubt.price || 49}</span>
                            </div>
                            <h4 className="text-white font-bold mb-2">{doubt.title}</h4>
                            <p className="text-slate-400 text-sm mb-4 line-clamp-2">{doubt.description}</p>
                            <button
                                onClick={() => handleClaimDoubt(doubt._id)}
                                className="w-full py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500 hover:text-white transition-all text-sm font-bold"
                            >
                                Claim & Answer
                            </button>
                        </div>
                    ))}
                    {availableDoubts.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            No new doubts available currently.
                        </div>
                    )}
                </div>
            </div>

            {/* My Active Column */}
            <div className="bg-gradient-to-br from-[#1e293b]/90 to-[#0f172a]/90 rounded-2xl border border-pink-500/10 flex flex-col overflow-hidden backdrop-blur-xl">
                <div className="p-4 border-b border-pink-500/10 bg-slate-900/30 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-pink-400" />
                        My Active Chats
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 text-xs font-bold">
                        {assignedDoubts.length}
                    </span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {(Array.isArray(assignedDoubts) ? assignedDoubts : []).map(doubt => (
                        <Link
                            to={`/doubts/${doubt._id}`}
                            key={doubt._id}
                            className="block p-4 rounded-xl bg-pink-500/5 border border-pink-500/10 hover:bg-pink-500/10 transition-all"
                        >
                            <div className="flex justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-xs text-pink-300 font-bold">Active Now</span>
                                </div>
                                <span className="text-slate-500 text-xs">{new Date(doubt.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <h4 className="text-white font-bold mb-1">{doubt.title}</h4>
                            <p className="text-slate-400 text-sm line-clamp-1 mb-2">Student: {doubt.student?.name || 'Anonymous'}</p>
                        </Link>
                    ))}
                    {assignedDoubts.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            You have no active doubts. Claim one to start!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderWalletTab = () => (
        <div className="grid md:grid-cols-3 gap-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-indigo-600/40 via-purple-700/30 to-rose-700/20 rounded-[2.5rem] p-10 border border-white/10 relative overflow-hidden backdrop-blur-2xl shadow-[0_20px_50px_rgba(79,70,229,0.3)] group"
            >
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-white/80 font-black uppercase tracking-[0.2em] text-xs">Available Funds</p>
                    </div>

                    <div className="flex items-baseline gap-2 mb-10">
                        <span className="text-2xl font-black text-white/50">₹</span>
                        <h2 className="text-7xl font-black text-white tracking-tighter">{wallet?.balance || 0}</h2>
                        <span className="text-indigo-300 font-bold ml-2">Available</span>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <button className="px-8 py-4 bg-white text-indigo-900 font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-105 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.2)] active:scale-95">
                            Withdraw Now
                        </button>
                        <button className="px-8 py-4 bg-white/5 text-white font-black uppercase tracking-widest text-xs rounded-2xl border border-white/10 hover:bg-white/10 transition-all active:scale-95">
                            Full History
                        </button>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-15%] left-[-10%] w-[40%] h-[40%] bg-rose-500/20 rounded-full blur-[80px]" />
            </motion.div>

            <div className="md:col-span-2 bg-gradient-to-br from-[#1e293b]/90 to-[#0f172a]/90 rounded-2xl border border-red-500/10 p-6 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-6">Recent Transactions</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">Doubt Resolution</h4>
                                    <p className="text-slate-500 text-sm">Ref #TXT-88392{i}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-emerald-400 font-black text-lg">+ ₹49.00</p>
                                <p className="text-slate-500 text-xs">Today, 2:30 PM</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const ActivityIcon = Activity || Brain;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-[#1e293b] to-[#0f172a] relative overflow-hidden">
            <TeacherBackground />

            {/* Red/Pink/Orange Gradient Orbs - Increased Opacity for Brightness */}
            <div className="fixed top-[-15%] right-[-10%] w-[45%] h-[45%] bg-rose-500/15 rounded-full blur-[150px] pointer-events-none" />
            <div className="fixed bottom-[-15%] left-[-10%] w-[40%] h-[40%] bg-pink-400/15 rounded-full blur-[150px] pointer-events-none" />
            <div className="fixed top-[50%] left-[20%] w-[25%] h-[25%] bg-orange-400/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-rose-400 to-amber-400">
                                Mentor Dashboard
                            </h1>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">
                            Welcome back, <span className="text-indigo-400 font-bold">{user?.name?.split(' ')[0]}</span>. Your students are waiting!
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            to="/doubts/mentor-analytics"
                            className="px-4 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2 border border-slate-700"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Analytics
                        </Link>
                        <button
                            onClick={toggleAvailability}
                            className={`px-4 py-2.5 font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg ${mentorProfile?.isOnline
                                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-emerald-500/30'
                                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            <Zap className={`w-4 h-4 ${mentorProfile?.isOnline ? 'fill-current' : ''}`} />
                            {mentorProfile?.isOnline ? '🟢 Online' : 'Go Online'}
                        </button>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-1 mb-8 overflow-x-auto pb-2 border-b border-slate-800">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'doubts', label: 'My Doubts', icon: MessageSquare },
                        { id: 'schedule', label: 'Schedule', icon: Calendar },
                        { id: 'wallet', label: 'Wallet', icon: Wallet },
                    ].map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === tab.id
                                    ? 'text-white bg-gradient-to-r from-indigo-600 to-rose-500 shadow-lg shadow-indigo-500/30'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {tab.id === 'doubts' && assignedDoubts.length > 0 && (
                                    <span className="ml-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                                        {assignedDoubts.length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'doubts' && renderDoubtsTab()}
                        {activeTab === 'wallet' && renderWalletTab()}
                        {activeTab === 'schedule' && (
                            <div className="space-y-6">
                                <UpcomingCallsSchedule />
                                <PendingCallsManager />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

// Activity Icon Component
const Activity = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
);

export default MentorDashboard;
