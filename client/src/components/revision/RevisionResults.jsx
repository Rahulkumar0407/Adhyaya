import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function RevisionResults({ results, onRetry, themeColor = 'cyan' }) {
    const navigate = useNavigate();
    const [expandedIds, setExpandedIds] = useState([]);

    const toggleExpand = (id) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const attemptedCount = Object.keys(results.answers).filter(k => results.answers[k]).length;
    const totalQuestions = results.questions.length;
    const isGoodSession = attemptedCount > totalQuestions * 0.7;

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="text-center mb-12">
                <div className={`inline-block p-4 rounded-full bg-${themeColor}-500/20 border border-${themeColor}-500/30 mb-6`}>
                    <CheckCircle className={`w-12 h-12 text-${themeColor}-400`} />
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                    {isGoodSession ? "Great Session!" : "Revision Complete!"}
                </h1>
                <p className="text-slate-400 text-lg">
                    You practiced <span className={`text-${themeColor}-400 font-bold`}>{results.topic.title}</span> for {Math.floor(results.totalTime / 60)} minutes.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                    <span className="text-slate-300">Questions Attempted:</span>
                    <span className="font-bold text-white">{attemptedCount} / {totalQuestions}</span>
                </div>
            </div>

            {/* Questions Review */}
            <div className="space-y-4 mb-12">
                <h2 className="text-xl font-bold text-white mb-6">Review & Explanations</h2>
                {results.questions.map((q, idx) => {
                    const userAnswer = results.answers[q.id];
                    const isExpanded = expandedIds.includes(q.id);

                    // Simple logic to check correctness for MCQ, for text it's just review
                    const isMCQ = q.type === 'MCQ';
                    let isCorrect = false;
                    if (isMCQ && userAnswer) {
                        isCorrect = userAnswer === q.correctAnswer;
                    }

                    return (
                        <div
                            key={q.id}
                            className={`border rounded-2xl overflow-hidden transition-all ${isExpanded ? `bg-slate-900/80 border-${themeColor}-500/30 ring-1 ring-${themeColor}-500/30` : 'bg-white/5 border-white/5 hover:bg-white/10'
                                }`}
                        >
                            <div
                                onClick={() => toggleExpand(q.id)}
                                className="p-5 flex items-start gap-4 cursor-pointer"
                            >
                                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center text-sm font-bold text-slate-400">
                                    {idx + 1}
                                </span>

                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                        <h3 className="font-medium text-white pr-8">{q.question}</h3>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border w-fit ${isMCQ ?
                                            (isCorrect ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                userAnswer ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    'bg-slate-800 text-slate-400 border-slate-700')
                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {isMCQ ? (userAnswer ? (isCorrect ? 'Correct' : 'Incorrect') : 'Skipped') : 'Review'}
                                        </span>
                                    </div>
                                    {!isExpanded && (
                                        <p className="text-sm text-slate-500 truncate">Tap to see answer and explanation</p>
                                    )}
                                </div>

                                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                            </div>

                            {isExpanded && (
                                <div className="px-5 pb-5 pt-0 ml-12 space-y-4 animate-in slide-in-from-top-2">
                                    {userAnswer && (
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Your Answer:</p>
                                            <p className={`text-sm p-3 rounded-lg border ${isMCQ ? (isCorrect ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-red-500/10 border-red-500/20 text-red-300') : 'bg-white/5 border-white/10 text-slate-300'
                                                }`}>
                                                {userAnswer}
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Correct Answer & Explanation:</p>
                                        <div className={`p-4 bg-${themeColor}-950/30 rounded-xl border border-${themeColor}-500/20`}>
                                            {isMCQ && <p className={`font-bold text-${themeColor}-400 mb-2`}>{q.correctAnswer}</p>}
                                            <p className={`text-sm text-${themeColor}-100/80 leading-relaxed`}>
                                                {q.explanation}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                    onClick={onRetry}
                    className={`flex items-center gap-2 px-8 py-3 bg-${themeColor}-600 hover:bg-${themeColor}-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-${themeColor}-500/20`}
                >
                    <RotateCcw className="w-5 h-5" />
                    Practice Another Topic
                </button>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-all"
                >
                    <Home className="w-5 h-5" />
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}
