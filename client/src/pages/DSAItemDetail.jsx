import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ArrowRight, Check, BookOpen, Code2, MessageSquare, FileText,
    Copy, CheckCircle, ExternalLink, ThumbsUp, Clock,
    ChevronDown, ChevronRight, Send, User, Menu, X, Circle, Grid3X3
} from 'lucide-react';
import { getPatternBySlug, getItemBySlug, dsaPatterns } from '../data/dsaPatterns';
import CtoBhaiyaClipPlayer from '../components/CtoBhaiyaClipPlayer';
import LockedCodeViewer, { isVideoWatched } from '../components/LockedCodeViewer';
import { getCtoBhaiyaClip } from '../services/ctoBhaiyaClipsService';
import UnderstandingModal from '../components/common/UnderstandingModal';
import api from '../services/api';
import axios from 'axios';

// Internal Component: Lecture Note Viewer
function LectureNoteViewer({ url, noteOptions }) {
    const [scale, setScale] = useState(1);
    const [selectedNoteIndex, setSelectedNoteIndex] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isDownloading, setIsDownloading] = useState(false);
    const containerRef = useRef(null);

    const displayUrl = noteOptions && noteOptions.length > 0 ? noteOptions[selectedNoteIndex].url : url;

    const zoomIn = () => setScale(s => Math.min(10, +(s + 0.5).toFixed(2)));
    const zoomOut = () => setScale(s => Math.max(0.25, +(s - 0.5).toFixed(2)));
    const reset = () => { setScale(1); setPosition({ x: 0, y: 0 }); };

    const handleWheel = useCallback((e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = -e.deltaY * 0.001;
            setScale(s => Math.min(10, Math.max(0.25, +(s + delta * s).toFixed(2))));
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
                <div className="flex items-center gap-2">
                    <button onClick={zoomOut} className="px-3 py-2 rounded-lg bg-[#252525] border border-gray-700 hover:bg-[#303030] text-gray-300 font-bold">−</button>
                    <span className="px-3 py-2 rounded-lg bg-[#252525] border border-gray-700 text-orange-400 min-w-[60px] text-center text-sm">{Math.round(scale * 100)}%</span>
                    <button onClick={zoomIn} className="px-3 py-2 rounded-lg bg-[#252525] border border-gray-700 hover:bg-[#303030] text-gray-300 font-bold">+</button>
                    <button onClick={reset} className="px-3 py-2 rounded-lg bg-[#252525] border border-gray-700 hover:bg-[#303030] text-gray-300 text-sm">Reset</button>
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
            <div ref={containerRef} className="relative h-[600px] w-full bg-[#050505] border border-gray-800 rounded-xl overflow-hidden"
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }} onMouseDown={handleMouseDown} onWheel={handleWheel}>
                <img src={displayUrl} alt="Notes" draggable={false} className="absolute max-w-none origin-center"
                    style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
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

    const pattern = getPatternBySlug(patternSlug);
    const item = getItemBySlug(patternSlug, itemSlug);

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
            // Marking as complete -> trigger modal
            if (itemId === item.id) {
                setShowFeedbackModal(true);
            } else {
                completed.push(itemId);
                localStorage.setItem('dsa-completed-items', JSON.stringify(completed));
            }
        }
    };

    const handleFeedbackSubmit = async (data) => {
        try {
            await api.post('/adaptive-revision/feedback', {
                course: 'dsa',
                topicId: item.slug,
                topicTitle: item.title,
                understandingLevel: data.understandingLevel,
                notes: data.notes
            });

            // After feedback, mark as complete locally
            const saved = localStorage.getItem('dsa-completed-items');
            let completed = saved ? JSON.parse(saved) : [];
            if (!completed.includes(item.id)) {
                completed.push(item.id);
                localStorage.setItem('dsa-completed-items', JSON.stringify(completed));
            }
            setIsCompleted(true);
            setShowFeedbackModal(false);
        } catch (error) {
            console.error('Failed to submit understanding feedback:', error);
            // Even if API fails, we marker as complete locally
            const saved = localStorage.getItem('dsa-completed-items');
            let completed = saved ? JSON.parse(saved) : [];
            if (!completed.includes(item.id)) {
                completed.push(item.id);
                localStorage.setItem('dsa-completed-items', JSON.stringify(completed));
            }
            setIsCompleted(true);
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
                                    videoId={ctoClip.videoId}
                                    startTime={ctoClip.startTime}
                                    endTime={ctoClip.endTime}
                                    title={ctoClip.question || item.title}
                                    className="w-full h-full"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-gray-500 bg-[#0f0f15]">
                                    {ctoClipLoaded ? "Video explanation coming soon" : "Loading video..."}
                                </div>
                            )}
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
                                        const noteOptions = ctoClip?.lectureNotesSvgOptions || item?.lectureNotesSvgOptions || pattern?.lectureNotesSvgOptions;
                                        const primaryNote = ctoClip?.lectureNotesSvg || item?.lectureNotesSvg || pattern?.lectureNotesSvg;

                                        if (primaryNote) {
                                            if (primaryNote.toLowerCase().includes('.svg') || (Array.isArray(primaryNote) && primaryNote[0].includes('.svg'))) {
                                                const url = Array.isArray(primaryNote) ? primaryNote[0] : primaryNote;
                                                const rawUrl = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
                                                return <LectureNoteViewer url={rawUrl} noteOptions={noteOptions} />;
                                            }
                                            return <a href={primaryNote} target="_blank" className="text-orange-400 underline">Open Notes</a>;
                                        }
                                        return <div className="text-gray-500 italic">Notes are being digitized. Coming soon.</div>;
                                    })()}
                                </div>
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
