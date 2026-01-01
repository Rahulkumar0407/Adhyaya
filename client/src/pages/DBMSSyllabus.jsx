import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Lock, CheckCircle, Clock, ChevronRight, Sparkles, Database } from 'lucide-react';
import { dbmsCourseData, dbmsLevelColors, getDbmsTotalLessons } from '../data/dbmsCourse';

export default function DBMSSyllabus() {
    const [expandedSection, setExpandedSection] = useState(null);
    const [completedLessons] = useState(() => {
        const saved = localStorage.getItem('dbmsCourseProgress');
        return saved ? JSON.parse(saved) : [];
    });

    const totalLessons = getDbmsTotalLessons();
    const completedCount = completedLessons.length;
    const progress = Math.round((completedCount / totalLessons) * 100);

    // Group sections by level
    const beginnerSections = dbmsCourseData.sections.filter(s => s.level === 'beginner');
    const intermediateSections = dbmsCourseData.sections.filter(s => s.level === 'intermediate');
    const advancedSections = dbmsCourseData.sections.filter(s => s.level === 'advanced');
    const expertSections = dbmsCourseData.sections.filter(s => s.level === 'expert');

    const getSectionProgress = (section) => {
        const completed = section.lessons.filter(l => completedLessons.includes(l.id)).length;
        return Math.round((completed / section.lessons.length) * 100);
    };

    // Hexagonal card layout component
    const HexCard = ({ section, index }) => {
        const sectionProgress = getSectionProgress(section);
        const isLocked = section.pointsRequired && sectionProgress === 0;
        const isExpanded = expandedSection === section.id;
        const colors = dbmsLevelColors[section.level];

        return (
            <div
                className="relative group"
                style={{
                    animationDelay: `${index * 100}ms`,
                }}
            >
                {/* Glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${colors.bg} rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity`}></div>

                {/* Card */}
                <div className={`relative bg-[#0f1f1a] rounded-3xl border-2 ${colors.border} overflow-hidden hover:border-emerald-500/50 transition-all duration-300`}>
                    {/* Header with icon */}
                    <button
                        onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                        className="w-full p-6 text-left hover:bg-white/5 transition-colors"
                        disabled={isLocked}
                    >
                        <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-3xl shadow-lg flex-shrink-0 ${isLocked ? 'opacity-50' : ''}`}>
                                {isLocked ? <Lock className="w-7 h-7 text-white" /> : section.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <h3 className={`font-bold text-xl ${isLocked ? 'text-gray-500' : 'text-white'} mb-1`}>
                                    {section.title}
                                </h3>
                                <p className="text-gray-500 text-sm mb-3">{section.description}</p>

                                {/* Stats row */}
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="flex items-center gap-1 text-gray-400">
                                        <Play className="w-3 h-3" />
                                        {section.lessons.length} videos
                                    </span>
                                    {!isLocked && sectionProgress > 0 && (
                                        <span className="text-emerald-400 font-medium">
                                            {sectionProgress}% done
                                        </span>
                                    )}
                                    {isLocked && (
                                        <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                            <Lock className="w-3 h-3" />
                                            {section.pointsRequired} pts
                                        </span>
                                    )}
                                </div>
                            </div>

                            {!isLocked && (
                                <ChevronRight className={`w-6 h-6 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            )}
                        </div>

                        {/* Progress bar */}
                        {!isLocked && (
                            <div className="mt-4 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${colors.bg} transition-all duration-500`}
                                    style={{ width: `${sectionProgress}%` }}
                                />
                            </div>
                        )}
                    </button>

                    {/* Expanded Lessons */}
                    {isExpanded && !isLocked && (
                        <div className="border-t border-gray-800/50 bg-black/40 max-h-80 overflow-y-auto">
                            {section.lessons.map((lesson, lessonIdx) => {
                                const isCompleted = completedLessons.includes(lesson.id);
                                return (
                                    <Link
                                        key={lesson.id}
                                        to={`/dbms/${lesson.id}`}
                                        className="flex items-center gap-3 px-6 py-3 hover:bg-emerald-500/10 transition-colors border-b border-gray-800/30 last:border-0"
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
    };

    return (
        <div className="min-h-screen bg-[#0a0f0d] relative overflow-hidden">
            {/* CSS Animated Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-20 left-[10%] w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-[10%] w-[500px] h-[500px] bg-gradient-to-br from-teal-500/10 to-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <header className="bg-[#0a0f0d]/80 backdrop-blur-md border-b border-gray-800/50 sticky top-0 z-50">
                    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                        <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            <span>Dashboard</span>
                        </Link>
                        <Link
                            to="/dbms"
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-sm mb-6">
                            <Database className="w-4 h-4" />
                            Complete Syllabus
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                            Database
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400"> Management</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
                            From SQL basics to advanced indexing and recovery. Master the backbone of modern applications.
                        </p>

                        {/* Stats Row */}
                        <div className="flex flex-wrap justify-center gap-6 mb-10">
                            {[
                                { value: totalLessons, label: 'Videos', color: 'text-white' },
                                { value: `${dbmsCourseData.estimatedHours}+`, label: 'Hours', color: 'text-white' },
                                { value: '13', label: 'Modules', color: 'text-white' },
                                { value: `${progress}%`, label: 'Complete', color: 'text-emerald-400' },
                            ].map((stat, i) => (
                                <div key={i} className="px-6 py-4 bg-[#0f1f1a] rounded-2xl border border-emerald-500/20">
                                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                                    <div className="text-gray-500 text-sm">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Progress Bar */}
                        <div className="max-w-lg mx-auto">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">Progress</span>
                                <span className="text-emerald-400 font-medium">{completedCount}/{totalLessons} completed</span>
                            </div>
                            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Level Sections */}
                    <div className="space-y-16">
                        {/* Beginner */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl">
                                    🌱
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Foundation</h2>
                                    <p className="text-gray-400">Core concepts and basics</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {beginnerSections.map((section, i) => (
                                    <HexCard key={section.id} section={section} index={i} />
                                ))}
                            </div>
                        </section>

                        {/* Connector */}
                        <div className="flex justify-center">
                            <div className="w-1 h-12 bg-gradient-to-b from-emerald-500/50 to-blue-500/50 rounded-full"></div>
                        </div>

                        {/* Intermediate */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-2xl">
                                    ⚡
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Query Mastery</h2>
                                    <p className="text-gray-400">Relational algebra and SQL</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {intermediateSections.map((section, i) => (
                                    <HexCard key={section.id} section={section} index={i} />
                                ))}
                            </div>
                        </section>

                        {/* Connector */}
                        <div className="flex justify-center">
                            <div className="w-1 h-12 bg-gradient-to-b from-cyan-500/50 to-purple-500/50 rounded-full"></div>
                        </div>

                        {/* Advanced */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-2xl">
                                    🔮
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Advanced Concepts</h2>
                                    <p className="text-gray-400">Normalization and transactions</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {advancedSections.map((section, i) => (
                                    <HexCard key={section.id} section={section} index={i} />
                                ))}
                            </div>
                        </section>

                        {/* Connector */}
                        <div className="flex justify-center">
                            <div className="w-1 h-12 bg-gradient-to-b from-violet-500/50 to-orange-500/50 rounded-full"></div>
                        </div>

                        {/* Expert */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl">
                                    👑
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Expert Level</h2>
                                    <p className="text-gray-400">Concurrency, recovery, and optimization</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {expertSections.map((section, i) => (
                                    <HexCard key={section.id} section={section} index={i} />
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-20 pb-20">
                        <Link
                            to="/dbms"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/25"
                        >
                            <Database className="w-5 h-5" />
                            Start DBMS Journey
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
