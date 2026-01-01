import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Lock, CheckCircle, Clock, ChevronRight, Sparkles, Server } from 'lucide-react';
import { courseData, levelColors, getTotalLessons } from '../data/systemDesignCourse';

export default function SystemDesignSyllabus() {
    const [expandedSection, setExpandedSection] = useState(null);
    const [completedLessons] = useState(() => {
        const saved = localStorage.getItem('sdCourseProgress');
        return saved ? JSON.parse(saved) : [];
    });

    const totalLessons = getTotalLessons();
    const completedCount = completedLessons.length;
    const progress = Math.round((completedCount / totalLessons) * 100);

    // Group sections by level
    const beginnerSections = courseData.sections.filter(s => s.level === 'beginner');
    const intermediateSections = courseData.sections.filter(s => s.level === 'intermediate');
    const advancedSections = courseData.sections.filter(s => s.level === 'advanced');
    const expertSections = courseData.sections.filter(s => s.level === 'expert');

    const getSectionProgress = (section) => {
        const completed = section.lessons.filter(l => completedLessons.includes(l.id)).length;
        return Math.round((completed / section.lessons.length) * 100);
    };

    const LevelSection = ({ title, sections, levelKey, description, gradient }) => (
        <div className="mb-16">
            {/* Level Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl">
                        {levelKey === 'beginner' && '🌱'}
                        {levelKey === 'intermediate' && '⚡'}
                        {levelKey === 'advanced' && '🔮'}
                        {levelKey === 'expert' && '👑'}
                    </span>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    <p className="text-gray-400 text-sm">{description}</p>
                </div>
            </div>

            {/* Cards Grid - Creative Layout */}
            <div className={`grid gap-4 ${levelKey === 'beginner' ? 'grid-cols-1 md:grid-cols-2' :
                levelKey === 'intermediate' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                    levelKey === 'advanced' ? 'grid-cols-1 md:grid-cols-2' :
                        'grid-cols-1'
                }`}>
                {sections.map((section, idx) => {
                    const sectionProgress = getSectionProgress(section);
                    const isLocked = section.pointsRequired && sectionProgress === 0;
                    const isExpanded = expandedSection === section.id;
                    const colors = levelColors[section.level];

                    return (
                        <div
                            key={section.id}
                            className={`relative group ${levelKey === 'expert' ? 'md:col-span-2 lg:col-span-1' : ''}`}
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {/* Glow effect */}
                            <div className={`absolute -inset-0.5 bg-gradient-to-r ${colors.bg} rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity`}></div>

                            {/* Card */}
                            <div className={`relative bg-[#12121a] rounded-2xl border ${colors.border} overflow-hidden`}>
                                {/* Header */}
                                <button
                                    onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                                    className="w-full p-5 text-left hover:bg-white/5 transition-colors"
                                    disabled={isLocked}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-2xl shadow-lg flex-shrink-0 ${isLocked ? 'opacity-50' : ''}`}>
                                                {isLocked ? <Lock className="w-5 h-5 text-white" /> : section.icon}
                                            </div>
                                            <div>
                                                <h3 className={`font-semibold text-lg ${isLocked ? 'text-gray-500' : 'text-white'} mb-1`}>
                                                    {section.title}
                                                </h3>
                                                <p className="text-gray-500 text-sm line-clamp-2">{section.description}</p>
                                            </div>
                                        </div>
                                        {!isLocked && (
                                            <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                                        )}
                                    </div>

                                    {/* Progress & Stats */}
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-gray-400">
                                                <strong className={colors.text}>{section.lessons.length}</strong> videos
                                            </span>
                                            {!isLocked && sectionProgress > 0 && (
                                                <span className="text-emerald-400">
                                                    {sectionProgress}% done
                                                </span>
                                            )}
                                        </div>
                                        {isLocked && (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                                <Lock className="w-3 h-3" />
                                                {section.pointsRequired} pts
                                            </span>
                                        )}
                                    </div>

                                    {/* Progress bar */}
                                    {!isLocked && (
                                        <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${colors.bg} transition-all duration-500`}
                                                style={{ width: `${sectionProgress}%` }}
                                            />
                                        </div>
                                    )}
                                </button>

                                {/* Expanded Lessons */}
                                {isExpanded && !isLocked && (
                                    <div className="border-t border-gray-800/50 bg-black/30">
                                        {section.lessons.map((lesson, lessonIdx) => {
                                            const isCompleted = completedLessons.includes(lesson.id);
                                            return (
                                                <Link
                                                    key={lesson.id}
                                                    to={`/system-design/${lesson.id}`}
                                                    className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors border-b border-gray-800/30 last:border-0"
                                                >
                                                    <span className="text-gray-600 text-xs font-mono w-6">
                                                        {String(lessonIdx + 1).padStart(2, '0')}
                                                    </span>
                                                    {isCompleted ? (
                                                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                    ) : (
                                                        <Play className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                                    )}
                                                    <span className={`flex-1 text-sm ${isCompleted ? 'text-gray-500' : 'text-gray-300'}`}>
                                                        {lesson.title}
                                                    </span>
                                                    <span className="text-gray-600 text-xs flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {lesson.duration}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
            {/* CSS Animated Background - like DBMS */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-20 left-[10%] w-96 h-96 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-[10%] w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <header className="bg-[#0a0a0f]/80 backdrop-blur-md border-b border-gray-800/50 sticky top-0 z-50">
                    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                        <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            <span>Dashboard</span>
                        </Link>
                        <Link
                            to="/system-design"
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
                        >
                            <Play className="w-4 h-4" fill="currentColor" />
                            Start Learning
                        </Link>
                    </div>
                </header>

                {/* Hero */}
                <div className="max-w-6xl mx-auto px-6 pt-16 pb-12">
                    <div className="text-center mb-16">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-sm mb-6">
                            <Sparkles className="w-4 h-4" />
                            Complete Roadmap
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                            System Design
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400"> Mastery</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
                            From fundamentals to designing billion-user systems. Master the art of building scalable architectures.
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-8 mb-10">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">{totalLessons}</div>
                                <div className="text-gray-500 text-sm">Videos</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">50+</div>
                                <div className="text-gray-500 text-sm">Hours</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">4</div>
                                <div className="text-gray-500 text-sm">Levels</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-emerald-400">{progress}%</div>
                                <div className="text-gray-500 text-sm">Complete</div>
                            </div>
                        </div>

                        {/* Progress Ring */}
                        <div className="relative w-32 h-32 mx-auto">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="64" cy="64" r="56" stroke="#1f1f2e" strokeWidth="8" fill="none" />
                                <circle
                                    cx="64" cy="64" r="56"
                                    stroke="url(#progressGradient)"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={`${progress * 3.52} 352`}
                                    className="transition-all duration-1000"
                                />
                                <defs>
                                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#6366f1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">{completedCount}/{totalLessons}</span>
                            </div>
                        </div>
                    </div>

                    {/* Journey Map */}
                    <div className="space-y-8">
                        <LevelSection
                            title="🌱 Foundation"
                            sections={beginnerSections}
                            levelKey="beginner"
                            description="Start your journey with core concepts"
                            gradient="from-green-500 to-emerald-600"
                        />

                        {/* Connector */}
                        <div className="flex justify-center py-4">
                            <div className="w-1 h-16 bg-gradient-to-b from-emerald-500/50 to-blue-500/50 rounded-full"></div>
                        </div>

                        <LevelSection
                            title="⚡ Building Blocks"
                            sections={intermediateSections}
                            levelKey="intermediate"
                            description="Essential components for scalable systems"
                            gradient="from-blue-500 to-cyan-600"
                        />

                        {/* Connector */}
                        <div className="flex justify-center py-4">
                            <div className="w-1 h-16 bg-gradient-to-b from-cyan-500/50 to-purple-500/50 rounded-full"></div>
                        </div>

                        <LevelSection
                            title="🔮 Advanced Concepts"
                            sections={advancedSections}
                            levelKey="advanced"
                            description="Deep dive into distributed systems"
                            gradient="from-purple-500 to-violet-600"
                        />

                        {/* Connector */}
                        <div className="flex justify-center py-4">
                            <div className="w-1 h-16 bg-gradient-to-b from-violet-500/50 to-orange-500/50 rounded-full"></div>
                        </div>

                        <LevelSection
                            title="👑 Expert Mastery"
                            sections={expertSections}
                            levelKey="expert"
                            description="Real-world designs from top companies"
                            gradient="from-orange-500 to-red-600"
                        />
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-20 pb-20">
                        <Link
                            to="/system-design"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-lg rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
                        >
                            <Play className="w-5 h-5" fill="currentColor" />
                            Begin Your Journey
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
