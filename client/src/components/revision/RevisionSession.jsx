import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Clock, AlertCircle, CheckCircle, Brain, RefreshCw } from 'lucide-react';
import geminiService from '../../services/geminiService';

export default function RevisionSession({ course, topic, duration, topicData, onFinish, themeColor = 'cyan' }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: answer }
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                const generatedQuestions = await geminiService.generateRevisionQuestions(course, topic, topicData, duration);
                setQuestions(generatedQuestions);
            } catch (err) {
                console.error("Failed to generate questions:", err);
                setError("Failed to generate questions. Please try again or select a different topic.");
            } finally {
                setLoading(false);
            }
        };

        if (topic && topicData) {
            fetchQuestions();
        }
    }, [course, topic, duration, topicData]);

    // Timer
    useEffect(() => {
        if (loading || error || questions.length === 0 || submitting) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [loading, error, questions, submitting]);

    const handleAnswer = (val) => {
        setAnswers(prev => ({
            ...prev,
            [questions[currentIndex].id]: val
        }));
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        setSubmitting(true);
        // Prepare results
        const results = {
            questions,
            answers,
            totalTime: (duration * 60) - timeLeft,
            course,
            topic
        };
        onFinish(results);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
                <div className={`w-16 h-16 border-4 border-${themeColor}-500/30 border-t-${themeColor}-400 rounded-full animate-spin mb-6`}></div>
                <h3 className="text-xl font-bold text-white mb-2">Generating Your Session...</h3>
                <p className="text-slate-400 max-w-md">
                    Our AI is crafting unique questions from the topic "{topic.title}". This usually takes 5-10 seconds.
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Oops! Something went wrong</h3>
                <p className="text-red-300 mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (questions.length === 0) return null;

    const currentQuestion = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500">
            {/* Header / Timer */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
                        <Brain className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">{topic.title}</h3>
                        <p className="text-xs text-slate-400">Question {currentIndex + 1} of {questions.length}</p>
                    </div>
                </div>

                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg border ${timeLeft < 60 ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' : 'bg-slate-800 text-cyan-400 border-slate-700'}`}>
                    <Clock className="w-5 h-5" />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-slate-800 rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Question Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 shadow-xl">
                <span className="inline-block px-3 py-1 bg-white/5 rounded-lg text-xs font-medium text-slate-400 mb-4 border border-white/5 uppercase tracking-wider">
                    {currentQuestion.type}
                </span>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-relaxed">
                    {currentQuestion.question}
                </h2>

                {/* Answer Inputs */}
                <div className="space-y-4">
                    {currentQuestion.type === 'MCQ' && (
                        <div className="grid grid-cols-1 gap-3">
                            {currentQuestion.options?.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(option)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${answers[currentQuestion.id] === option
                                        ? 'bg-cyan-500/10 border-cyan-500 text-white'
                                        : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/20 text-slate-300'
                                        }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${answers[currentQuestion.id] === option ? 'bg-cyan-500 text-black' : 'bg-black/30'
                                            }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        {option}
                                    </span>
                                    {answers[currentQuestion.id] === option && (
                                        <CheckCircle className="w-5 h-5 text-cyan-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {(currentQuestion.type === 'ShortAnswer' || currentQuestion.type === 'Conceptual') && (
                        <textarea
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => handleAnswer(e.target.value)}
                            placeholder="Type your answer here..."
                            className={`w-full h-40 bg-black/20 border-2 border-white/10 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-${themeColor}-500/50 focus:bg-black/40 transition-all resize-none`}
                        ></textarea>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
                <button
                    onClick={handleNext}
                    className={`flex items-center gap-2 px-8 py-3 bg-${themeColor}-600 hover:bg-${themeColor}-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-${themeColor}-500/20 active:scale-95`}
                >
                    {isLastQuestion ? 'Submit Revision' : 'Next Question'}
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
