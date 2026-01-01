import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Clock, X, Volume2, VolumeX, MessageSquare, Sparkles, Brain, Target, Zap, AlertCircle } from 'lucide-react';
import AIAvatar from './AIAvatar';
import CodeEditor from './CodeEditor';
import speechService from '../../services/speechService';
import geminiService from '../../services/geminiService';

// Interview Session Component
export default function InterviewSession({
    interviewType,
    customRole = '',
    onEnd,
    onResults
}) {
    // Interview state
    const [currentStep, setCurrentStep] = useState('loading'); // loading, intro, question, coding, feedback, complete
    const [conversation, setConversation] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [error, setError] = useState(null);

    // Results tracking
    const [problemResults, setProblemResults] = useState([]);
    const [strengths, setStrengths] = useState([]);
    const [improvements, setImprovements] = useState([]);
    const [overallScore, setOverallScore] = useState(0);

    // Timer
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [totalTimeUsed, setTotalTimeUsed] = useState(0);
    const timerRef = useRef(null);
    const chatEndRef = useRef(null);
    const startedRef = useRef(false);

    // Speech states
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Interview durations (seconds)
    const durations = {
        dsa: 45 * 60,
        'system-design': 60 * 60,
        dbms: 40 * 60,
        custom: 45 * 60
    };

    // Auto-scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation, isThinking]);

    // Initialize interview
    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;

        speechService.setSpeakingCallback(setIsSpeaking);
        startInterview();

        return () => {
            speechService.stopSpeaking();
            speechService.stopListening();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Timer effect
    useEffect(() => {
        if (timeRemaining > 0 && currentStep !== 'loading' && currentStep !== 'complete') {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleTimeUp();
                        return 0;
                    }
                    return prev - 1;
                });
                setTotalTimeUsed(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timeRemaining, currentStep]);

    const startInterview = async () => {
        try {
            setCurrentStep('loading');
            setIsThinking(true);
            setError(null);

            // Reset failed keys to give them a fresh chance
            geminiService.resetFailedKeys();

            // Get dynamic intro from Gemini
            const introMessage = await geminiService.getIntroMessage(interviewType, customRole);

            setCurrentStep('intro');
            setIsThinking(false);
            addAIMessage(introMessage);

            if (soundEnabled) {
                await speechService.speak(introMessage);
            }

            // Set timer
            setTimeRemaining(durations[interviewType] || 45 * 60);

            // Fetch first question
            setTimeout(() => askNextQuestion(), 2000);
        } catch (err) {
            console.error('Failed to start interview:', err);
            setIsThinking(false);
            setError(err.message.includes('RATE_LIMIT')
                ? 'All AI keys are busy. Please try again in a few minutes.'
                : `Interview could not start: ${err.message}. Please check your connection and try again.`);
        }
    };

    const askNextQuestion = async () => {
        try {
            setIsThinking(true);
            const previousQuestions = conversation.filter(m => m.role === 'ai').map(m => m.text);

            const question = await geminiService.generateInterviewQuestions(interviewType, customRole, previousQuestions);

            setIsThinking(false);
            setCurrentQuestion(question);
            addAIMessage(question);

            if (interviewType === 'dsa') {
                setCurrentStep('coding');
            } else {
                setCurrentStep('question');
            }

            if (soundEnabled) {
                await speechService.speak(question);
            }
        } catch (err) {
            setError('Failed to generate question. Please try again.');
            setIsThinking(false);
        }
    };

    const addAIMessage = (text) => {
        setConversation(prev => [...prev, { role: 'ai', text, timestamp: Date.now() }]);
    };

    const addUserMessage = (text) => {
        setConversation(prev => [...prev, { role: 'user', text, timestamp: Date.now() }]);
    };

    const handleSendMessage = async () => {
        if (!userInput.trim() || isThinking) return;

        const message = userInput;
        setUserInput('');
        addUserMessage(message);

        try {
            setIsThinking(true);

            // Evaluate answer and get follow-up
            const evaluation = await geminiService.evaluateAnswer(currentQuestion, message, interviewType);

            // Update results tracking
            setStrengths(prev => [...new Set([...prev, ...(evaluation.strengths || [])])]);
            setImprovements(prev => [...new Set([...prev, ...(evaluation.improvements || [])])]);
            setOverallScore(prev => prev === 0 ? evaluation.score : Math.round((prev + evaluation.score) / 2));

            setIsThinking(false);

            if (evaluation.followUp) {
                addAIMessage(evaluation.followUp);
                setCurrentQuestion(evaluation.followUp);
                if (soundEnabled) await speechService.speak(evaluation.followUp);
            } else {
                // If no follow-up, ask a new main question or end if enough questions
                const aiMessages = conversation.filter(m => m.role === 'ai').length;
                if (aiMessages >= 6) {
                    endInterview();
                } else {
                    await askNextQuestion();
                }
            }
        } catch (err) {
            console.error('Evaluation error:', err);
            setIsThinking(false);
            // Fallback: just ask next question
            await askNextQuestion();
        }
    };

    const handleCodeSubmit = async (code, language) => {
        if (isThinking) return;

        setIsThinking(true);
        addUserMessage(`[Submitted ${language} code]`);

        try {
            const evaluation = await geminiService.evaluateAnswer(currentQuestion, code, 'dsa');

            const result = {
                title: currentQuestion.split('\n')[0].replace('**', '').replace('**', ''),
                difficulty: 'Medium', // Default
                solved: evaluation.score >= 70,
                score: evaluation.score,
                optimized: evaluation.score >= 90
            };

            setProblemResults(prev => [...prev, result]);
            setStrengths(prev => [...new Set([...prev, ...(evaluation.strengths || [])])]);
            setImprovements(prev => [...new Set([...prev, ...(evaluation.improvements || [])])]);
            setOverallScore(prev => prev === 0 ? evaluation.score : Math.round((prev + evaluation.score) / 2));

            setIsThinking(false);
            addAIMessage(evaluation.feedback);
            if (soundEnabled) await speechService.speak(evaluation.feedback);

            // Move to next problem or end
            if (problemResults.length >= 2) {
                setTimeout(() => endInterview(), 3000);
            } else {
                setTimeout(() => askNextQuestion(), 3000);
            }
        } catch (err) {
            setIsThinking(false);
            addAIMessage("I couldn't evaluate your code properly. Let's try another one.");
            setTimeout(() => askNextQuestion(), 3000);
        }
    };

    const handleTimeUp = () => {
        const msg = "Time's up! Let's wrap up this session.";
        addAIMessage(msg);
        if (soundEnabled) speechService.speak(msg);
        setTimeout(() => endInterview(), 2000);
    };

    const toggleListening = () => {
        if (isListening) {
            speechService.stopListening();
            setIsListening(false);
        } else {
            const success = speechService.startListening((transcript) => {
                setUserInput(prev => prev + ' ' + transcript);
            });
            if (success) setIsListening(true);
        }
    };

    const endInterview = () => {
        setCurrentStep('complete');
        speechService.stopSpeaking();

        const results = {
            overallScore: overallScore || 70,
            problems: problemResults,
            questionsAttempted: conversation.filter(m => m.role === 'user').length,
            questionsTotal: conversation.filter(m => m.role === 'ai').length,
            timeTaken: totalTimeUsed,
            strengths: strengths.length > 0 ? strengths : ['Good communication', 'Clear logic'],
            weakPoints: improvements.length > 0 ? improvements : ['Could provide more examples'],
            improvements: ['Practice more mock interviews', 'Focus on edge cases']
        };

        const msg = `Great job! You've completed the interview. Your overall performance score is ${results.overallScore}. Let's look at your detailed feedback.`;
        addAIMessage(msg);
        if (soundEnabled) speechService.speak(msg);

        setTimeout(() => {
            if (onResults) onResults(results);
        }, 4000);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
                <div className="bg-slate-800/50 backdrop-blur-xl border border-red-500/30 p-8 rounded-3xl max-w-md text-center shadow-2xl">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Interview Interrupted</h2>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <button onClick={onEnd} className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all">
                        Back to Selection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden flex flex-col">
            {/* Animated Background Orbs */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Header */}
            <header className="relative z-50 bg-slate-900/40 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all duration-500 ${timeRemaining < 300 ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' :
                            'bg-white/5 border-white/10 text-white'
                            }`}>
                            <Clock className={`w-5 h-5 ${timeRemaining < 300 ? 'animate-pulse' : ''}`} />
                            <span className="font-mono font-bold text-xl tracking-wider">{formatTime(timeRemaining)}</span>
                        </div>
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                            <span className="text-slate-300 text-sm font-medium uppercase tracking-widest">
                                {interviewType.replace('-', ' ')} Round
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`p-3 rounded-2xl transition-all duration-300 ${soundEnabled ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-slate-400 border border-white/10'
                                }`}
                        >
                            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={onEnd}
                            className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl transition-all font-bold"
                        >
                            <X className="w-5 h-5" />
                            <span className="hidden sm:inline">End Session</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col lg:flex-row gap-8 overflow-hidden">

                {/* Left Side: Avatar & Conversation */}
                <div className={`flex flex-col gap-6 transition-all duration-500 ${interviewType === 'dsa' ? 'lg:w-1/2' : 'lg:w-full max-w-4xl mx-auto'}`}>

                    {/* Avatar Section */}
                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <AIAvatar
                            isSpeaking={isSpeaking}
                            isThinking={isThinking}
                            isListening={isListening}
                        />
                    </div>

                    {/* Conversation Area */}
                    <div className="flex-1 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden min-h-[400px]">
                        <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-cyan-400" />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Transcript</span>
                            </div>
                            {isThinking && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full">
                                    <Sparkles className="w-3 h-3 text-purple-400 animate-spin" />
                                    <span className="text-[10px] font-bold text-purple-400 uppercase">AI Thinking</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                            {conversation.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                    <div className={`max-w-[85%] px-6 py-4 rounded-[2rem] shadow-xl ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-tr-none'
                                        : 'bg-white/10 text-slate-200 border border-white/5 rounded-tl-none'
                                        }`}>
                                        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                        <div className={`text-[10px] mt-2 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isThinking && (
                                <div className="flex justify-start">
                                    <div className="bg-white/10 px-6 py-4 rounded-[2rem] rounded-tl-none border border-white/5">
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        {interviewType !== 'dsa' && currentStep !== 'complete' && (
                            <div className="p-6 bg-white/5 border-t border-white/5">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={toggleListening}
                                        className={`p-4 rounded-2xl transition-all duration-300 ${isListening
                                            ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                                            : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                                            }`}
                                    >
                                        {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                                    </button>
                                    <div className="flex-1 relative group">
                                        <input
                                            type="text"
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            disabled={isThinking}
                                            placeholder={isThinking ? "AI is thinking..." : "Type your answer here..."}
                                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                                        />
                                        <div className="absolute inset-0 rounded-2xl bg-cyan-500/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity"></div>
                                    </div>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!userInput.trim() || isThinking}
                                        className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:scale-105 transition-all disabled:opacity-30 disabled:hover:scale-100"
                                    >
                                        <Send className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Code Editor (DSA only) */}
                {interviewType === 'dsa' && (
                    <div className="lg:w-1/2 flex flex-col h-full animate-in slide-in-from-right-8 duration-700">
                        <div className="flex-1 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
                            <div className="px-8 py-4 border-b border-white/5 flex items-center gap-3 bg-white/5">
                                <Zap className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interactive Code Editor</span>
                            </div>
                            <div className="flex-1 p-1">
                                <CodeEditor
                                    problem={{ description: currentQuestion }}
                                    onSubmit={handleCodeSubmit}
                                    disabled={currentStep === 'complete' || isThinking}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Loading Overlay */}
            {currentStep === 'loading' && (
                <div className="fixed inset-0 z-[100] bg-[#0a0a0f]/90 backdrop-blur-2xl flex flex-col items-center justify-center">
                    <div className="relative w-32 h-32 mb-8">
                        <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
                        <div className="absolute inset-4 border-4 border-purple-500/20 rounded-full"></div>
                        <div className="absolute inset-4 border-4 border-purple-500 rounded-full border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]"></div>
                        <Brain className="absolute inset-0 m-auto w-10 h-10 text-white animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Preparing Your Interview</h2>
                    <p className="text-slate-400 animate-pulse">AI is generating unique questions for you...</p>
                </div>
            )}

            <style jsx="true">{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}

