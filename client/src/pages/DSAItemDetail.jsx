import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ArrowRight, Check, BookOpen, Code2, MessageSquare, FileText,
    Copy, CheckCircle, ExternalLink, ThumbsUp, Clock, Youtube, Play, Lock,
    ChevronDown, ChevronRight, Send, User, Menu, X, Circle, Grid3X3, Crown
} from 'lucide-react';
import { getPatternBySlug, getItemBySlug, dsaPatterns } from '../data/dsaPatterns';
import CtoBhaiyaClipPlayer from '../components/CtoBhaiyaClipPlayer';
import LockedCodeViewer, { isVideoWatched } from '../components/LockedCodeViewer';
import { getCtoBhaiyaClip } from '../services/ctoBhaiyaClipsService';
import UnderstandingModal from '../components/common/UnderstandingModal';
import api from '../services/api';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Internal Component: Lecture Note Viewer
function LectureNoteViewer({ url, noteOptions }) {
    const [scale, setScale] = useState(0.1); // Start at 10% for very large SVGs
    const [selectedNoteIndex, setSelectedNoteIndex] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isDownloading, setIsDownloading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const containerRef = useRef(null);

    const displayUrl = noteOptions && noteOptions.length > 0 ? noteOptions[selectedNoteIndex].url : url;

    // Reset loading state when URL changes
    useEffect(() => {
        setIsLoading(true);
        setHasError(false);
    }, [displayUrl]);

    // Preset zoom levels
    const zoomPresets = [
        { label: '10%', value: 0.1 },
        { label: '25%', value: 0.25 },
        { label: '50%', value: 0.5 },
        { label: '100%', value: 1 },
    ];

    const zoomIn = () => setScale(s => Math.min(10, +(s + 0.5).toFixed(2)));
    const zoomOut = () => setScale(s => Math.max(0.1, +(s - 0.5).toFixed(2)));
    const setZoomPreset = (value) => { setScale(value); setPosition({ x: 0, y: 0 }); };
    const reset = () => { setScale(0.1); setPosition({ x: 0, y: 0 }); };

    const handleWheel = useCallback((e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = -e.deltaY * 0.001;
            setScale(s => Math.min(10, Math.max(0.1, +(s + delta * s).toFixed(2))));
        }
    }, []);

    const handleMouseDown = (e) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        e.currentTarget.style.cursor = 'grabbing';
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }, [isDragging, dragStart]);

    const handleMouseUp = useCallback(() => setIsDragging(false), []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const handleDownload = async () => {
        try {
            setIsDownloading(true);
            const response = await fetch(displayUrl);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = displayUrl.split('/').pop() || 'lecture-notes.svg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Download failed:', error);
            window.open(displayUrl, '_blank');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Manual zoom controls */}
                    <div className="flex items-center gap-1">
                        <button onClick={zoomOut} className="px-3 py-2 rounded-lg bg-[#252525] border border-gray-700 hover:bg-[#303030] text-gray-300 font-bold">−</button>
                        <span className="px-3 py-2 rounded-lg bg-[#252525] border border-gray-700 text-orange-400 min-w-[60px] text-center text-sm">{Math.round(scale * 100)}%</span>
                        <button onClick={zoomIn} className="px-3 py-2 rounded-lg bg-[#252525] border border-gray-700 hover:bg-[#303030] text-gray-300 font-bold">+</button>
                    </div>

                    {/* Preset zoom buttons */}
                    <div className="flex items-center gap-1 ml-2">
                        {zoomPresets.map((preset) => (
                            <button
                                key={preset.value}
                                onClick={() => setZoomPreset(preset.value)}
                                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${Math.round(scale * 100) === Math.round(preset.value * 100)
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-[#252525] border border-gray-700 hover:bg-[#303030] text-gray-400 hover:text-white'
                                    }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    <button onClick={reset} className="px-3 py-2 rounded-lg bg-[#252525] border border-gray-700 hover:bg-[#303030] text-gray-300 text-sm ml-2">Reset</button>
                </div>
                <div className="flex items-center gap-2">
                    {noteOptions && noteOptions.length > 1 && (
                        <select
                            value={selectedNoteIndex}
                            onChange={(e) => { setSelectedNoteIndex(Number(e.target.value)); setPosition({ x: 0, y: 0 }); }}
                            className="px-3 py-2 rounded-lg bg-[#252525] border border-gray-700 text-orange-400 cursor-pointer"
                        >
                            {noteOptions.map((opt, idx) => <option key={idx} value={idx}>{opt.label}</option>)}
                        </select>
                    )}
                    <button onClick={handleDownload} disabled={isDownloading} className="px-3 py-2 rounded-lg bg-[#252525] border border-gray-700 hover:bg-[#303030] text-cyan-400 text-sm disabled:opacity-50">
                        {isDownloading ? 'Downloading...' : 'Download'}
                    </button>
                </div>
            </div>
            <div ref={containerRef} className="relative h-[600px] w-full bg-[#050505] border border-gray-800 rounded-xl overflow-auto"
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }} onMouseDown={handleMouseDown} onWheel={handleWheel}>
                {/* Loading state */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#050505] z-10">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
                            <p className="text-gray-400">Loading notes...</p>
                        </div>
                    </div>
                )}
                {/* Error state */}
                {hasError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#050505] z-10">
                        <div className="text-center text-red-400">
                            <p className="mb-2">Failed to load notes</p>
                            <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">Open in new tab</a>
                        </div>
                    </div>
                )}
                <img
                    src={displayUrl}
                    alt="Notes"
                    draggable={false}
                    onLoad={() => setIsLoading(false)}
                    onError={() => { setIsLoading(false); setHasError(true); }}
                    className="max-w-none"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: 'top left',
                        display: isLoading || hasError ? 'none' : 'block'
                    }}
                />
            </div>
        </div>
    );
}


// Mock discussion data
const mockDiscussions = [
    {
        id: '1', author: 'Rahul Bhaiya', avatar: 'R',
        content: `## My Intuition\n\nThe key insight here is that we can use a sliding window approach...`,
        likes: 42, timestamp: '2 hours ago', replies: []
    }
];

export default function DSAItemDetail() {
    const { patternSlug, itemSlug } = useParams();
    const navigate = useNavigate();

    // Data assignment (moved to top to avoid ReferenceError)
    const pattern = getPatternBySlug(patternSlug);
    const item = getItemBySlug(patternSlug, itemSlug);

    // Core state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expandedPatterns, setExpandedPatterns] = useState({});

    // Item state
    const [activeTab, setActiveTab] = useState('theory');
    const [isCompleted, setIsCompleted] = useState(false);
    const [activeCodeLang, setActiveCodeLang] = useState('cpp');
    const [copiedCode, setCopiedCode] = useState(false);
    const [discussions, setDiscussions] = useState(mockDiscussions);
    const [newComment, setNewComment] = useState('');
    const [ctoClip, setCtoClip] = useState(null);
    const [ctoClipLoaded, setCtoClipLoaded] = useState(false);
    const [isSolutionUnlocked, setIsSolutionUnlocked] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [subscription, setSubscription] = useState(null);

    // Engagement & Teaser State
    const [showTeaserModal, setShowTeaserModal] = useState(false);
    const [resourcesUnlocked, setResourcesUnlocked] = useState(false);
    const [teaserEnded, setTeaserEnded] = useState(false);

    // Initial load: Check for unlocked resources
    useEffect(() => {
        if (item) {
            const unlockedItems = JSON.parse(localStorage.getItem('dsa-unlocked-resources') || '[]');
            if (unlockedItems.includes(item.id)) {
                setResourcesUnlocked(true);
            }
        }
    }, [item]);

    const handleUnlockResources = () => {
        const unlockedItems = JSON.parse(localStorage.getItem('dsa-unlocked-resources') || '[]');
        if (!unlockedItems.includes(item.id)) {
            unlockedItems.push(item.id);
            localStorage.setItem('dsa-unlocked-resources', JSON.stringify(unlockedItems));
        }
        setResourcesUnlocked(true);
        setIsSolutionUnlocked(true); // Fix: Ensure code solutions are also unlocked
        setShowTeaserModal(false);
        toast.success('Resources unlocked! 🚀');
    };



    // Derived navigation
    const currentIndex = pattern?.items?.findIndex(i => i.slug === itemSlug) ?? -1;
    const prevItem = currentIndex > 0 ? pattern?.items[currentIndex - 1] : null;
    const nextItem = currentIndex >= 0 && currentIndex < (pattern?.items?.length ?? 0) - 1 ? pattern?.items[currentIndex + 1] : null;

    // Load completion state & video
    useEffect(() => {
        const saved = localStorage.getItem('dsa-completed-items');
        const completed = saved ? JSON.parse(saved) : [];
        setIsCompleted(completed.includes(item?.id));
    }, [item?.id]);

    // Fetch subscription status
    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const res = await api.get('/adaptive-revision/subscription');
                if (res.data.success) {
                    setSubscription(res.data.data);
                }
            } catch (error) {
                // Default to free trial if fetch fails
                setSubscription({
                    plan: 'free_trial',
                    lecturesUsed: 0,
                    maxFreeLectures: 3
                });
            }
        };
        fetchSubscription();
    }, []);

    useEffect(() => {
        if (pattern?.id) {
            setExpandedPatterns(prev => ({ ...prev, [pattern.id]: true }));
        }
    }, [pattern?.id]);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            // Reset unlock state when item changes
            setIsSolutionUnlocked(false);
            setShowTeaserModal(false);
            setTeaserEnded(false);

            if (!pattern?.name || !item?.title) return;
            setCtoClipLoaded(false);
            const clip = await getCtoBhaiyaClip({ pattern: pattern.name, question: item.title });

            if (mounted) {
                setCtoClip(clip);
                setCtoClipLoaded(true);

                // Initial unlock check
                if (clip?.videoId) {
                    const watched = isVideoWatched(clip.videoId, clip.startTime, clip.endTime);
                    setIsSolutionUnlocked(watched);
                } else {
                    // Unlock if no video required? Or default to locked?
                    // User requirement: "solution before video ends" -> implies video is main gate.
                    // If video is missing, we probably should unlock or show "No solution"?
                    // Let's assume unlocked if no video exists to prevent softlock.
                    setIsSolutionUnlocked(true);
                }
            }
        };
        load();
        return () => { mounted = false; };
    }, [pattern?.name, item?.title, item?.id]); // Added item.id dependency

    // Listen for video completion
    useEffect(() => {
        const handleUnlock = (e) => {
            if (ctoClip && e.detail.videoId === ctoClip.videoId) {
                setIsSolutionUnlocked(true);
            }
        };
        window.addEventListener('videoCompleted', handleUnlock);

        // Also listen for immediate storage updates if needed, but event is safer
        return () => window.removeEventListener('videoCompleted', handleUnlock);
    }, [ctoClip]);


    const toggleComplete = (itemId = item.id) => {
        const saved = localStorage.getItem('dsa-completed-items');
        let completed = saved ? JSON.parse(saved) : [];
        const isCurrentlyCompleted = completed.includes(itemId);

        if (isCurrentlyCompleted) {
            completed = completed.filter(id => id !== itemId);
            localStorage.setItem('dsa-completed-items', JSON.stringify(completed));
            if (itemId === item.id) setIsCompleted(false);
        } else {
            // Check if user can use AI features (premium or has free lectures remaining)
            const isPremium = subscription?.plan === 'premium';
            const canUseAIFeatures = isPremium || (
                subscription?.plan === 'free_trial' &&
                (subscription?.lecturesUsed || 0) < (subscription?.maxFreeLectures || 3)
            );

            if (itemId === item.id) {
                if (canUseAIFeatures) {
                    // Premium or free trial with lectures remaining: show understanding modal
                    setShowFeedbackModal(true);
                } else {
                    // Free users who exceeded limit: just mark complete + show upsell
                    completed.push(itemId);
                    localStorage.setItem('dsa-completed-items', JSON.stringify(completed));
                    setIsCompleted(true);

                    toast.success('Lecture marked as complete!', {
                        duration: 2000,
                        icon: '✅'
                    });

                    // Show premium upsell
                    toast((
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Crown className="w-4 h-4 text-yellow-400" />
                                <span className="font-bold">Upgrade to Premium</span>
                            </div>
                            <span className="text-sm opacity-90">Get AI-powered personalized revision schedules tailored to your understanding!</span>
                        </div>
                    ), {
                        duration: 5000,
                        style: {
                            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                            color: 'white',
                            padding: '12px 16px',
                        },
                    });
                }
            } else {
                completed.push(itemId);
                localStorage.setItem('dsa-completed-items', JSON.stringify(completed));
            }
        }
    };

    const handleFeedbackSubmit = async (data) => {
        try {
            const res = await api.post('/adaptive-revision/feedback', {
                course: 'dsa',
                topicId: item.slug,
                topicTitle: item.title,
                understandingLevel: data.understandingLevel,
                notes: data.notes
            });

            if (res.data.success) {
                // Update subscription state to prevent stale data
                if (res.data.data.subscription) {
                    setSubscription(prev => ({
                        ...prev,
                        ...res.data.data.subscription
                    }));
                }

                // After feedback, mark as complete locally
                const saved = localStorage.getItem('dsa-completed-items');
                let completed = saved ? JSON.parse(saved) : [];
                if (!completed.includes(item.id)) {
                    completed.push(item.id);
                    localStorage.setItem('dsa-completed-items', JSON.stringify(completed));
                }
                setIsCompleted(true);
                setShowFeedbackModal(false);
                toast.success('Feedback recorded! AI Schedule updated.');
            }
        } catch (error) {
            console.error('Failed to submit understanding feedback:', error);

            if (error.response && (error.response.status === 403 || error.response.data?.requiresUpgrade)) {
                toast.error('Free limit reached! Upgrade to Premium to save AI feedback.', {
                    duration: 4000,
                    icon: '🔒'
                });
                // Update local subscription state to reflect limit reached
                setSubscription(prev => ({
                    ...prev,
                    lecturesUsed: (prev?.maxFreeLectures || 3), // Force max
                }));
            } else {
                // Even if API fails for other reasons, we mark as complete locally
                const saved = localStorage.getItem('dsa-completed-items');
                let completed = saved ? JSON.parse(saved) : [];
                if (!completed.includes(item.id)) {
                    completed.push(item.id);
                    localStorage.setItem('dsa-completed-items', JSON.stringify(completed));
                }
                setIsCompleted(true);
                toast.success('Marked complete (Offline mode)');
            }
            setShowFeedbackModal(false);
        }
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    if (!pattern || !item) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Item not found</div>;

    const tabs = [
        { id: 'theory', label: 'Theory', icon: BookOpen },
        { id: 'solution', label: 'Solution', icon: Code2 },
        { id: 'notes', label: 'Notes', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex overflow-hidden font-sans">

            {/* Sidebar */}
            <aside className={`fixed md:relative z-40 w-80 h-screen bg-[#0f0f15]/95 backdrop-blur-xl border-r border-gray-800 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[#0a0a0a]">
                    <Link to="/dsa-shuru-karein" className="flex items-center gap-3">
                        <img src="/favicon.png" alt="DSA" className="w-8 h-8 object-contain" />
                        <span className="font-bold text-white text-sm">DSA Course</span>
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400"><X /></button>
                </div>

                <div className="overflow-y-auto h-[calc(100vh-65px)] pb-10">
                    {dsaPatterns.map(p => {
                        const isExpanded = expandedPatterns[p.id];
                        const saved = localStorage.getItem('dsa-completed-items');
                        const completedList = saved ? JSON.parse(saved) : [];

                        return (
                            <div key={p.id} className="border-b border-gray-800/50">
                                <button
                                    onClick={() => setExpandedPatterns(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="text-xl flex-shrink-0">{p.icon}</div>
                                        <span className={`text-sm font-medium truncate ${isExpanded ? 'text-white' : 'text-gray-400'}`}>{p.name}</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-[#050505]">
                                            {p.items.map(i => {
                                                const isActive = i.slug === itemSlug;
                                                const isDone = completedList.includes(i.id);
                                                return (
                                                    <Link
                                                        key={i.id}
                                                        to={`/dsa/${p.slug}/${i.slug}`}
                                                        className={`flex items-center gap-3 px-4 py-3 text-sm border-l-2 transition-all ${isActive
                                                            ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                                                            : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                                            }`}
                                                    >
                                                        {isDone
                                                            ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                            : <Circle className="w-4 h-4 flex-shrink-0" />
                                                        }
                                                        <span className="truncate">{i.title}</span>
                                                    </Link>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </aside>

            {/* Mobile Toggle */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="fixed bottom-6 left-6 z-50 md:hidden w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg text-white"
            >
                <Menu />
            </button>

            {/* Main Content Area */}
            <main className="flex-1 h-screen overflow-y-auto bg-[#0a0a0a] relative">

                {/* Premium Video Player Container */}
                <div className="relative w-full bg-[#050505] border-b border-gray-800">
                    <div className="absolute inset-0 bg-orange-500/5 blur-3xl pointer-events-none" />

                    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
                        <div className="relative group aspect-video rounded-2xl overflow-hidden border border-gray-800 shadow-2xl bg-black">
                            {ctoClip?.videoId ? (
                                <CtoBhaiyaClipPlayer
                                    key={`${ctoClip.videoId}-${ctoClip.startTime}-${ctoClip.endTime}`}
                                    videoId={ctoClip.videoId}
                                    startTime={ctoClip.startTime}
                                    endTime={ctoClip.endTime}
                                    title={ctoClip.question || item.title}
                                    className="w-full h-full"
                                    teaserDuration={!resourcesUnlocked ? 10 : 0} // 10s teaser if locked
                                    onTeaserEnd={() => {
                                        setTeaserEnded(true);
                                        setShowTeaserModal(true);
                                    }}
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-gray-500 bg-[#0f0f15]">
                                    {ctoClipLoaded ? "Video explanation coming soon" : "Loading video..."}
                                </div>
                            )}

                            {/* Engagement Modal Overlay */}
                            <AnimatePresence>
                                {showTeaserModal && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                                    >
                                        <motion.div
                                            initial={{ scale: 0.9, y: 20 }}
                                            animate={{ scale: 1, y: 0 }}
                                            className="bg-[#0f0f15] border border-orange-500/20 rounded-2xl max-w-lg w-full p-8 shadow-2xl relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-600" />

                                            <div className="text-center space-y-6">
                                                <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                                                    <Youtube className="w-8 h-8 text-red-500" />
                                                </div>

                                                <div>
                                                    <h3 className="text-2xl font-bold text-white mb-2">Continue Watching on YouTube</h3>
                                                    <p className="text-gray-400 text-sm leading-relaxed">
                                                        This lecture lives on YouTube to support the creator ❤️.
                                                        Drop a comment to <span className="text-white font-bold">automatically unlock</span> notes & discussion!
                                                    </p>
                                                </div>

                                                <div className="flex flex-col gap-3 pt-2">
                                                    <a
                                                        href={`https://www.youtube.com/watch?v=${ctoClip?.videoId}${ctoClip?.startTime ? `&t=${ctoClip.startTime}s` : ''}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 group transition-all"
                                                        onClick={() => setTimeout(() => setTeaserEnded(true), 1000)} // Ensure state sync
                                                    >
                                                        <Play className="w-5 h-5 fill-current" />
                                                        Watch Full Video
                                                        <ExternalLink className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                                                    </a>

                                                    <button
                                                        onClick={handleUnlockResources}
                                                        className="w-full py-4 bg-[#1a1a1a] hover:bg-[#252525] text-gray-300 font-medium rounded-xl border border-gray-800 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <MessageSquare className="w-5 h-5" />
                                                        I've Commented & Liked
                                                    </button>
                                                </div>

                                                <p className="text-xs text-gray-600 font-medium tracking-wide pt-4">
                                                    WATCH • ENGAGE • UNLOCK
                                                </p>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 space-y-10 pb-24">

                    {/* Header & Actions */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gray-800">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{pattern.name}</span>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-orange-400">Lesson {currentIndex + 1}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">{item.title}</h1>
                        </div>

                        <div className="flex gap-3">
                            {item.externalLink && (
                                <a
                                    href={item.externalLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all bg-[#1a1a1a] text-white border border-gray-800 hover:bg-[#252525]"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                    Solve on LeetCode
                                </a>
                            )}
                            <button
                                onClick={() => toggleComplete()}
                                className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${isCompleted
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20'
                                    }`}
                            >
                                {isCompleted ? <><CheckCircle className="w-5 h-5" /> Completed</> : <><Check className="w-5 h-5" /> MARK COMPLETED</>}
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-8 border-b border-gray-800">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-4 text-sm font-medium transition-all relative ${activeTab === tab.id ? 'text-orange-400' : 'text-gray-500 hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </div>
                                {activeTab === tab.id && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="min-h-[300px]"
                        >
                            {activeTab === 'theory' && (
                                <div className="space-y-6">
                                    <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                                        {item.description
                                            ? <div dangerouslySetInnerHTML={{ __html: item.description }} />
                                            : <p>{item.theory?.explanation || "No theory available."}</p>
                                        }
                                    </div>
                                </div>
                            )}

                            {!resourcesUnlocked && activeTab !== 'theory' ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 border border-gray-800 rounded-2xl bg-[#0f0f15]/50">
                                    <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center">
                                        <Lock className="w-8 h-8 text-gray-500" />
                                    </div>
                                    <div className="max-w-md mx-auto">
                                        <h3 className="text-xl font-bold text-white mb-2">Content Locked</h3>
                                        <p className="text-gray-400">
                                            This content is locked to support the creator. Watch the video on YouTube and drop a comment to unlock everything instantly!
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowTeaserModal(true)}
                                        className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
                                    >
                                        Unlock Content
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Unlocked Content */}

                                    {activeTab === 'solution' && (
                                        <div className="space-y-8">
                                            {/* Locked Viewer */}
                                            {ctoClip?.videoId && (
                                                <LockedCodeViewer
                                                    javaCode={ctoClip.javaCode}
                                                    cppCode={ctoClip.cppCode}
                                                    intuition={ctoClip.intuition}
                                                    videoId={ctoClip.videoId}
                                                    startTime={ctoClip.startTime}
                                                    endTime={ctoClip.endTime}
                                                    unlocked={isSolutionUnlocked}
                                                />
                                            )}

                                            {/* Generic Code Solutions - Gate Check */}
                                            {isSolutionUnlocked && item.solutions?.code && (
                                                <div className="bg-[#12121a] border border-gray-800 rounded-xl overflow-hidden">
                                                    <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-gray-800">
                                                        <div className="flex gap-4">
                                                            {Object.keys(item.solutions.code).map(lang => (
                                                                <button
                                                                    key={lang}
                                                                    onClick={() => setActiveCodeLang(lang)}
                                                                    className={`text-sm py-2 ${activeCodeLang === lang ? 'text-orange-400 font-bold' : 'text-gray-500 hover:text-white'}`}
                                                                >
                                                                    {lang.toUpperCase()}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <button onClick={() => copyCode(item.solutions.code[activeCodeLang])} className="text-gray-400 hover:text-white"><Copy className="w-4 h-4" /></button>
                                                    </div>
                                                    <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-300">
                                                        {item.solutions.code[activeCodeLang]}
                                                    </pre>
                                                </div>
                                            )}

                                            {!isSolutionUnlocked && item.solutions?.code && !ctoClip?.videoId && (
                                                <div className="p-8 text-center text-gray-500 bg-[#12121a] rounded-xl border border-gray-800">
                                                    <Code2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                                    <p>Solutions are locked. Please complete the theory/video.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'notes' && (
                                        <div className="bg-[#12121a] border border-gray-800 rounded-xl p-6">
                                            {(() => {
                                                // Check for item-specific notes first
                                                const itemNote = item?.lectureNotesSvg;
                                                const itemPdfNote = item?.lectureNotesPdf;

                                                // Pattern-level notes only apply to theory items
                                                const patternLectureNotes = pattern?.lectureNotes || [];
                                                const isTheoryItem = item?.isTheory || item?.difficulty === 'theory';

                                                // Determine which notes to show:
                                                // 1. Item's own lectureNotesSvg (if exists)
                                                // 2. Item's own lectureNotesPdf (if exists)
                                                // 3. Pattern's lectureNotes (only for theory items)
                                                // 4. ctoClip notes (if available)
                                                let primaryNote = null;
                                                let noteOptions = null;
                                                let isPdf = false;

                                                if (itemNote) {
                                                    primaryNote = itemNote;
                                                } else if (itemPdfNote) {
                                                    primaryNote = itemPdfNote;
                                                    isPdf = true;
                                                } else if (isTheoryItem && patternLectureNotes.length > 0) {
                                                    primaryNote = patternLectureNotes[0];
                                                    noteOptions = patternLectureNotes.map((url, idx) => ({ url, label: `Notes ${idx + 1}` }));
                                                } else if (ctoClip?.lectureNotesSvg) {
                                                    primaryNote = ctoClip.lectureNotesSvg;
                                                    noteOptions = ctoClip.lectureNotesSvgOptions;
                                                }

                                                if (primaryNote) {
                                                    // Handle PDF notes
                                                    if (isPdf || primaryNote.toLowerCase().includes('.pdf')) {
                                                        return (
                                                            <div className="text-center py-8">
                                                                <FileText className="w-16 h-16 mx-auto mb-4 text-orange-500" />
                                                                <h3 className="text-xl font-bold text-white mb-2">PDF Lecture Notes Available</h3>
                                                                <p className="text-gray-400 mb-6">Click below to view the PDF notes for this problem</p>
                                                                <a
                                                                    href={primaryNote}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all hover:scale-105"
                                                                >
                                                                    <ExternalLink className="w-5 h-5" />
                                                                    View PDF Notes
                                                                </a>
                                                            </div>
                                                        );
                                                    }
                                                    // Handle SVG notes
                                                    if (primaryNote.toLowerCase().includes('.svg') || (Array.isArray(primaryNote) && primaryNote[0].includes('.svg'))) {
                                                        const url = Array.isArray(primaryNote) ? primaryNote[0] : primaryNote;
                                                        const rawUrl = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
                                                        return <LectureNoteViewer key={`${item?.slug}-${rawUrl}`} url={rawUrl} noteOptions={noteOptions} />;
                                                    }
                                                    return <a href={primaryNote} target="_blank" className="text-orange-400 underline">Open Notes</a>;
                                                }

                                                // No notes available for this specific problem
                                                return (
                                                    <div className="text-center py-8">
                                                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                                                        <p className="text-gray-400">No specific notes available for this problem.</p>
                                                        <p className="text-gray-500 text-sm mt-2">Check the pattern theory section for conceptual notes.</p>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Footer */}
                    <div className="grid grid-cols-2 gap-4 pt-10 border-t border-gray-800 mt-10">
                        {prevItem ? (
                            <button
                                onClick={() => navigate(`/dsa/${patternSlug}/${prevItem.slug}`)}
                                className="group p-4 rounded-xl border border-gray-800 hover:border-orange-500/30 bg-[#12121a] text-left transition-all hover:bg-orange-500/5"
                            >
                                <div className="text-xs text-gray-500 mb-1 group-hover:text-orange-400">Previous</div>
                                <div className="font-bold text-gray-200 group-hover:text-white truncate">{prevItem.title}</div>
                            </button>
                        ) : <div />}

                        {nextItem ? (
                            <button
                                onClick={() => navigate(`/dsa/${patternSlug}/${nextItem.slug}`)}
                                className="group p-4 rounded-xl border border-gray-800 hover:border-orange-500/30 bg-[#12121a] text-right transition-all hover:bg-orange-500/5"
                            >
                                <div className="text-xs text-gray-500 mb-1 group-hover:text-orange-400">Next</div>
                                <div className="font-bold text-gray-200 group-hover:text-white truncate">{nextItem.title}</div>
                            </button>
                        ) : (
                            <Link to="/dsa-shuru-karein" className="p-4 rounded-xl bg-orange-500 text-white font-bold text-center flex items-center justify-center">
                                Pattern Complete! 🎉
                            </Link>
                        )}
                    </div>
                </div>
            </main>

            <UnderstandingModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                onSubmit={handleFeedbackSubmit}
                topic={{ title: item.title, topicTitle: item.title }}
            />
        </div>
    );
}
