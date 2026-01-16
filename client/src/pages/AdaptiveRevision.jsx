import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import axios from 'axios';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    Home, Mic, RotateCcw, Gift, Bell, Calendar, Clock, Brain,
    CheckCircle2, AlertTriangle, BookOpen, HelpCircle, Code2,
    MessageSquare, ArrowRight, TrendingUp, X, RefreshCw, Award, MessageCircle,
    Target, Flame, ChevronRight, ChevronLeft, Sparkles, Crown
} from 'lucide-react';
import UnderstandingModal from '../components/common/UnderstandingModal';
import UpgradeModal from '../components/common/UpgradeModal';

// ===== THREE.JS ANIMATED BACKGROUND =====
function RevisionBackground() {
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

        // Brain neurons effect
        const neurons = [];
        const neuronGeometry = new THREE.SphereGeometry(0.15, 8, 8);

        for (let i = 0; i < 50; i++) {
            const material = new THREE.MeshBasicMaterial({
                color: i % 3 === 0 ? 0x22d3ee : i % 3 === 1 ? 0xa855f7 : 0x10b981,
                transparent: true,
                opacity: 0.3 + Math.random() * 0.3,
            });
            const neuron = new THREE.Mesh(neuronGeometry, material);
            const side = i % 2 === 0 ? -1 : 1;
            neuron.position.x = side * (15 + Math.random() * 25);
            neuron.position.y = (Math.random() - 0.5) * 50;
            neuron.position.z = (Math.random() - 0.5) * 20 - 10;
            neuron.userData = {
                speed: Math.random() * 0.3 + 0.1,
                offset: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 2 + 1
            };
            neurons.push(neuron);
            scene.add(neuron);
        }

        // Synaptic connections
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.1 });
        const lines = [];
        for (let i = 0; i < neurons.length; i++) {
            for (let j = i + 1; j < neurons.length; j++) {
                if (neurons[i].position.distanceTo(neurons[j].position) < 15) {
                    const geometry = new THREE.BufferGeometry().setFromPoints([neurons[i].position, neurons[j].position]);
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

            neurons.forEach(n => {
                n.position.y += Math.sin(t * n.userData.speed + n.userData.offset) * 0.01;
                n.scale.setScalar(1 + Math.sin(t * n.userData.pulseSpeed) * 0.15);
            });

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
            if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return <div ref={containerRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
}

// ===== REVISION CARD COMPONENT =====
const RevisionCard = ({ revision, onStart, onComplete }) => {
    const typeIcons = {
        notes: BookOpen,
        quiz: HelpCircle,
        recall: Brain,
        coding: Code2,
        explain: MessageSquare
    };
    const Icon = typeIcons[revision.revisionType] || Brain;

    const priorityColors = {
        critical: 'from-red-500/20 to-red-600/30 border-red-500/40',
        high: 'from-orange-500/20 to-amber-600/30 border-orange-500/40',
        medium: 'from-violet-500/20 to-purple-600/30 border-violet-500/40',
        low: 'from-slate-500/20 to-gray-600/30 border-slate-500/40'
    };

    const isOverdue = new Date(revision.scheduledDate) < new Date() && revision.status === 'pending';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative"
        >
            <div className={`relative bg-gradient-to-br ${priorityColors[revision.priority]} backdrop-blur-xl rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02]`}>
                {isOverdue && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-white" />
                    </div>
                )}

                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                        <Icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate">{revision.topicTitle}</h4>
                        <p className="text-slate-400 text-sm truncate">{revision.course.toUpperCase()} • {revision.revisionType}</p>
                    </div>
                </div>

                <p className="text-slate-500 text-xs mt-3 italic">{revision.whyScheduled}</p>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{revision.estimatedMinutes} min</span>
                    </div>
                    <button
                        onClick={() => onStart(revision)}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                    >
                        Start
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// ===== STATS CARD =====
const StatCard = ({ icon: Icon, label, value, subValue, color }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 border border-white/10"
    >
        <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-400 text-sm font-medium">{label}</span>
        </div>
        <div className="text-3xl font-black text-white">{value}</div>
        {subValue && <div className="text-slate-500 text-sm mt-1">{subValue}</div>}
    </motion.div>
);



// ===== WEEK VIEW COMPONENT =====
const WeekView = ({ selectedDate, onDateSelect, revisions }) => {
    // Generate next 7 days starting from today (or simplify to a rolling week)
    const generateWeekDays = () => {
        const days = [];
        const today = new Date();
        // Start from today
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = date.toDateString();
            const hasRevisions = revisions.some(r => new Date(r.scheduledDate).toDateString() === dateStr);
            const isSelected = selectedDate.toDateString() === dateStr;
            const isToday = new Date().toDateString() === dateStr;

            days.push(
                <button
                    key={i}
                    onClick={() => onDateSelect(date)}
                    className={`flex-1 min-w-[60px] h-20 bg-slate-900/40 rounded-xl border transition-all flex flex-col items-center justify-center relative
                        ${isSelected
                            ? 'border-cyan-500 bg-cyan-500/10 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                            : 'border-white/5 text-slate-400 hover:bg-slate-800'
                        }
                    `}
                >
                    <span className={`text-xs uppercase font-bold mb-1 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className={`text-xl font-black ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {date.getDate()}
                    </span>

                    {hasRevisions && (
                        <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-violet-500'}`} />
                    )}

                    {isToday && !isSelected && (
                        <div className="absolute top-2 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    )}
                </button>
            );
        }
        return days;
    };

    return (
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {generateWeekDays()}
        </div>
    );
};

// ===== CALENDAR CALENDAR COMPONENT UPDATED =====
const CalendarView = ({ currentDate, revisions, onDateSelect, selectedDate }) => {
    const [displayDate, setDisplayDate] = useState(new Date(currentDate));

    // Update display month when currentDate changes significantly (handled internally for navigation)
    useEffect(() => {
        // Only force update display if the selected date is far out (optional UX choice)
        // For now, let's keep them somewhat synced or allow independent browsing
    }, [currentDate]);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const handlePrevMonth = () => {
        setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const { days, firstDay } = getDaysInMonth(displayDate);

    // ... rest of the generate logic needs to use displayDate ...
    const generateCalendarDays = () => {
        const daysArr = [];
        for (let i = 0; i < firstDay; i++) {
            daysArr.push(<div key={`empty-${i}`} className="h-10 md:h-14" />);
        }
        for (let i = 1; i <= days; i++) {
            const date = new Date(displayDate.getFullYear(), displayDate.getMonth(), i);
            const dateStr = date.toDateString();
            const hasRevisions = revisions.some(r => new Date(r.scheduledDate).toDateString() === dateStr);
            const isSelected = selectedDate.toDateString() === dateStr;
            const isToday = new Date().toDateString() === dateStr;

            daysArr.push(
                <button
                    key={i}
                    onClick={() => onDateSelect(date)}
                    className={`h-10 md:h-14 rounded-xl flex flex-col items-center justify-center relative transition-all
                        ${isSelected ? 'bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-500/30' :
                            isToday ? 'bg-slate-800 text-cyan-400 border border-cyan-500/50' :
                                'hover:bg-slate-800 text-slate-400 hover:text-white'}
                    `}
                >
                    <span className="text-sm">{i}</span>
                    {hasRevisions && !isSelected && (
                        <div className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-1" />
                    )}
                </button>
            );
        }
        return daysArr;
    };

    return (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-8">
            <div className="flex items-center justify-between mb-6">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-bold text-white">
                    {displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={handleNextMonth} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-slate-500 text-xs font-bold uppercase">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {generateCalendarDays()}
            </div>
        </div>
    );
};

// ===== MAIN COMPONENT =====
export default function AdaptiveRevision({ onSwitchMode }) {
    const { user } = useAuth();
    const [view, setView] = useState('week');
    const [stats, setStats] = useState(null);
    const [todayRevisions, setTodayRevisions] = useState([]);
    const [overdueRevisions, setOverdueRevisions] = useState([]);
    const [upcomingRevisions, setUpcomingRevisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUnderstandingModal, setShowUnderstandingModal] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarRevisions, setCalendarRevisions] = useState([]);

    // Subscription state
    const [subscription, setSubscription] = useState(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);


    // Navigation items
    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Mock Interview', href: '/mock-interview', icon: Mic },
        { name: 'Revision', href: '/adaptive-revision', icon: RotateCcw, active: true },
        { name: 'Rewards', href: '/how-to-earn', icon: Gift },
        { name: 'Connect', href: '/mentors', icon: MessageCircle },
    ];

    useEffect(() => {
        fetchData();
        // Reset selected date to today when switching views, or keep it if needed
        if (view === 'month') {
            setSelectedDate(new Date());
        }
    }, [view]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch 365 days to allow full year looking ahead
            const upcomingDays = 365;

            const [statsRes, todayRes, upcomingRes] = await Promise.all([
                api.get('/adaptive-revision/stats'),
                api.get('/adaptive-revision/today'),
                api.get(`/adaptive-revision/upcoming?days=${upcomingDays}`)
            ]);

            setStats(statsRes.data.data);
            setTodayRevisions(todayRes.data.data.today || []);
            setOverdueRevisions(todayRes.data.data.overdue || []);

            const upcoming = upcomingRes.data.data.revisions || [];
            setCalendarRevisions(upcoming);

            // Initial filter based on selectedDate
            const filtered = upcoming.filter(r =>
                new Date(r.scheduledDate).toDateString() === selectedDate.toDateString()
            );
            setUpcomingRevisions(filtered);

            // Fetch subscription separately to avoid blocking other data
            try {
                const subRes = await api.get('/adaptive-revision/subscription');
                if (subRes.data.success && subRes.data.data) {
                    setSubscription(subRes.data.data);
                } else {
                    // Default to free trial if API returns unexpected format
                    setSubscription({
                        plan: 'free_trial',
                        lecturesUsed: 0,
                        maxFreeLectures: 3,
                        remaining: 3
                    });
                }
            } catch (subError) {
                console.error('Failed to fetch subscription:', subError);
                // Default to free trial on error
                setSubscription({
                    plan: 'free_trial',
                    lecturesUsed: 0,
                    maxFreeLectures: 3,
                    remaining: 3
                });
            }

        } catch (error) {
            console.error('Failed to fetch revision data:', error);
            // Still set default subscription so banner shows
            setSubscription({
                plan: 'free_trial',
                lecturesUsed: 0,
                maxFreeLectures: 3,
                remaining: 3
            });
        } finally {
            setLoading(false);
        }
    };


    const handleUpgrade = async () => {
        try {
            // Demo upgrade - normally would integrate payment gateway here
            await api.post('/adaptive-revision/subscribe');

            // Refresh data
            fetchData();
            setShowUpgradeModal(false);

            // Show success message or confetti here ideally
        } catch (error) {
            console.error('Upgrade failed:', error);
        }
    };

    // Effect to filter revisions when selectedDate changes
    useEffect(() => {
        if (calendarRevisions.length > 0) {
            const filtered = calendarRevisions.filter(r =>
                new Date(r.scheduledDate).toDateString() === selectedDate.toDateString()
            );
            setUpcomingRevisions(filtered);
        } else {
            setUpcomingRevisions([]);
        }
    }, [selectedDate, calendarRevisions]);

    const handleStartRevision = async (revision) => {
        // Check if user is on premium or has free trial lectures remaining
        const isPremium = subscription?.plan === 'premium';
        const canUseAIFeatures = isPremium || (
            subscription?.plan === 'free_trial' &&
            (subscription?.lecturesUsed || 0) < (subscription?.maxFreeLectures || 3)
        );

        if (revision.revisionType === 'quiz') {
            // Navigate to quiz page - quizzes work for all users
            window.location.href = `/revision-quiz/${revision._id}`;
        } else if (canUseAIFeatures) {
            // Premium users or users with free lectures remaining: show understanding modal
            // This modal submits feedback and generates AI revision schedules
            setSelectedTopic({
                revisionId: revision._id,
                topicId: revision.topicId,
                topicTitle: revision.topicTitle,
                course: revision.course,
                revisionType: revision.revisionType,
                whyScheduled: revision.whyScheduled
            });
            setShowUnderstandingModal(true);
        } else {
            // Free users without remaining lectures: just mark as complete
            // and show upsell message
            try {
                await api.post(`/adaptive-revision/complete/${revision._id}`);
                toast.success('Revision marked as complete!', {
                    duration: 3000,
                    icon: '✅'
                });
                // Show premium upsell
                toast((
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">💡 Upgrade to Premium</span>
                        <span className="text-sm">Get AI-powered personalized revision schedules based on your understanding!</span>
                    </div>
                ), {
                    duration: 5000,
                    style: {
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        color: 'white',
                        padding: '12px 16px',
                    },
                });
                fetchData();
            } catch (error) {
                console.error('Failed to complete revision:', error);
                toast.error('Failed to mark as complete');
            }
        }
    };

    const handleCompleteRevision = async (revisionId) => {
        try {
            await api.post(`/adaptive-revision/complete/${revisionId}`);
            fetchData();
        } catch (error) {
            console.error('Failed to complete revision:', error);
        }
    };

    const handleUnderstandingSubmit = async (data) => {
        try {
            // Submit the understanding feedback
            const res = await api.post('/adaptive-revision/feedback', {
                ...data,
                topicId: selectedTopic.topicId,
                topicTitle: selectedTopic.topicTitle,
                course: selectedTopic.course
            });

            if (res.data.data?.subscription) {
                setSubscription(res.data.data.subscription);
            }

            // Also mark the revision as completed
            if (selectedTopic?.revisionId) {
                await api.post(`/adaptive-revision/complete/${selectedTopic.revisionId}`);
            }

            setShowUnderstandingModal(false);
            setSelectedTopic(null);
            fetchData();
        } catch (error) {
            console.error('Failed to submit understanding:', error);
            if (error.response?.status === 403 && error.response?.data?.requiresUpgrade) {
                setShowUnderstandingModal(false);
                setShowUpgradeModal(true);
            }
        }
    };

    const handleGenerateCatchup = async () => {
        try {
            await api.post('/adaptive-revision/catchup');
            fetchData();
        } catch (error) {
            console.error('Failed to generate catchup:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] relative overflow-x-hidden">
            <RevisionBackground />

            {/* Gradient Orbs */}
            <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="fixed bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />



            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
                {/* Header with Switch Mode */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 rounded-full border border-violet-500/20">
                        <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-violet-300">Adaptive AI Mode</span>
                    </div>
                    {onSwitchMode && (
                        <button
                            onClick={onSwitchMode}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-sm transition-all"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Switch Mode
                        </button>
                    )}
                </div>

                {/* Free Trial Banner / Upgrade Button */}
                {subscription && subscription.plan !== 'premium' && (
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-violet-500/20 transition-all border border-white/10"
                        >
                            <Crown className="w-4 h-4" />
                            Upgrade to Premium
                        </button>
                    </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={Target}
                        label="Retention Score"
                        value={stats?.retentionScore || 0}
                        subValue="Keep it above 80!"
                        color="bg-gradient-to-br from-cyan-500 to-cyan-600"
                    />
                    <StatCard
                        icon={Flame}
                        label="Revision Streak"
                        value={`${stats?.streak || 0} 🔥`}
                        subValue="Days in a row"
                        color="bg-gradient-to-br from-orange-500 to-red-500"
                    />
                    <StatCard
                        icon={CheckCircle2}
                        label="Today's Target"
                        value={todayRevisions.length}
                        subValue={overdueRevisions.length > 0 ? `+${overdueRevisions.length} overdue` : 'All caught up!'}
                        color="bg-gradient-to-br from-emerald-500 to-green-600"
                    />
                    <StatCard
                        icon={Clock}
                        label="Time Saved"
                        value="4.5h"
                        subValue="Skipped redundant topics"
                        color="bg-gradient-to-br from-violet-500 to-purple-600"
                    />
                </div>

                {/* Subscription Status Banner */}
                {subscription && subscription.plan !== 'premium' && (
                    <div className="mb-8">
                        <div className="bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">
                                        {subscription.plan === 'expired' ? 'Premium Expired' : 'Free Trial Active'}
                                    </h3>
                                    <p className="text-slate-400 text-sm">
                                        {subscription.plan === 'expired'
                                            ? 'Renew your subscription to continue'
                                            : <>You've used <span className="text-white">{subscription.lecturesUsed || 0}/{subscription.maxFreeLectures || 3}</span> free lectures</>}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowUpgradeModal(true)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors"
                            >
                                {subscription.plan === 'expired' ? 'Renew Now' : 'Upgrade Now'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Overdue Section */}
                {overdueRevisions.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-black text-red-400 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Overdue Revisions
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {overdueRevisions.map((rev) => (
                                <RevisionCard
                                    key={rev._id}
                                    revision={rev}
                                    onStart={handleStartRevision}
                                    onComplete={handleCompleteRevision}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Today's Revisions */}
                <div className="mb-8">
                    <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-cyan-400" />
                        Today's Revisions
                    </h2>
                    {todayRevisions.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {todayRevisions.map((rev) => (
                                <RevisionCard
                                    key={rev._id}
                                    revision={rev}
                                    onStart={handleStartRevision}
                                    onComplete={handleCompleteRevision}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-900/50 rounded-2xl p-8 text-center border border-white/10">
                            <Award className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">All caught up! 🎉</h3>
                            <p className="text-slate-400">No revisions scheduled for today.</p>
                        </div>
                    )}
                </div>

                {/* Schedule Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-violet-400" />
                            Revision Schedule
                        </h2>

                        {/* View Selector */}
                        <div className="bg-slate-900/60 p-1 rounded-xl border border-white/10 flex self-start">
                            {['week', 'month'].map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setView(v)}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${view === v
                                        ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {v} View
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Views */}
                    {view === 'week' ? (
                        <WeekView
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                            revisions={calendarRevisions}
                        />
                    ) : (
                        <CalendarView
                            currentDate={selectedDate}
                            revisions={calendarRevisions}
                            onDateSelect={setSelectedDate}
                            selectedDate={selectedDate}
                        />
                    )}

                    <div className="mt-6">
                        <h3 className="text-lg font-bold text-white mb-4 pl-1 flex items-center gap-2">
                            <div className="w-2 h-8 bg-cyan-500 rounded-full" />
                            For {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h3>

                        {upcomingRevisions.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {upcomingRevisions.map((rev) => (
                                    <div key={rev._id} className="bg-slate-900/40 rounded-xl p-4 border border-white/5 hover:border-cyan-500/30 transition-all group">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                                                <Brain className="w-5 h-5 text-cyan-400" />
                                            </div>
                                            <div className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 font-mono">
                                                {rev.revisionType}
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{rev.topicTitle}</h4>
                                        <p className="text-xs text-slate-500 mb-4">{rev.course.toUpperCase()}</p>

                                        <button
                                            onClick={() => handleStartRevision(rev)}
                                            className="w-full py-2 bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 rounded-lg text-sm font-bold transition-all border border-transparent hover:border-cyan-500/30"
                                        >
                                            Start Revision
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 border-2 border-dashed border-slate-800 rounded-2xl text-center">
                                <p className="text-slate-500">No revisions scheduled for this date.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Understanding Modal */}
            <UnderstandingModal
                isOpen={showUnderstandingModal}
                onClose={() => setShowUnderstandingModal(false)}
                onSubmit={handleUnderstandingSubmit}
                topic={selectedTopic}
            />

            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                onUpgrade={handleUpgrade}
                subscription={subscription}
            />
        </div>
    );
}
