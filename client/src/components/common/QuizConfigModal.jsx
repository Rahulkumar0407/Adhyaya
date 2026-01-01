import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Brain, Zap, Target, Star } from 'lucide-react';

const QuizConfigModal = ({ isOpen, onClose, onStart, topicTitle }) => {
    const [questionCount, setQuestionCount] = useState(10);
    const [startDifficulty, setStartDifficulty] = useState('easy');
    const [adaptiveDifficulty, setAdaptiveDifficulty] = useState(true);

    const questionOptions = [5, 10, 15, 20];
    const difficultyOptions = [
        { id: 'easy', label: 'Easy', desc: 'Gentle start', icon: Target, color: 'emerald' },
        { id: 'medium', label: 'Medium', desc: 'Balanced', icon: Zap, color: 'amber' },
        { id: 'hard', label: 'Hard', desc: 'Challenge mode', icon: Star, color: 'red' }
    ];

    const handleStart = () => {
        onStart({ questionCount, startDifficulty, adaptiveDifficulty });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-slate-900 rounded-3xl p-8 max-w-lg w-full border border-white/10"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-black text-white">Configure Your Quiz</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {topicTitle && (
                    <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-cyan-400" />
                            <span className="text-cyan-400 font-medium">Topic: {topicTitle}</span>
                        </div>
                    </div>
                )}

                {/* Question Count */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-white mb-3">
                        How many questions?
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {questionOptions.map(count => (
                            <button
                                key={count}
                                onClick={() => setQuestionCount(count)}
                                className={`py-3 rounded-xl font-bold transition-all ${questionCount === count
                                    ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white scale-105'
                                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                {count}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Estimated time: {questionCount * 1.5} minutes</p>
                </div>

                {/* Starting Difficulty */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-white mb-3">
                        Starting difficulty
                    </label>
                    <div className="space-y-2">
                        {difficultyOptions.map(diff => {
                            const Icon = diff.icon;
                            const isSelected = startDifficulty === diff.id;
                            return (
                                <button
                                    key={diff.id}
                                    onClick={() => setStartDifficulty(diff.id)}
                                    className={`w-full p-4 rounded-xl text-left transition-all border-2 ${isSelected
                                        ? `bg-${diff.color}-500/20 border-${diff.color}-500/50`
                                        : 'bg-slate-800/50 border-transparent hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? `bg-${diff.color}-500/30` : 'bg-slate-700'
                                            }`}>
                                            <Icon className={`w-5 h-5 ${isSelected ? `text-${diff.color}-400` : 'text-slate-400'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className={`font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                                {diff.label}
                                            </div>
                                            <div className="text-xs text-slate-500">{diff.desc}</div>
                                        </div>
                                        {isSelected && (
                                            <div className={`w-2 h-2 rounded-full bg-${diff.color}-500 animate-pulse`} />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Adaptive Difficulty Toggle */}
                <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={adaptiveDifficulty}
                                    onChange={(e) => setAdaptiveDifficulty(e.target.checked)}
                                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0 focus:ring-offset-slate-900"
                                />
                                <span className="font-bold text-white">Adaptive Difficulty</span>
                            </label>
                            <p className="text-xs text-cyan-400 mt-1 ml-7">✨ Best for grasp checking</p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 ml-7 leading-relaxed">
                        {adaptiveDifficulty ? (
                            <>Questions will mix <span className="text-emerald-400">easy</span>, <span className="text-amber-400">medium</span>, and <span className="text-red-400">hard</span> difficulties based on your starting level. Always starts easy, then progressively challenges you to test your true understanding.</>
                        ) : (
                            <>All questions will be at <span className="text-cyan-400">{startDifficulty}</span> difficulty level only. Good for focused practice at one level.</>
                        )}
                    </p>
                </div>

                {/* Start Button */}
                <button
                    onClick={handleStart}
                    className="w-full py-4 rounded-xl font-bold text-white transition-all bg-gradient-to-r from-cyan-500 to-violet-500 hover:shadow-lg hover:shadow-cyan-500/30"
                >
                    Start Quiz
                </button>
            </motion.div>
        </motion.div>
    );
};

export default QuizConfigModal;
