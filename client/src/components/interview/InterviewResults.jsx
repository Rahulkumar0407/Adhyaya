import { Trophy, Target, AlertTriangle, CheckCircle, ArrowRight, RotateCcw, Home, TrendingUp, Sparkles, Brain, Award, BarChart3, BookOpen, GraduationCap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mapWeakAreasToResources } from '../../data/fallbackQuestions';

// Interview Results Component
export default function InterviewResults({
    results,
    interviewType,
    onRetry,
    onClose
}) {
    if (!results) return null;

    const {
        overallScore = 0,
        scores = {},
        problems = [],
        patternsAsked = [],
        strengths = [],
        weakPoints = [],
        suggestions = [],
        weakTopics = [],
        timeTaken = 0,
        questionsAttempted = 0,
        questionsTotal = 0
    } = results;

    // Get suggested resources based on weak areas
    const suggestedResources = mapWeakAreasToResources([...weakTopics, ...weakPoints]);

    // Section scores with defaults
    const sectionScores = {
        problemSolving: scores.problemSolving || overallScore,
        communication: scores.communication || overallScore,
        confidence: scores.confidence || overallScore,
        accuracy: scores.accuracy || overallScore
    };

    // Score color based on performance
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-cyan-400';
        if (score >= 60) return 'text-emerald-400';
        if (score >= 40) return 'text-amber-400';
        return 'text-red-400';
    };

    const getScoreGradient = (score) => {
        if (score >= 80) return 'from-cyan-500 via-blue-600 to-purple-600';
        if (score >= 60) return 'from-emerald-500 to-teal-500';
        if (score >= 40) return 'from-amber-500 to-yellow-500';
        return 'from-red-500 to-pink-500';
    };

    const getScoreMessage = (score) => {
        if (score >= 90) return { emoji: '🏆', text: 'Outstanding! Ready to crack FAANG!' };
        if (score >= 80) return { emoji: '🌟', text: 'Excellent! You\'re interview ready!' };
        if (score >= 70) return { emoji: '💪', text: 'Great job! Almost there!' };
        if (score >= 60) return { emoji: '👍', text: 'Good effort! Keep practicing!' };
        if (score >= 40) return { emoji: '📚', text: 'Needs improvement. Don\'t give up!' };
        return { emoji: '📈', text: 'Keep learning! Practice makes perfect!' };
    };

    const scoreInfo = getScoreMessage(overallScore);

    return (
        <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden p-4 md:p-8 flex flex-col items-center">
            {/* Animated Background Orbs */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-4xl w-full relative z-10">
                {/* Header */}
                <div className="text-center mb-12 animate-in fade-in slide-in-from-top-8 duration-1000">
                    <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 rounded-full text-cyan-400 text-xs font-black uppercase tracking-[0.2em] mb-6 shadow-2xl">
                        <Trophy className="w-4 h-4" />
                        Interview Complete
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] rounded-md border border-cyan-500/30">ANALYZED</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">Performance <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">Report</span></h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-sm">{interviewType.replace('-', ' ')} Round</p>
                </div>

                {/* Main Score Card */}
                <div className={`relative group mb-12 animate-in zoom-in duration-700`}>
                    <div className={`absolute -inset-1 bg-gradient-to-r ${getScoreGradient(overallScore)} rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000`}></div>
                    <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 text-center shadow-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                        <div className="text-7xl mb-6 animate-bounce">{scoreInfo.emoji}</div>

                        <div className="relative inline-block">
                            <div className={`text-8xl md:text-9xl font-black ${getScoreColor(overallScore)} mb-2 tracking-tighter drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]`}>
                                {overallScore}
                                <span className="text-3xl text-slate-500 font-bold ml-2">/100</span>
                            </div>
                            {overallScore >= 80 && (
                                <div className="absolute -top-4 -right-8">
                                    <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                                </div>
                            )}
                        </div>

                        <p className="text-2xl text-white font-black tracking-tight mb-8">{scoreInfo.text}</p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Attempted</div>
                                <div className="text-white font-black text-xl">{questionsAttempted}<span className="text-slate-500 text-sm ml-1">/{questionsTotal}</span></div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Time Taken</div>
                                <div className="text-white font-black text-xl">{Math.floor(timeTaken / 60)}<span className="text-slate-500 text-sm ml-1">mins</span></div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 col-span-2 md:col-span-1">
                                <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Accuracy</div>
                                <div className="text-white font-black text-xl">{Math.round((overallScore / 100) * 100)}%</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section-wise Scores */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '200ms' }}>
                    {[
                        { label: 'Problem Solving', score: sectionScores.problemSolving, color: 'cyan' },
                        { label: 'Communication', score: sectionScores.communication, color: 'purple' },
                        { label: 'Confidence', score: sectionScores.confidence, color: 'amber' },
                        { label: 'Accuracy', score: sectionScores.accuracy, color: 'emerald' }
                    ].map((section, idx) => (
                        <div key={idx} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 transition-all">
                            <div className="text-3xl font-black mb-2" style={{ color: section.color === 'cyan' ? '#22d3d3' : section.color === 'purple' ? '#a855f7' : section.color === 'amber' ? '#f59e0b' : '#10b981' }}>
                                {section.score}%
                            </div>
                            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">{section.label}</div>
                            <div className="h-1 bg-white/10 rounded-full mt-3">
                                <div
                                    className="h-1 rounded-full transition-all duration-1000"
                                    style={{
                                        width: `${section.score}%`,
                                        backgroundColor: section.color === 'cyan' ? '#22d3d3' : section.color === 'purple' ? '#a855f7' : section.color === 'amber' ? '#f59e0b' : '#10b981'
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pattern Analysis (if available) */}
                {patternsAsked.length > 0 && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 mb-12 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '300ms' }}>
                        <h3 className="text-xl font-black text-cyan-400 mb-6 flex items-center gap-3 uppercase tracking-widest">
                            <BarChart3 className="w-6 h-6" />
                            Pattern Analysis
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {patternsAsked.map((p, idx) => (
                                <div key={idx} className={`p-4 rounded-2xl border ${p.solved ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {p.solved ? (
                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                                        )}
                                        <span className={`text-xs font-bold uppercase tracking-wider ${p.solved ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {p.solved ? 'Strong' : 'Practice'}
                                        </span>
                                    </div>
                                    <p className="text-white font-bold capitalize">
                                        {p.pattern?.replace(/_/g, ' ') || 'General'}
                                    </p>
                                    {p.score > 0 && (
                                        <p className="text-slate-400 text-sm mt-1">{p.score}% score</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Strengths */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-left-8 duration-700">
                        <h3 className="text-xl font-black text-emerald-400 mb-6 flex items-center gap-3 uppercase tracking-widest">
                            <Award className="w-6 h-6" />
                            Key Strengths
                        </h3>
                        <div className="space-y-4">
                            {strengths.length > 0 ? strengths.map((strength, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl group hover:bg-emerald-500/10 transition-all">
                                    <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <p className="text-slate-300 font-medium leading-relaxed">{strength}</p>
                                </div>
                            )) : (
                                <p className="text-slate-500 italic">No specific strengths recorded.</p>
                            )}
                        </div>
                    </div>

                    {/* Improvements */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-right-8 duration-700">
                        <h3 className="text-xl font-black text-amber-400 mb-6 flex items-center gap-3 uppercase tracking-widest">
                            <Brain className="w-6 h-6" />
                            Growth Areas
                        </h3>
                        <div className="space-y-4">
                            {weakPoints.length > 0 ? weakPoints.map((point, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl group hover:bg-amber-500/10 transition-all">
                                    <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <p className="text-slate-300 font-medium leading-relaxed">{point}</p>
                                </div>
                            )) : (
                                <p className="text-slate-500 italic">No specific growth areas identified.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                {suggestions.length > 0 && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 mb-12 shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
                        <h3 className="text-xl font-black text-cyan-400 mb-8 flex items-center gap-3 uppercase tracking-widest">
                            <TrendingUp className="w-6 h-6" />
                            Roadmap to Success
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {suggestions.map((suggestion, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-5 bg-cyan-500/5 border border-cyan-500/10 rounded-[1.5rem] group hover:bg-cyan-500/10 transition-all">
                                    <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                    <p className="text-slate-200 font-bold">{suggestion}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Suggested Adhyaya Resources */}
                {suggestedResources.length > 0 && (
                    <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 backdrop-blur-xl border border-purple-500/20 rounded-[2.5rem] p-10 mb-12 shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
                        <h3 className="text-xl font-black text-purple-400 mb-8 flex items-center gap-3 uppercase tracking-widest">
                            <GraduationCap className="w-6 h-6" />
                            Recommended Learning
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {suggestedResources.map((resource, idx) => (
                                <Link
                                    key={idx}
                                    to={resource.path}
                                    className="flex items-start gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-purple-500/30 transition-all group"
                                >
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <BookOpen className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold group-hover:text-purple-400 transition-colors">{resource.title}</p>
                                        <p className="text-slate-400 text-sm mt-1">{resource.description}</p>
                                        <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg">
                                            {resource.type}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
                    <button
                        onClick={onRetry}
                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-widest rounded-[2rem] hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-[0.95] transition-all"
                    >
                        <RotateCcw className="w-6 h-6" />
                        Retry Interview
                    </button>
                    <Link
                        to="/mentors"
                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black uppercase tracking-widest rounded-[2rem] hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-[0.95] transition-all"
                    >
                        <Users className="w-6 h-6" />
                        Book Mentor
                    </Link>
                    <Link
                        to="/dashboard"
                        onClick={onClose}
                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-[2rem] hover:bg-white/10 transition-all"
                    >
                        <Home className="w-6 h-6" />
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}

