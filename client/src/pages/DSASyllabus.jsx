import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Lock, CheckCircle, Clock, ChevronRight, Sparkles, Code2 } from 'lucide-react';
import { dsaCourseData, levelColors, getTotalLessons } from '../data/dsaCourse';

export default function DSASyllabus() {
    const [expandedSection, setExpandedSection] = useState(null);
    const [completedItems] = useState(() => {
        const saved = localStorage.getItem('dsa-completed-items');
        return saved ? JSON.parse(saved) : [];
    });

    const totalLessons = getTotalLessons();
    const completedCount = completedItems.length;
    const progress = Math.round((completedCount / totalLessons) * 100) || 0;

    // Group sections by level
    const beginnerSections = dsaCourseData.sections.filter(s => s.level === 'beginner');
    const intermediateSections = dsaCourseData.sections.filter(s => s.level === 'intermediate');
    const advancedSections = dsaCourseData.sections.filter(s => s.level === 'advanced');
    const expertSections = dsaCourseData.sections.filter(s => s.level === 'expert');

    const getSectionProgress = (section) => {
        const completed = section.lessons.filter(l => completedItems.includes(l.id)).length;
        if (section.lessons.length === 0) return 0;
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
                        {levelKey === 'advanced' && '🔥'}
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
                    // DSA sections aren't locked by points currently, so we always unlock
                    const isLocked = false;
                    const isExpanded = expandedSection === section.id;
                    const colors = levelColors[section.level] || levelColors.beginner;

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
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                                                {section.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-white mb-1">
                                                    {section.title}
                                                </h3>
                                                <p className="text-gray-500 text-sm line-clamp-2">{section.description}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                                    </div>

                                    {/* Progress & Stats */}
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-gray-400">
                                                <strong className={colors.text}>{section.lessons.length}</strong> problems
                                            </span>
                                            {sectionProgress > 0 && (
                                                <span className="text-emerald-400">
                                                    {sectionProgress}% done
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${colors.bg} transition-all duration-500`}
                                            style={{ width: `${sectionProgress}%` }}
                                        />
                                    </div>
                                </button>

                                {/* Expanded Lessons (Problems) */}
                                {isExpanded && (
                                    <div className="border-t border-gray-800/50 bg-black/30 max-h-96 overflow-y-auto custom-scrollbar">
                                        {section.lessons.map((lesson, lessonIdx) => {
                                            const isCompleted = completedItems.includes(lesson.id);
                                            return (
                                                <Link
                                                    key={lesson.id}
                                                    to={`/dsa/${section.patternSlug}/${lesson.id}`}
                                                    className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors border-b border-gray-800/30 last:border-0"
                                                >
                                                    <span className="text-gray-600 text-xs font-mono w-6">
                                                        {String(lessonIdx + 1).padStart(2, '0')}
                                                    </span>
                                                    {isCompleted ? (
                                                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                    ) : (
                                                        <Code2 className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm truncate ${isCompleted ? 'text-gray-500' : 'text-gray-300'}`}>
                                                            {lesson.title}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${lesson.difficulty === 'easy' ? 'border-green-500/20 text-green-400 bg-green-500/10' :
                                                                lesson.difficulty === 'medium' ? 'border-yellow-500/20 text-yellow-400 bg-yellow-500/10' :
                                                                    lesson.difficulty === 'hard' ? 'border-red-500/20 text-red-400 bg-red-500/10' :
                                                                        'border-blue-500/20 text-blue-400 bg-blue-500/10'
                                                            }`}>
                                                            {lesson.difficulty}
                                                        </span>
                                                        <span className="text-gray-600 text-xs flex items-center gap-1 hidden sm:flex">
                                                            <Clock className="w-3 h-3" />
                                                            {lesson.duration}
                                                        </span>
                                                    </div>
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
            {/* CSS Animated Background - Orange Theme for DSA */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-20 left-[10%] w-96 h-96 bg-gradient-to-br from-orange-500/10 to-red-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-[10%] w-[500px] h-[500px] bg-gradient-to-br from-yellow-500/10 to-orange-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-red-500/5 to-yellow-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
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
                            to="/dsa"
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
                        >
                            <Play className="w-4 h-4" fill="currentColor" />
                            Start Practice
                        </Link>
                    </div>
                </header>

                {/* Hero */}
                <div className="max-w-6xl mx-auto px-6 pt-16 pb-12">
                    <div className="text-center mb-16">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400 text-sm mb-6">
                            <Sparkles className="w-4 h-4" />
                            Complete Roadmap
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                            Data Structures
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400"> & Algorithms</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
                            A structured roadmap to master every pattern. From Arrays to Dynamic Programming.
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-8 mb-10">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">{totalLessons}</div>
                                <div className="text-gray-500 text-sm">Problems</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">{dsaCourseData.estimatedHours}+</div>
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
                                        <stop offset="0%" stopColor="#f97316" />
                                        <stop offset="100%" stopColor="#ef4444" />
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
                            title="🌱 Fundamentals"
                            sections={beginnerSections}
                            levelKey="beginner"
                            description="Build your foundation with essential data structures"
                            gradient="from-green-500 to-emerald-600"
                        />

                        {/* Connector */}
                        <div className="flex justify-center py-4">
                            <div className="w-1 h-16 bg-gradient-to-b from-emerald-500/50 to-blue-500/50 rounded-full"></div>
                        </div>

                        <LevelSection
                            title="⚡ Core Patterns"
                            sections={intermediateSections}
                            levelKey="intermediate"
                            description="The most common patterns for interviews"
                            gradient="from-blue-500 to-cyan-600"
                        />

                        {/* Connector */}
                        <div className="flex justify-center py-4">
                            <div className="w-1 h-16 bg-gradient-to-b from-cyan-500/50 to-purple-500/50 rounded-full"></div>
                        </div>

                        <LevelSection
                            title="🔥 Advanced Concepts"
                            sections={advancedSections}
                            levelKey="advanced"
                            description="Tackle complex problems with advanced techniques"
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
                            description="Master the hardest topics to becoming an elite engineer"
                            gradient="from-orange-500 to-red-600"
                        />
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-20 pb-20">
                        <Link
                            to="/dsa"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/25"
                        >
                            <Play className="w-5 h-5" fill="currentColor" />
                            Start Coding
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
