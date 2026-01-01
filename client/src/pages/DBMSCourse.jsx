import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';
import {
    ArrowLeft, ArrowRight, ChevronDown, ChevronRight, Play, CheckCircle,
    Circle, Clock, BookOpen, Menu, X, Sparkles, Trophy, Zap, Target, Lock, Coins, Database
} from 'lucide-react';
import {
    dbmsCourseData, getAllDbmsLessons, getDbmsLessonById, getNextDbmsLesson,
    getPreviousDbmsLesson, getDbmsTotalLessons, getDbmsLessonNumber, dbmsLevelColors
} from '../data/dbmsCourse';
import { recordActivity } from '../services/activityService';
import UnderstandingModal from '../components/common/UnderstandingModal';
import api from '../services/api';
import axios from 'axios';

export default function DBMSCourse() {
    const { user, token } = useAuth();
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const userName = user?.name?.split(' ')[0] || 'User';

    const [completedLessons, setCompletedLessons] = useState(() => {
        const saved = localStorage.getItem('dbmsCourseProgress');
        return saved ? JSON.parse(saved) : [];
    });
    const [expandedSections, setExpandedSections] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unlockedSections, setUnlockedSections] = useState(() => {
        const saved = localStorage.getItem('dbmsUnlockedSections');
        return saved ? JSON.parse(saved) : [];
    });
    const [userPoints, setUserPoints] = useState(() => {
        const saved = localStorage.getItem('userPoints');
        return saved ? parseInt(saved) : 500;
    });
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedLessonForFeedback, setSelectedLessonForFeedback] = useState(null);

    const heroRef = useRef(null);

    // Save progress to localStorage
    useEffect(() => {
        localStorage.setItem('dbmsCourseProgress', JSON.stringify(completedLessons));
    }, [completedLessons]);

    useEffect(() => {
        localStorage.setItem('dbmsUnlockedSections', JSON.stringify(unlockedSections));
    }, [unlockedSections]);

    // GSAP animations
    useEffect(() => {
        if (!lessonId && heroRef.current) {
            const sectionCards = document.querySelectorAll('.section-card');
            sectionCards.forEach(card => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            });

            gsap.fromTo('.hero-title',
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
            );
            gsap.fromTo('.section-card',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, delay: 0.3, ease: 'power2.out' }
            );
        }
    }, [lessonId]);

    // Entrance animations for Video Lesson Page
    useEffect(() => {
        if (lessonId) {
            const ctx = gsap.context(() => {
                gsap.from('.aspect-video', {
                    y: 40,
                    opacity: 0,
                    duration: 1,
                    ease: 'power3.out',
                    delay: 0.2
                });
                gsap.from('.lesson-info-content', {
                    y: 30,
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    delay: 0.5,
                    stagger: 0.1
                });
            });
            return () => ctx.revert();
        }
    }, [lessonId]);

    const totalLessons = getDbmsTotalLessons();
    const completedCount = completedLessons.length;
    const progressPercent = Math.round((completedCount / totalLessons) * 100);

    const toggleSection = (sectionId) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const toggleComplete = async (lessonIdToToggle, e) => {
        if (e) e.stopPropagation();
        const wasCompleted = completedLessons.includes(lessonIdToToggle);

        if (wasCompleted) {
            setCompletedLessons(prev => prev.filter(id => id !== lessonIdToToggle));
        } else {
            // Trigger feedback modal for current lesson if not already completed
            if (lessonIdToToggle === lessonId) {
                const lessonToFeedback = getDbmsLessonById(lessonIdToToggle);
                setSelectedLessonForFeedback(lessonToFeedback);
                setShowFeedbackModal(true);
            } else {
                setCompletedLessons(prev => [...prev, lessonIdToToggle]);
            }
        }

        if (!wasCompleted && token) {
            try {
                await recordActivity(token, 'video_watched', {
                    courseId: 'dbms',
                    lessonId: lessonIdToToggle,
                });
            } catch (error) {
                console.error('Failed to record activity:', error);
            }
        }
    };

    const handleFeedbackSubmit = async (data) => {
        try {
            await api.post('/adaptive-revision/feedback', {
                course: 'dbms',
                topicId: lessonId,
                topicTitle: currentLesson.title,
                understandingLevel: data.understandingLevel,
                notes: data.notes
            });

            // Mark as complete locally
            if (!completedLessons.includes(lessonId)) {
                setCompletedLessons((prev) => [...prev, lessonId]);
            }
            setShowFeedbackModal(false);
        } catch (error) {
            console.error('Failed to submit understanding feedback:', error);
            // Mark as complete even if API fails
            if (!completedLessons.includes(lessonId)) {
                setCompletedLessons((prev) => [...prev, lessonId]);
            }
            setShowFeedbackModal(false);
        }
    };

    const unlockSection = (sectionId, pointsRequired) => {
        if (userPoints >= pointsRequired) {
            setUserPoints(prev => prev - pointsRequired);
            setUnlockedSections(prev => [...prev, sectionId]);
            localStorage.setItem('userPoints', (userPoints - pointsRequired).toString());
        }
    };

    const isSectionLocked = (section) => {
        if (!section.pointsRequired) return false;
        return !unlockedSections.includes(section.id);
    };

    const getLevelBadge = (level) => {
        const colors = dbmsLevelColors[level] || dbmsLevelColors.beginner;
        const labels = {
            beginner: 'Beginner',
            intermediate: 'Intermediate',
            advanced: 'Advanced',
            expert: 'Expert',
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${colors.bg} text-white`}>
                {labels[level]}
            </span>
        );
    };

    // Course Overview Page
    if (!lessonId) {
        return (
            <div ref={heroRef} className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
                {/* Animated Background */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="floating-orb absolute top-20 left-[10%] w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-full blur-3xl"></div>
                    <div className="floating-orb absolute bottom-20 right-[10%] w-[500px] h-[500px] bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-full blur-3xl"></div>
                    <div className="floating-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-teal-500/5 to-green-500/5 rounded-full blur-3xl"></div>
                </div>

                {/* Header */}
                <header className="relative bg-transparent border-b border-gray-800/50 backdrop-blur-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                        <Link to="/dashboard" className="flex items-center gap-3 group">
                            <img src="/favicon.png" alt="DBMS" className="w-10 h-10 object-contain shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-105" />
                            <div>
                                <span className="text-white font-medium">DBMS Course</span>
                                <p className="text-gray-500 text-xs">Database Management</p>
                            </div>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 rounded-full">
                                <Coins className="w-4 h-4 text-yellow-400" />
                                <span className="text-yellow-400 font-medium text-sm">{userPoints}</span>
                            </div>
                            <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <div className="relative max-w-7xl mx-auto px-4 py-12">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-sm mb-6">
                            <Sparkles className="w-4 h-4" />
                            Complete DBMS Course
                        </div>
                        <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            Database Management
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400"> Systems</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                            {dbmsCourseData.description}
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-8 mb-10">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">{totalLessons}</div>
                                <div className="text-gray-500 text-sm">Videos</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">{dbmsCourseData.estimatedHours}+</div>
                                <div className="text-gray-500 text-sm">Hours</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-emerald-400">{progressPercent}%</div>
                                <div className="text-gray-500 text-sm">Complete</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">{completedCount}</div>
                                <div className="text-gray-500 text-sm">Completed</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="max-w-md mx-auto mb-8">
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sections Grid */}
                    <div className="space-y-4">
                        {dbmsCourseData.sections.map((section, sectionIndex) => {
                            const isExpanded = expandedSections.includes(section.id);
                            const sectionCompleted = section.lessons.filter(l => completedLessons.includes(l.id)).length;
                            const sectionProgress = Math.round((sectionCompleted / section.lessons.length) * 100);
                            const colors = dbmsLevelColors[section.level];
                            const isLocked = isSectionLocked(section);

                            return (
                                <div
                                    key={section.id}
                                    className={`section-card bg-[#12121a] rounded-2xl border ${colors.border} overflow-hidden transition-all duration-300 ${isLocked ? 'opacity-70' : ''}`}
                                >
                                    {/* Section Header */}
                                    <button
                                        onClick={() => !isLocked && toggleSection(section.id)}
                                        disabled={isLocked}
                                        className={`w-full p-5 flex items-center justify-between ${isLocked ? 'cursor-not-allowed' : 'hover:bg-white/5'} transition-colors`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-2xl shadow-lg ${isLocked ? 'opacity-50' : ''}`}>
                                                {isLocked ? <Lock className="w-6 h-6 text-white" /> : section.icon}
                                            </div>
                                            <div className="text-left">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className={`font-semibold text-lg ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                                                        {section.title}
                                                    </h3>
                                                    {getLevelBadge(section.level)}
                                                </div>
                                                <p className="text-gray-500 text-sm">{section.description}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {isLocked ? (
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        unlockSection(section.id, section.pointsRequired);
                                                    }}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            unlockSection(section.id, section.pointsRequired);
                                                        }
                                                    }}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${userPoints >= section.pointsRequired
                                                        ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                                                        : 'bg-gray-700 text-gray-400 cursor-not-allowed pointer-events-none'
                                                        }`}
                                                >
                                                    <Coins className="w-4 h-4" />
                                                    Unlock ({section.pointsRequired} pts)
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="text-right">
                                                        <span className="text-white font-medium">{sectionCompleted}/{section.lessons.length}</span>
                                                        <div className="w-20 h-1 bg-gray-700 rounded-full mt-1">
                                                            <div
                                                                className={`h-full bg-gradient-to-r ${colors.bg} rounded-full`}
                                                                style={{ width: `${sectionProgress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                </>
                                            )}
                                        </div>
                                    </button>

                                    {/* Lessons List */}
                                    {isExpanded && !isLocked && (
                                        <div className="border-t border-gray-800/50 bg-black/30">
                                            {section.lessons.map((lesson, lessonIndex) => {
                                                const isCompleted = completedLessons.includes(lesson.id);
                                                const lessonNumber = getDbmsLessonNumber(lesson.id);

                                                return (
                                                    <Link
                                                        key={lesson.id}
                                                        to={`/dbms/${lesson.id}`}
                                                        className={`flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-colors border-b border-gray-800/30 last:border-0 ${isCompleted ? 'opacity-60' : ''}`}
                                                    >
                                                        <span className="text-gray-600 text-xs font-mono w-8">
                                                            {String(lessonNumber).padStart(2, '0')}
                                                        </span>
                                                        <div
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                toggleComplete(lesson.id, e);
                                                            }}
                                                            className="flex-shrink-0 cursor-pointer"
                                                            role="button"
                                                            tabIndex={0}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    e.preventDefault();
                                                                    toggleComplete(lesson.id, e);
                                                                }
                                                            }}
                                                        >
                                                            {isCompleted ? (
                                                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                            ) : (
                                                                <Circle className="w-5 h-5 text-gray-600 hover:text-emerald-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <span className={`text-sm ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                                                                {lesson.title}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                                                            <Clock className="w-3 h-3" />
                                                            {lesson.duration}
                                                        </div>
                                                        <Play className="w-4 h-4 text-gray-600" />
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // Video Player Page
    const currentLesson = getDbmsLessonById(lessonId);
    const nextLesson = getNextDbmsLesson(lessonId);
    const prevLesson = getPreviousDbmsLesson(lessonId);
    const lessonNumber = getDbmsLessonNumber(lessonId);
    const isCompleted = completedLessons.includes(lessonId);

    if (!currentLesson) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Lesson not found</h1>
                    <Link to="/dbms" className="text-emerald-400 hover:underline">Back to Course</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex">
            {/* Sidebar */}
            <aside className={`fixed md:relative z-40 w-80 h-screen bg-[#0f0f15]/80 backdrop-blur-xl border-r border-gray-800/50 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-4 border-b border-gray-800/50">
                    <Link to="/dbms" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <Database className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="text-white font-medium text-sm">DBMS Course</span>
                            <p className="text-gray-500 text-xs">{progressPercent}% Complete</p>
                        </div>
                    </Link>
                </div>

                <div className="overflow-y-auto h-[calc(100vh-80px)]">
                    {dbmsCourseData.sections.map((section) => {
                        const colors = dbmsLevelColors[section.level];
                        const isLocked = isSectionLocked(section);

                        return (
                            <div key={section.id} className="border-b border-gray-800/30">
                                <button
                                    onClick={() => !isLocked && toggleSection(section.id)}
                                    disabled={isLocked}
                                    className="w-full p-3 flex items-center gap-3 hover:bg-white/5 transition-colors"
                                >
                                    <span className="text-lg">{isLocked ? '🔒' : section.icon}</span>
                                    <span className={`text-sm font-medium ${isLocked ? 'text-gray-600' : 'text-gray-300'} flex-1 text-left`}>
                                        {section.title}
                                    </span>
                                    {!isLocked && (
                                        <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${expandedSections.includes(section.id) ? 'rotate-90' : ''}`} />
                                    )}
                                </button>

                                {expandedSections.includes(section.id) && !isLocked && (
                                    <div className="bg-black/30">
                                        {section.lessons.map((lesson) => {
                                            const isActive = lesson.id === lessonId;
                                            const isDone = completedLessons.includes(lesson.id);

                                            return (
                                                <Link
                                                    key={lesson.id}
                                                    to={`/dbms/${lesson.id}`}
                                                    className={`flex items-center gap-2 px-4 py-2 text-xs transition-colors ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                                                >
                                                    {isDone ? (
                                                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                                                    ) : (
                                                        <Circle className="w-3 h-3" />
                                                    )}
                                                    <span className="truncate">{lesson.title}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </aside>

            {/* Mobile sidebar toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed bottom-4 left-4 z-50 md:hidden w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
            >
                {sidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Video Player Section with Ambient Glow */}
                <div className="relative pt-8 pb-12 px-4 md:px-8 bg-[#050505]">
                    {/* Ambient Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-600/10 blur-[120px] pointer-events-none opacity-50"></div>

                    <div className="max-w-5xl mx-auto relative group">
                        {/* Premium Frame */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>

                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-emerald-500/10">
                            <iframe
                                src={`https://www.youtube.com/embed/${currentLesson.videoId}?rel=0&autoplay=0&modestbranding=1`}
                                className="w-full h-full"
                                allowFullScreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                        </div>

                        {/* Floating Status Badge */}
                        <div className="absolute -top-4 -right-4 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-2 border border-emerald-400/30">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            NOW PLAYING
                        </div>
                    </div>
                </div>

                {/* Lesson Info Area */}
                <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 lesson-info-content">
                        <div className="flex-1">
                            {/* Breadcrumb & Level */}
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-2xl border border-white/10">
                                    {currentLesson.icon}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs uppercase tracking-widest font-bold">{currentLesson.sectionTitle}</span>
                                    <div className="flex items-center gap-2">
                                        {getLevelBadge(currentLesson.level)}
                                        <span className="text-gray-600 text-xs">•</span>
                                        <span className="text-gray-400 text-xs font-medium">Lesson {lessonNumber} of {totalLessons}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                {currentLesson.title}
                            </h1>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={(e) => toggleComplete(lessonId, e)}
                                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 ${isCompleted
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95'
                                    }`}
                            >
                                {isCompleted ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Completed ✓
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5" fill="currentColor" />
                                        Mark as Complete
                                    </>
                                )}
                            </button>
                            <div className="hidden sm:flex flex-col items-center justify-center px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
                                <Clock className="w-4 h-4 text-gray-500 mb-1" />
                                <span className="text-white text-xs font-bold">{currentLesson.duration}</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation - Premium Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-10 border-t border-white/5 lesson-info-content">
                        {prevLesson ? (
                            <Link
                                to={`/dbms/${prevLesson.id}`}
                                className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                    <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-emerald-400" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Previous Lesson</div>
                                    <div className="text-sm text-white font-bold truncate group-hover:text-emerald-400 transition-colors">{prevLesson.title}</div>
                                </div>
                            </Link>
                        ) : (
                            <div className="hidden md:block" />
                        )}

                        {nextLesson ? (
                            <Link
                                to={`/dbms/${nextLesson.id}`}
                                className="flex items-center gap-4 p-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20 hover:from-emerald-500/20 hover:to-teal-500/20 transition-all group text-right"
                            >
                                <div className="flex-1 overflow-hidden">
                                    <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mb-1">Next Lesson</div>
                                    <div className="text-sm text-white font-bold truncate group-hover:text-emerald-300 transition-colors">{nextLesson.title}</div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                    <ArrowRight className="w-5 h-5 text-white" />
                                </div>
                            </Link>
                        ) : (
                            <Link
                                to="/dbms"
                                className="flex items-center justify-center gap-3 p-5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-white font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform"
                            >
                                <Trophy className="w-6 h-6" />
                                COURSE COMPLETED! 🎉
                            </Link>
                        )}
                    </div>
                </div>
            </main>

            {/* Feedback Modal */}
            <UnderstandingModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                onSubmit={handleFeedbackSubmit}
                topic={selectedLessonForFeedback}
            />
        </div>
    );
}
