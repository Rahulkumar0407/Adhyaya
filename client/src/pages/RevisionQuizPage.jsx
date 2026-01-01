import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import axios from 'axios';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Brain, Clock, CheckCircle2, XCircle, ArrowRight, ArrowLeft,
    Zap, Star, Award, Home, RefreshCw, Target
} from 'lucide-react';
import QuizConfigModal from '../components/common/QuizConfigModal';

// ===== THREE.JS QUIZ BACKGROUND =====
function QuizBackground() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 25;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // Question mark particles
        const particles = [];
        for (let i = 0; i < 30; i++) {
            const geometry = new THREE.SphereGeometry(0.1, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: i % 2 === 0 ? 0x22d3ee : 0xa855f7,
                transparent: true,
                opacity: 0.2 + Math.random() * 0.2
            });
            const particle = new THREE.Mesh(geometry, material);
            particle.position.x = (Math.random() - 0.5) * 60;
            particle.position.y = (Math.random() - 0.5) * 40;
            particle.position.z = (Math.random() - 0.5) * 20 - 15;
            particle.userData = { speed: Math.random() * 0.5 + 0.2, offset: Math.random() * Math.PI * 2 };
            particles.push(particle);
            scene.add(particle);
        }

        let animationId;
        const clock = new THREE.Clock();

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();
            particles.forEach(p => {
                p.position.y += Math.sin(t * p.userData.speed + p.userData.offset) * 0.01;
            });
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return <div ref={containerRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
}

export default function RevisionQuizPage() {
    const { revisionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [showConfigModal, setShowConfigModal] = useState(true);
    const [quizConfig, setQuizConfig] = useState(null);
    const [revision, setRevision] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [startTime, setStartTime] = useState(null);


    useEffect(() => {
        fetchRevisionDetails();
    }, []);

    const fetchRevisionDetails = async () => {
        try {
            const revisionRes = await api.get('/adaptive-revision/plan?view=day');
            const rev = revisionRes.data.data.revisions?.find(r => r._id === revisionId);
            setRevision(rev || { course: 'dsa', topicId: 'arrays', topicTitle: 'Demo Topic' });
        } catch (error) {
            console.error('Failed to fetch revision:', error);
            setRevision({ course: 'dsa', topicId: 'arrays', topicTitle: 'Demo Topic' });
        }
    };

    const handleConfigSubmit = (config) => {
        setQuizConfig(config);
        setShowConfigModal(false);

        // Ensure we have revision data
        if (!revision) {
            console.error('No revision data available');
            setRevision({ course: 'dsa', topicId: 'arrays', topicTitle: 'Demo Topic' });
        }

        // Small delay to ensure state updates
        setTimeout(() => generateQuiz(config, revision), 100);
    };

    const generateQuiz = async (config, revisionData) => {
        try {
            setLoading(true);
            setStartTime(Date.now());

            const revToUse = revisionData || revision || { course: 'dsa', topicId: 'arrays', topicTitle: 'Demo Topic' };

            console.log('Generating quiz for:', revToUse);

            // Generate quiz with adaptive difficulty
            const quizRes = await api.post('/revision-quiz/generate', {
                course: revToUse.course || 'dsa',
                topicId: revToUse.topicId || 'arrays',
                topicTitle: revToUse.topicTitle || 'Demo Topic',
                revisionId: revisionId,
                questionCount: config.questionCount,
                startDifficulty: config.startDifficulty,
                adaptiveDifficulty: config.adaptiveDifficulty !== false
            });

            setQuiz(quizRes.data.data);
        } catch (error) {
            console.error('Failed to generate quiz:', error);
            // Use fallback quiz for demo
            const demoQuestions = [
                { questionId: 'q1', questionText: 'What is the time complexity of accessing an array element by index?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], difficulty: 'easy' },
                { questionId: 'q2', questionText: 'Which data structure uses LIFO principle?', options: ['Queue', 'Stack', 'Linked List', 'Tree'], difficulty: 'easy' },
                { questionId: 'q3', questionText: 'What is the space complexity of a recursive function with n calls?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], difficulty: 'medium' }
            ];
            setQuiz({
                quizId: 'demo',
                topicTitle: (revisionData || revision)?.topicTitle || 'Demo Quiz',
                totalQuestions: config.questionCount,
                questions: demoQuestions.slice(0, config.questionCount)
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (optionIndex) => {
        setSelectedAnswer(optionIndex);
        setAnswers(prev => ({
            ...prev,
            [quiz.questions[currentQuestion].questionId]: optionIndex
        }));
    };

    const handleNext = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setSelectedAnswer(answers[quiz.questions[currentQuestion + 1]?.questionId] ?? null);
        }
    };

    const handlePrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
            setSelectedAnswer(answers[quiz.questions[currentQuestion - 1]?.questionId] ?? null);
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const totalTimeSpent = Math.round((Date.now() - startTime) / 1000);

            const response = await api.post('/revision-quiz/submit', {
                quizId: quiz.quizId,
                answers,
                totalTimeSpent
            });

            setResults(response.data.data);
            setShowResults(true);
        } catch (error) {
            console.error('Failed to submit quiz:', error);
            // Demo results
            const correct = Object.keys(answers).length > 0 ? Math.floor(Math.random() * 3) + 1 : 0;
            setResults({
                totalQuestions: quiz.questions.length,
                correctAnswers: correct,
                accuracy: Math.round((correct / quiz.questions.length) * 100),
                coinsEarned: correct * 5,
                results: quiz.questions.map((q, i) => ({
                    ...q,
                    userAnswer: answers[q.questionId],
                    correctAnswer: i === 0 ? 0 : i === 1 ? 1 : 1,
                    isCorrect: answers[q.questionId] === (i === 0 ? 0 : i === 1 ? 1 : 1),
                    explanation: 'Demo explanation.'
                }))
            });
            setShowResults(true);
        } finally {
            setSubmitting(false);
        }
    };

    if (showConfigModal && revision) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <QuizBackground />
                <QuizConfigModal
                    isOpen={showConfigModal}
                    onClose={() => navigate('/revision')}
                    onStart={handleConfigSubmit}
                    topicTitle={revision?.topicTitle}
                />
            </div>
        );
    }

    if (loading || !quiz) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="text-center">
                    <Brain className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
                    <p className="text-white text-lg">Generating your adaptive quiz...</p>
                    <p className="text-slate-400 text-sm mt-2">
                        {quizConfig?.questionCount} questions • Starting with {quizConfig?.startDifficulty} difficulty
                    </p>
                </div>
            </div>
        );
    }

    if (showResults) {
        // Calculate enhanced metrics
        const masteryLevel = results.accuracy >= 90 ? 'Expert' : results.accuracy >= 75 ? 'Proficient' : results.accuracy >= 60 ? 'Competent' : results.accuracy >= 40 ? 'Learning' : 'Needs Review';
        const masteryColor = results.accuracy >= 90 ? 'emerald' : results.accuracy >= 75 ? 'cyan' : results.accuracy >= 60 ? 'amber' : results.accuracy >= 40 ? 'orange' : 'red';

        // Difficulty breakdown
        const difficultyStats = {
            easy: { correct: 0, total: 0 },
            medium: { correct: 0, total: 0 },
            hard: { correct: 0, total: 0 }
        };

        results.results?.forEach(r => {
            const diff = r.difficulty || 'medium';
            if (difficultyStats[diff]) {
                difficultyStats[diff].total++;
                if (r.isCorrect) difficultyStats[diff].correct++;
            }
        });

        // Calculate metrics
        const avgTimePerQuestion = results.totalTimeSpent ? Math.round(results.totalTimeSpent / results.totalQuestions) : 0;
        const strongAreas = results.results?.filter(r => r.isCorrect).length || 0;
        const weakAreas = results.results?.filter(r => !r.isCorrect).length || 0;

        return (
            <div className="min-h-screen bg-[#020617] relative overflow-hidden">
                <QuizBackground />
                <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />
                <div className="fixed bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />

                <div className="relative z-10 min-h-screen py-8 px-4">
                    <div className="max-w-5xl mx-auto">
                        {/* Hero Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-8"
                        >
                            <div className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br ${results.accuracy >= 80 ? 'from-emerald-500/20 to-green-500/20 border-2 border-emerald-500/50' :
                                results.accuracy >= 50 ? 'from-amber-500/20 to-yellow-500/20 border-2 border-amber-500/50' :
                                    'from-red-500/20 to-orange-500/20 border-2 border-red-500/50'
                                }`}>
                                {results.accuracy >= 80 ? (
                                    <Star className="w-16 h-16 text-emerald-400" />
                                ) : results.accuracy >= 50 ? (
                                    <CheckCircle2 className="w-16 h-16 text-amber-400" />
                                ) : (
                                    <Brain className="w-16 h-16 text-red-400" />
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
                                {results.accuracy >= 90 ? '🎉 Outstanding!' :
                                    results.accuracy >= 75 ? '🌟 Excellent Work!' :
                                        results.accuracy >= 60 ? '👍 Good Job!' :
                                            results.accuracy >= 40 ? '💪 Keep Going!' :
                                                '📚 More Practice Needed'}
                            </h1>
                            <p className="text-xl text-slate-400 mb-2">
                                You scored <span className="text-white font-bold">{results.correctAnswers}</span> out of <span className="text-white font-bold">{results.totalQuestions}</span>
                            </p>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-${masteryColor}-500/20 border border-${masteryColor}-500/50`}>
                                <Award className={`w-5 h-5 text-${masteryColor}-400`} />
                                <span className={`text-${masteryColor}-400 font-bold`}>Topic Mastery: {masteryLevel}</span>
                            </div>
                        </motion.div>

                        {/* Main Stats Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                        >
                            <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                <div className="text-4xl font-black text-white mb-2">{results.accuracy}%</div>
                                <div className="text-slate-400 text-sm">Accuracy</div>
                                <div className="h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${results.accuracy}%` }}
                                        transition={{ delay: 0.3, duration: 0.8 }}
                                        className={`h-full bg-gradient-to-r ${results.accuracy >= 80 ? 'from-emerald-500 to-green-500' : results.accuracy >= 50 ? 'from-amber-500 to-yellow-500' : 'from-red-500 to-orange-500'}`}
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                <div className="text-4xl font-black text-emerald-400 mb-2">+{results.coinsEarned}</div>
                                <div className="text-slate-400 text-sm">Coins Earned</div>
                                <div className="flex items-center gap-1 mt-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i < Math.ceil(results.coinsEarned / 4) ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                <div className="text-4xl font-black text-cyan-400 mb-2">{avgTimePerQuestion}s</div>
                                <div className="text-slate-400 text-sm">Avg Time/Q</div>
                                <div className="text-xs text-slate-500 mt-3">
                                    {avgTimePerQuestion < 60 ? '⚡ Fast' : avgTimePerQuestion < 90 ? '✓ Good' : '🐢 Slow'}
                                </div>
                            </div>

                            <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                <div className="text-4xl font-black text-violet-400 mb-2">{results.scheduleAdjustment || 'maintain'}</div>
                                <div className="text-slate-400 text-sm">Schedule</div>
                                <div className="text-xs text-slate-500 mt-3">
                                    {results.accuracy >= 85 ? '📅 Extended' : results.accuracy < 50 ? '🔄 More reviews' : '✓ On track'}
                                </div>
                            </div>
                        </motion.div>

                        {/* Difficulty Breakdown */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-8"
                        >
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-400" />
                                Performance by Difficulty
                            </h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                {['easy', 'medium', 'hard'].map(diff => {
                                    const stats = difficultyStats[diff];
                                    const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                                    const colors = {
                                        easy: { bg: 'emerald', text: 'emerald' },
                                        medium: { bg: 'amber', text: 'amber' },
                                        hard: { bg: 'red', text: 'red' }
                                    };
                                    const color = colors[diff];

                                    return (
                                        <div key={diff} className="bg-slate-800/50 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={`text-${color.text}-400 font-bold capitalize`}>{diff}</span>
                                                <span className="text-slate-400 text-sm">{stats.correct}/{stats.total}</span>
                                            </div>
                                            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ delay: 0.4 + (diff === 'easy' ? 0 : diff === 'medium' ? 0.1 : 0.2), duration: 0.6 }}
                                                    className={`h-full bg-gradient-to-r from-${color.bg}-500 to-${color.bg}-600`}
                                                />
                                            </div>
                                            <div className="text-right mt-2">
                                                <span className={`text-${color.text}-400 font-bold text-lg`}>{percentage}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Insights & Recommendations */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="grid md:grid-cols-2 gap-4 mb-8"
                        >
                            {/* Strengths */}
                            <div className="bg-emerald-950/30 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20">
                                <h4 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Strengths ({strongAreas})
                                </h4>
                                <ul className="space-y-2 text-sm text-slate-300">
                                    {results.accuracy >= 80 && <li>✓ Excellent topic understanding</li>}
                                    {difficultyStats.hard.correct > 0 && <li>✓ Can handle challenging questions</li>}
                                    {avgTimePerQuestion < 60 && <li>✓ Quick problem-solving skills</li>}
                                    {strongAreas >= results.totalQuestions * 0.7 && <li>✓ Consistent performance</li>}
                                    {strongAreas === results.totalQuestions && <li>🌟 Perfect score - exceptional!</li>}
                                </ul>
                            </div>

                            {/* Areas to Improve */}
                            <div className="bg-orange-950/30 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20">
                                <h4 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2">
                                    <Target className="w-5 h-5" />
                                    Areas to Improve ({weakAreas})
                                </h4>
                                <ul className="space-y-2 text-sm text-slate-300">
                                    {results.accuracy < 60 && <li>• Review core concepts thoroughly</li>}
                                    {difficultyStats.easy.correct < difficultyStats.easy.total && <li>• Focus on fundamentals</li>}
                                    {avgTimePerQuestion > 90 && <li>• Practice for speed</li>}
                                    {weakAreas > strongAreas && <li>• More revision needed</li>}
                                    {weakAreas === 0 && <li>🎯 No weak areas - keep it up!</li>}
                                </ul>
                            </div>
                        </motion.div>

                        {/* Question-by-Question Breakdown */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-8"
                        >
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Brain className="w-5 h-5 text-violet-400" />
                                Detailed Review
                            </h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {results.results?.map((r, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + idx * 0.05 }}
                                        className={`p-4 rounded-xl border ${r.isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${r.isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                                {r.isCorrect ? (
                                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-white" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <p className="text-white font-medium text-sm flex-1">{idx + 1}. {r.questionText}</p>
                                                    {r.difficulty && (
                                                        <span className={`ml-2 px-2 py-1 rounded text-xs font-bold flex-shrink-0 ${r.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                                                            r.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                                                'bg-red-500/20 text-red-400'
                                                            }`}>
                                                            {r.difficulty}
                                                        </span>
                                                    )}
                                                </div>
                                                {!r.isCorrect && (
                                                    <div className="mt-2 p-3 bg-slate-800/50 rounded-lg">
                                                        <p className="text-xs text-slate-400 mb-1">Your answer: <span className="text-red-400 font-medium">{r.options?.[r.userAnswer]}</span></p>
                                                        <p className="text-xs text-slate-400 mb-2">Correct answer: <span className="text-emerald-400 font-medium">{r.options?.[r.correctAnswer]}</span></p>
                                                        {r.explanation && (
                                                            <p className="text-xs text-cyan-400 italic">💡 {r.explanation}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex gap-4"
                        >
                            <Link
                                to="/revision"
                                className="flex-1 py-4 bg-slate-800 text-white rounded-xl font-bold text-center hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                            >
                                <Home className="w-5 h-5" />
                                Back to Revisions
                            </Link>
                            <button
                                onClick={() => { setShowResults(false); setCurrentQuestion(0); setAnswers({}); setShowConfigModal(true); }}
                                className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Try Again
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
        );
    }

    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
        <div className="min-h-screen bg-[#020617] relative overflow-hidden">
            <QuizBackground />
            <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="fixed bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <header className="px-4 py-4">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <Link to="/adaptive-revision" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                            <ArrowLeft className="w-5 h-5" />
                            Exit Quiz
                        </Link>
                        <div className="text-white font-bold">{quiz.topicTitle}</div>
                        <div className="text-slate-400">
                            {currentQuestion + 1} / {quiz.questions.length}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="max-w-4xl mx-auto mt-4">
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-cyan-500 to-violet-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>
                </header>

                {/* Question */}
                <main className="flex-1 flex items-center justify-center p-4">
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="max-w-2xl w-full"
                    >
                        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-xl flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-slate-400 text-sm">Question {currentQuestion + 1}</span>
                            </div>

                            <h2 className="text-xl md:text-2xl font-bold text-white mb-8">
                                {question.questionText}
                            </h2>

                            <div className="space-y-3">
                                {question.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswerSelect(idx)}
                                        className={`w-full p-4 rounded-xl text-left transition-all border-2 ${selectedAnswer === idx
                                            ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border-cyan-500/50 text-white'
                                            : 'bg-slate-800/50 border-transparent text-slate-300 hover:border-white/20 hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${selectedAnswer === idx ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400'
                                                }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className="font-medium">{option}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </main>

                {/* Navigation */}
                <footer className="px-4 py-6">
                    <div className="max-w-2xl mx-auto flex items-center justify-between">
                        <button
                            onClick={handlePrev}
                            disabled={currentQuestion === 0}
                            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${currentQuestion === 0
                                ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                                : 'bg-slate-800 text-white hover:bg-slate-700'
                                }`}
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Previous
                        </button>

                        {currentQuestion === quiz.questions.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || Object.keys(answers).length !== quiz.questions.length}
                                className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${submitting || Object.keys(answers).length !== quiz.questions.length
                                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-500/30'
                                    }`}
                            >
                                {submitting ? 'Submitting...' : 'Submit Quiz'}
                                <CheckCircle2 className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                disabled={selectedAnswer === null}
                                className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${selectedAnswer === null
                                    ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:shadow-lg'
                                    }`}
                            >
                                Next
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </footer>
            </div>
        </div>
    );
}
