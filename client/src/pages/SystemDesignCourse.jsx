import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';
import {
    ArrowLeft, ArrowRight, ChevronDown, ChevronRight, Play, CheckCircle,
    Circle, Clock, BookOpen, Menu, X, Sparkles, Trophy, Zap, Target, Lock, Coins, Server
} from 'lucide-react';
import {
    courseData, getAllLessons, getLessonById, getNextLesson,
    getPreviousLesson, getTotalLessons, getLessonNumber, levelColors
} from '../data/systemDesignCourse';
import { recordActivity } from '../services/activityService';
import UnderstandingModal from '../components/common/UnderstandingModal';
import api from '../services/api';
import axios from 'axios';

export default function SystemDesignCourse() {
    const { user, token } = useAuth();
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const userName = user?.name?.split(' ')[0] || 'User';

    const [completedLessons, setCompletedLessons] = useState(() => {
        const saved = localStorage.getItem('sdCourseProgress');
        return saved ? JSON.parse(saved) : [];
    });
    const [expandedSections, setExpandedSections] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unlockedSections, setUnlockedSections] = useState(() => {
        const saved = localStorage.getItem('sdUnlockedSections');
        return saved ? JSON.parse(saved) : [];
    });
    const [userPoints, setUserPoints] = useState(() => {
        const saved = localStorage.getItem('userPoints');
        return saved ? parseInt(saved) : 500; // Default 500 points for testing
    });
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedLessonForFeedback, setSelectedLessonForFeedback] = useState(null);

    // Refs for GSAP animations
    const heroRef = useRef(null);
    const statsRef = useRef(null);
    const sectionsRef = useRef(null);
    const progressCircleRef = useRef(null);

    // Save progress to localStorage
    useEffect(() => {
        localStorage.setItem('sdCourseProgress', JSON.stringify(completedLessons));
    }, [completedLessons]);

    useEffect(() => {
        localStorage.setItem('sdUnlockedSections', JSON.stringify(unlockedSections));
    }, [unlockedSections]);

    useEffect(() => {
        localStorage.setItem('userPoints', userPoints.toString());
    }, [userPoints]);

    // GSAP animations on mount
    useEffect(() => {
        if (!lessonId && heroRef.current) {
            // First, ensure all elements are visible in case GSAP fails
            const sectionCards = document.querySelectorAll('.section-card');
            sectionCards.forEach(card => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            });

            const ctx = gsap.context(() => {
                // Hero animation
                gsap.fromTo('.hero-title',
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
                );
                gsap.fromTo('.hero-desc',
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: 'power3.out' }
                );
                gsap.fromTo('.hero-stats',
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, delay: 0.4, ease: 'power3.out' }
                );
                gsap.fromTo('.hero-button',
                    { scale: 0.8, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.6, delay: 0.6, ease: 'back.out(1.7)' }
                );

                // Stats cards stagger
                gsap.fromTo('.stat-card',
                    { y: 40, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.5, ease: 'power3.out' }
                );

                // Sections stagger - ensure they become visible
                gsap.fromTo('.section-card',
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, delay: 0.3, ease: 'power2.out' }
                );

                // Floating orbs animation
                gsap.to('.floating-orb', {
                    y: -20,
                    duration: 3,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                    stagger: 0.5,
                });
            }, heroRef);

            return () => ctx.revert();
        }
    }, [lessonId]);

    // Animate progress circle
    useEffect(() => {
        if (!lessonId && progressCircleRef.current) {
            gsap.to(progressCircleRef.current, {
                strokeDasharray: `${progressPercent * 2.51} 251`,
                duration: 1.5,
                ease: 'power2.out',
                delay: 0.8,
            });
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

    // Get current lesson details
    const currentLesson = lessonId ? getLessonById(lessonId) : null;
    const nextLesson = lessonId ? getNextLesson(lessonId) : null;
    const prevLesson = lessonId ? getPreviousLesson(lessonId) : null;
    const currentLessonNumber = lessonId ? getLessonNumber(lessonId) : 0;

    // Expand current section when viewing a lesson
    useEffect(() => {
        if (currentLesson && !expandedSections.includes(currentLesson.sectionId)) {
            setExpandedSections((prev) => [...prev, currentLesson.sectionId]);
        }
    }, [currentLesson]);

    const totalLessons = getTotalLessons();
    const completedCount = completedLessons.length;
    const progressPercent = Math.round((completedCount / totalLessons) * 100);

    const toggleSection = (sectionId) => {
        setExpandedSections((prev) =>
            prev.includes(sectionId)
                ? prev.filter((id) => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const toggleComplete = async (lessonIdToToggle) => {
        const wasCompleted = completedLessons.includes(lessonIdToToggle);

        if (wasCompleted) {
            setCompletedLessons((prev) => prev.filter((id) => id !== lessonIdToToggle));
        } else {
            // Trigger feedback modal for current lesson if not already completed
            if (lessonIdToToggle === lessonId) {
                const lessonToFeedback = getLessonById(lessonIdToToggle);
                setSelectedLessonForFeedback(lessonToFeedback);
                setShowFeedbackModal(true);
            } else {
                setCompletedLessons((prev) => [...prev, lessonIdToToggle]);
            }
        }

        // Record activity only when marking as complete (not when uncompleting)
        if (!wasCompleted && token) {
            try {
                await recordActivity(token, 'video_watched', {
                    courseId: 'system-design',
                    lessonId: lessonIdToToggle
                });
            } catch (error) {
                console.error('Failed to record activity:', error);
            }
        }
    };

    const handleFeedbackSubmit = async (data) => {
        try {
            await api.post('/adaptive-revision/feedback', {
                course: 'system-design',
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

    const isCompleted = (id) => completedLessons.includes(id);

    const isSectionLocked = (section) => {
        return section.pointsRequired && !unlockedSections.includes(section.id);
    };

    const unlockSection = (section) => {
        if (userPoints >= section.pointsRequired) {
            setUserPoints(prev => prev - section.pointsRequired);
            setUnlockedSections(prev => [...prev, section.id]);
        }
    };

    const getLevelBadge = (level) => {
        const colors = levelColors[level] || levelColors.beginner;
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
                {/* Animated Background - CSS orbs like DBMS */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="floating-orb absolute top-20 left-[10%] w-96 h-96 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 rounded-full blur-3xl"></div>
                    <div className="floating-orb absolute bottom-20 right-[10%] w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-purple-500/5 rounded-full blur-3xl"></div>
                    <div className="floating-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
                </div>

                {/* Header */}
                <header className="relative bg-transparent border-b border-gray-800/50 backdrop-blur-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                        <Link to="/dashboard" className="flex items-center gap-3 group">
                            <img src="/favicon.png" alt="System Design" className="w-10 h-10 object-contain shadow-lg shadow-purple-500/20 transition-transform group-hover:scale-105" />
                            <div>
                                <span className="text-white font-medium">System Design</span>
                                <p className="text-gray-500 text-xs">Complete Course</p>
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
                <section className="relative pt-16 pb-12 px-4">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="hero-title mb-6">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-blue-400 text-sm mb-6">
                                <Sparkles className="w-4 h-4" />
                                77 Videos • Beginner to Expert
                            </span>
                            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                                Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">System Design</span>
                                <br />for Software Engineers
                            </h1>
                        </div>

                        <p className="hero-desc text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
                            Master system design from fundamentals to advanced distributed systems. Perfect for SDE interviews at FAANG and top tech companies.
                        </p>

                        {/* Stats Row */}
                        <div className="hero-stats flex flex-wrap justify-center gap-6 mb-10">
                            <div className="flex items-center gap-2 text-gray-300">
                                <Play className="w-5 h-5 text-blue-500" />
                                <span><strong>{totalLessons}</strong> videos</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <Clock className="w-5 h-5 text-purple-500" />
                                <span>~<strong>50</strong> hours</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <Target className="w-5 h-5 text-green-500" />
                                <span><strong>16</strong> sections</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                <span><strong>4</strong> levels</span>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <Link
                            to={`/system-design/${courseData.sections[0].lessons[0].id}`}
                            className="hero-button inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg rounded-2xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
                        >
                            <Play className="w-5 h-5" fill="currentColor" />
                            {completedCount > 0 ? 'Continue Learning' : 'Start Learning'}
                        </Link>
                    </div>
                </section>

                {/* Progress Section */}
                <section ref={statsRef} className="relative py-12 px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Progress Card */}
                            <div className="stat-card col-span-2 bg-gradient-to-br from-[#1a1a1a] to-[#111] rounded-3xl p-6 border border-gray-800 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl"></div>
                                <div className="relative flex items-center gap-6">
                                    <div className="relative">
                                        <svg className="w-28 h-28 -rotate-90">
                                            <circle cx="56" cy="56" r="50" stroke="#1f1f1f" strokeWidth="8" fill="none" />
                                            <circle
                                                ref={progressCircleRef}
                                                cx="56" cy="56" r="50"
                                                stroke="url(#progressGradient)"
                                                strokeWidth="8"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeDasharray="0 251"
                                            />
                                            <defs>
                                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#3b82f6" />
                                                    <stop offset="100%" stopColor="#8b5cf6" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-white">{progressPercent}%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">Your Progress</h3>
                                        <p className="text-gray-400 text-sm">{completedCount} of {totalLessons} lessons complete</p>
                                        <div className="mt-3 flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-yellow-500" />
                                            <span className="text-sm text-gray-300">
                                                {progressPercent < 25 ? 'Just getting started!' :
                                                    progressPercent < 50 ? 'Great progress!' :
                                                        progressPercent < 75 ? 'Over halfway there!' :
                                                            progressPercent < 100 ? 'Almost done!' : 'Completed! 🎉'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Level Stats */}
                            {[
                                { level: 'beginner', label: 'Beginner', icon: '🌱' },
                                { level: 'intermediate', label: 'Intermediate', icon: '📘' },
                            ].map((item) => {
                                const sectionsByLevel = courseData.sections.filter(s => s.level === item.level);
                                const lessonsCount = sectionsByLevel.reduce((acc, s) => acc + s.lessons.length, 0);
                                const completedInLevel = sectionsByLevel.reduce((acc, s) =>
                                    acc + s.lessons.filter(l => isCompleted(l.id)).length, 0);

                                return (
                                    <div key={item.level} className="stat-card bg-[#1a1a1a] rounded-2xl p-5 border border-gray-800 hover:border-gray-700 transition-colors">
                                        <div className="text-3xl mb-3">{item.icon}</div>
                                        <h4 className="text-white font-medium mb-1">{item.label}</h4>
                                        <p className="text-gray-500 text-sm">{completedInLevel}/{lessonsCount} done</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Course Content */}
                <section ref={sectionsRef} className="relative py-12 px-4 pb-24">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                            <BookOpen className="w-6 h-6 text-blue-500" />
                            Course Content
                            <span className="text-sm font-normal text-gray-500">({courseData.sections.length} sections)</span>
                        </h2>

                        <div className="space-y-4">
                            {courseData.sections.map((section, idx) => {
                                const sectionCompleted = section.lessons.filter((l) => isCompleted(l.id)).length;
                                const isExpanded = expandedSections.includes(section.id);
                                const colors = levelColors[section.level] || levelColors.beginner;
                                const sectionProgress = Math.round((sectionCompleted / section.lessons.length) * 100);
                                const isLocked = isSectionLocked(section);

                                return (
                                    <div
                                        key={section.id}
                                        className={`section-card rounded-2xl border overflow-hidden transition-all ${colors.border} bg-[#111] ${isLocked ? 'opacity-80' : ''}`}
                                    >
                                        <button
                                            onClick={() => !isLocked && toggleSection(section.id)}
                                            className={`w-full flex items-center justify-between p-5 transition-colors ${isLocked ? 'cursor-default' : 'hover:bg-white/5'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 bg-gradient-to-br ${colors.bg} rounded-xl flex items-center justify-center text-xl shadow-lg relative`}>
                                                    {isLocked && (
                                                        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                                                            <Lock className="w-5 h-5 text-white" />
                                                        </div>
                                                    )}
                                                    {section.icon}
                                                </div>
                                                <div className="text-left">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className={`font-bold ${isLocked ? 'text-gray-400' : 'text-white'}`}>{section.title}</h3>
                                                        {getLevelBadge(section.level)}
                                                        {isLocked && (
                                                            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                                                <Lock className="w-3 h-3" />
                                                                Locked
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-500 text-sm">{section.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {isLocked ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (userPoints >= section.pointsRequired) {
                                                                unlockSection(section);
                                                            }
                                                        }}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${userPoints >= section.pointsRequired
                                                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg hover:shadow-yellow-500/25'
                                                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                                            }`}
                                                        disabled={userPoints < section.pointsRequired}
                                                    >
                                                        <Coins className="w-4 h-4" />
                                                        {section.pointsRequired} pts to unlock
                                                    </button>
                                                ) : (
                                                    <>
                                                        <div className="hidden sm:flex items-center gap-2">
                                                            <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
                                                                <div className={`h-full bg-gradient-to-r ${colors.bg} transition-all`} style={{ width: `${sectionProgress}%` }}></div>
                                                            </div>
                                                            <span className={`text-sm font-medium ${sectionCompleted === section.lessons.length ? 'text-green-400' : colors.text}`}>
                                                                {sectionCompleted}/{section.lessons.length}
                                                            </span>
                                                        </div>
                                                        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                            <ChevronDown className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </button>

                                        {isExpanded && !isLocked && (
                                            <div className="border-t border-gray-800/50 bg-[#0a0a0a]">
                                                {section.lessons.map((lesson, index) => (
                                                    <Link
                                                        key={lesson.id}
                                                        to={`/system-design/${lesson.id}`}
                                                        className={`flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group ${index !== section.lessons.length - 1 ? 'border-b border-gray-800/30' : ''
                                                            }`}
                                                    >
                                                        <span className="w-6 text-center text-xs text-gray-600 font-mono">
                                                            {String(index + 1).padStart(2, '0')}
                                                        </span>
                                                        <div className="flex-shrink-0">
                                                            {isCompleted(lesson.id) ? (
                                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                                            ) : (
                                                                <Circle className="w-5 h-5 text-gray-600 group-hover:text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm truncate ${isCompleted(lesson.id) ? 'text-gray-500' : 'text-white group-hover:text-blue-400'}`}>
                                                                {lesson.title}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs text-gray-500">{lesson.duration}</span>
                                                            <Play className="w-4 h-4 text-gray-600 group-hover:text-blue-400" />
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    // Video Lesson Page
    const levelColor = currentLesson ? levelColors[currentLesson.level] || levelColors.beginner : levelColors.beginner;

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex">
            {/* Sidebar Toggle for Mobile */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-lg"
            >
                {sidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-80 bg-[#0a0a0a]/80 backdrop-blur-xl border-r border-gray-800/50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-gray-800">
                        <Link to="/system-design" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-3">
                            <ArrowLeft className="w-4 h-4" />
                            Course Overview
                        </Link>
                        <h2 className="text-white font-bold truncate text-sm">{courseData.title}</h2>
                        <div className="flex items-center gap-3 mt-3">
                            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all" style={{ width: `${progressPercent}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 font-medium">{progressPercent}%</span>
                        </div>
                    </div>

                    {/* Sections List */}
                    <div className="flex-1 overflow-y-auto py-2">
                        {courseData.sections.map((section) => {
                            const sectionCompleted = section.lessons.filter((l) => isCompleted(l.id)).length;
                            const isExpanded = expandedSections.includes(section.id);
                            const colors = levelColors[section.level] || levelColors.beginner;

                            return (
                                <div key={section.id} className="border-b border-gray-800/30">
                                    <button
                                        onClick={() => toggleSection(section.id)}
                                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 text-left">
                                            <span className="text-lg">{section.icon}</span>
                                            <span className="text-sm text-white truncate">{section.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs ${sectionCompleted === section.lessons.length ? 'text-green-400' : colors.text}`}>
                                                {sectionCompleted}/{section.lessons.length}
                                            </span>
                                            <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="pb-2">
                                            {section.lessons.map((lesson) => (
                                                <Link
                                                    key={lesson.id}
                                                    to={`/system-design/${lesson.id}`}
                                                    onClick={() => setSidebarOpen(false)}
                                                    className={`flex items-center gap-2 px-3 py-2.5 mx-2 rounded-lg text-sm transition-colors ${lesson.id === lessonId
                                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                        }`}
                                                >
                                                    <div className="flex-shrink-0">
                                                        {isCompleted(lesson.id) ? (
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                        ) : lesson.id === lessonId ? (
                                                            <Play className="w-4 h-4 text-blue-400" fill="currentColor" />
                                                        ) : (
                                                            <Circle className="w-4 h-4 text-gray-600" />
                                                        )}
                                                    </div>
                                                    <span className="truncate flex-1 text-xs">{lesson.title}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-0 overflow-y-auto">
                {/* Video Player Section with Ambient Glow */}
                <div className="relative pt-8 pb-12 px-4 md:px-8 bg-[#050505]">
                    {/* Ambient Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/10 blur-[120px] pointer-events-none opacity-50"></div>

                    <div className="max-w-5xl mx-auto relative group">
                        {/* Premium Frame */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>

                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-500/10">
                            <iframe
                                src={`https://www.youtube.com/embed/${currentLesson?.videoId}?rel=0&autoplay=0&modestbranding=1`}
                                title={currentLesson?.title}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>

                        {/* Floating Status Badge */}
                        <div className="absolute -top-4 -right-4 bg-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 border border-blue-400/30">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            NOW PLAYING
                        </div>
                    </div>
                </div>

                {/* Lesson Info Area */}
                <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div className="flex-1">
                            {/* Breadcrumb & Level */}
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-2xl border border-white/10">
                                    {currentLesson?.icon}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs uppercase tracking-widest font-bold">{currentLesson?.sectionTitle}</span>
                                    <div className="flex items-center gap-2">
                                        {currentLesson && getLevelBadge(currentLesson.level)}
                                        <span className="text-gray-600 text-xs">•</span>
                                        <span className="text-gray-400 text-xs font-medium">Lesson {currentLessonNumber} of {totalLessons}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                {currentLesson?.title}
                            </h1>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => toggleComplete(lessonId)}
                                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 ${isCompleted(lessonId)
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95'
                                    }`}
                            >
                                {isCompleted(lessonId) ? (
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
                                <span className="text-white text-xs font-bold">{currentLesson?.duration}</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation - Premium Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-10 border-t border-white/5">
                        {prevLesson ? (
                            <Link
                                to={`/system-design/${prevLesson.id}`}
                                className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                    <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-blue-400" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Previous Lesson</div>
                                    <div className="text-sm text-white font-bold truncate group-hover:text-blue-400 transition-colors">{prevLesson.title}</div>
                                </div>
                            </Link>
                        ) : (
                            <div className="hidden md:block" />
                        )}

                        {nextLesson ? (
                            <Link
                                to={`/system-design/${nextLesson.id}`}
                                className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20 hover:from-blue-500/20 hover:to-purple-500/20 transition-all group text-right"
                            >
                                <div className="flex-1 overflow-hidden">
                                    <div className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mb-1">Next Lesson</div>
                                    <div className="text-sm text-white font-bold truncate group-hover:text-blue-300 transition-colors">{nextLesson.title}</div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                    <ArrowRight className="w-5 h-5 text-white" />
                                </div>
                            </Link>
                        ) : (
                            <Link
                                to="/system-design"
                                className="flex items-center justify-center gap-3 p-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white font-bold shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-transform"
                            >
                                <Trophy className="w-6 h-6" />
                                COURSE COMPLETED! 🎉
                            </Link>
                        )}
                    </div>
                </div>
            </main>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <UnderstandingModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                onSubmit={handleFeedbackSubmit}
                topic={selectedLessonForFeedback}
            />
        </div>
    );
}
