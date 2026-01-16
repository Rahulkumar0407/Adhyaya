import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Clock, X, Volume2, VolumeX, MessageSquare, Sparkles, Brain, Target, Zap, AlertCircle, User } from 'lucide-react';
import RealtimeAvatar from './RealtimeAvatar';
import CodeEditor from './CodeEditor';
import speechService from '../../services/speechService';
import openRouterService from '../../services/openRouterService';
import geminiService from '../../services/geminiService';
import interviewService from '../../services/interviewService';
import { getRandomFallbackQuestion, mapWeakAreasToResources } from '../../data/fallbackQuestions';

// Interview Session Component
export default function InterviewSession({
    interviewType,
    customRole = '',
    config = null,
    onEnd,
    onResults
}) {
    // Extract config values with defaults
    const difficulty = config?.difficulty || 'intermediate';
    const companyTarget = config?.companyTarget || 'product';
    const configDuration = config?.duration || 30;
    const techStack = config?.techStack || 'javascript';
    // Interview state
    const [currentStep, setCurrentStep] = useState('loading'); // loading, intro, question, coding, feedback, complete
    const [conversation, setConversation] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [error, setError] = useState(null);

    // Results tracking
    const [problemResults, setProblemResults] = useState([]);
    const [patternsAsked, setPatternsAsked] = useState([]);
    const [strengths, setStrengths] = useState([]);
    const [improvements, setImprovements] = useState([]);
    const [overallScore, setOverallScore] = useState(0);
    const [evaluations, setEvaluations] = useState([]);
    const [weakTopics, setWeakTopics] = useState([]);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [usedFallbackQuestions, setUsedFallbackQuestions] = useState([]);

    // Timer
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [totalTimeUsed, setTotalTimeUsed] = useState(0);
    const timerRef = useRef(null);
    const chatEndRef = useRef(null);
    const startedRef = useRef(false);
    const sessionEndedRef = useRef(false);
    const processingRef = useRef(false); // Lock to prevent duplicate submissions
    const stuckCountRef = useRef(0); // Track how many times user is stuck on same question
    const followUpCountRef = useRef(0); // Track follow-ups for current question
    const timeoutsRef = useRef([]); // Track all active timeouts to clear on unmount
    const conversationRef = useRef([]); // Sync ref for conversation to avoid stale state in endInterview

    // Speech states
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [avatarEmotion, setAvatarEmotion] = useState('neutral'); // neutral, happy, impressed, encouraging, curious, concerned, disappointed
    const [isCodingQuestion, setIsCodingQuestion] = useState(false); // Track if current question is coding or concept
    const [showCodeEditor, setShowCodeEditor] = useState(false); // UI toggle for code editor

    // Interview durations (seconds) - use config duration if available
    const durations = {
        dsa: configDuration * 60,
        'system-design': configDuration * 60,
        dbms: configDuration * 60,
        custom: configDuration * 60
    };

    // Auto-scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation, isThinking]);

    // Initialize interview
    useEffect(() => {
        // Reset session ended flag on mount (fixes React Strict Mode double-invoke issue)
        sessionEndedRef.current = false;

        if (startedRef.current) return;
        startedRef.current = true;

        if (config?.voiceURI) {
            speechService.setVoice(config.voiceURI);
        }
        speechService.setSpeakingCallback(setIsSpeaking);
        startInterview();

        return () => {
            // Mark session as ended to prevent any pending speech
            sessionEndedRef.current = true;
            timeoutsRef.current.forEach(clearTimeout); // Clear all pending timeouts

            speechService.stopSpeaking();
            speechService.stopListening();
            if (timerRef.current) clearInterval(timerRef.current);

            // Aggressive speech cleanup on unmount
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Auto-open code editor for coding questions
    useEffect(() => {
        if (isCodingQuestion) {
            setShowCodeEditor(true);
        }
    }, [isCodingQuestion]);

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

            // Reset OpenRouter session for fresh interview
            openRouterService.resetSession();

            // Get dynamic intro from AI
            let introMessage;
            try {
                introMessage = await openRouterService.generateIntro(interviewType, customRole, { difficulty, companyTarget });
            } catch (err) {
                console.warn('AI intro failed, using fallback:', err);
                introMessage = `Welcome to your ${interviewType.replace('-', ' ')} interview! I'll be your interviewer today. Let's begin with a question to understand your knowledge. Take your time to think before answering.`;
            }

            setCurrentStep('intro');
            setIsThinking(false);

            if (sessionEndedRef.current) return; // Stop if session ended during await

            addAIMessage(introMessage);

            if (soundEnabled && !sessionEndedRef.current) {
                await speechService.speak(introMessage);
            }

            if (sessionEndedRef.current) return; // Stop if session ended during speak

            // Set timer with robust fallback
            const durationMins = parseInt(config?.duration) || (durations[interviewType] ? durations[interviewType] / 60 : 45);
            // Ensure we have a valid number, fallback to 45 mins
            const verifiedDuration = isNaN(durationMins) ? 45 : durationMins;
            setTimeRemaining(verifiedDuration * 60);

            // Fetch first question with tracked timeout
            const timeoutId = setTimeout(() => {
                if (!sessionEndedRef.current) askNextQuestion();
            }, 2000);
            timeoutsRef.current.push(timeoutId);
        } catch (err) {
            console.error('Failed to start interview:', err);
            setIsThinking(false);
            setError(`Interview could not start: ${err.message}. Please check your connection and try again.`);
        }
    };

    const askNextQuestion = async () => {
        try {
            setIsThinking(true);
            const nextQuestionNum = questionNumber + 1;
            setQuestionNumber(nextQuestionNum);
            followUpCountRef.current = 0; // Reset follow-up count for new question

            let questionText = "";

            try {
                // Determine previous questions for context
                const previousQuestions = conversation
                    .filter(m => m.role === 'ai')
                    .map(m => m.text);

                // Generate new question using Gemini
                // It now returns string with tags like [TYPE:CODING] [PATTERN:sliding_window]
                questionText = await geminiService.generateInterviewQuestions(
                    interviewType,
                    customRole,
                    previousQuestions,
                    config
                );

            } catch (err) {
                console.warn('AI question generation failed, using fallback:', err);
                questionText = getRandomFallbackQuestion(interviewType, usedFallbackQuestions);
                setUsedFallbackQuestions(prev => [...prev, questionText]);
            }

            // --- PROCESS TAGS ---
            if (sessionEndedRef.current) return;


            // 1. Check for Type Tag
            let isCoding = false;

            // Default based on interview type
            // For DSA: FAANG-style = coding problems from the start
            if (interviewType === 'coding' || interviewType === 'dsa') {
                isCoding = true; // DSA and Coding interviews default to coding mode
            }

            // Explicit tags override the defaults
            if (questionText.includes('[TYPE:CODING]')) {
                isCoding = true;
                questionText = questionText.replace('[TYPE:CODING]', '');
            } else if (questionText.includes('[TYPE:CONCEPT]')) {
                isCoding = false;
                questionText = questionText.replace('[TYPE:CONCEPT]', '');
            }
            setIsCodingQuestion(isCoding);

            // 2. Extract Pattern Tag
            const patternMatch = questionText.match(/\[PATTERN:(.*?)\]/i);
            if (patternMatch) {
                const pattern = patternMatch[1];
                setPatternsAsked(prev => [...prev, { pattern, score: 0, solved: false }]);
                questionText = questionText.replace(patternMatch[0], '');
            }

            // 3. Clean text
            let cleanQuestion = interviewService.cleanQuestionText(questionText);
            cleanQuestion = cleanQuestion
                .replace(/^<s>\[SYSTEM\]\s*/i, '') // Extra safety check
                .replace(/^(###\s*)?(Candidate|User|Interviewer)('s)?\s*(Response|Answer)?\s*:?\s*/gim, '')
                .trim();

            setIsThinking(false);
            setCurrentQuestion(cleanQuestion);
            addAIMessage(cleanQuestion);

            // Set UI Step based on type
            if (isCoding) {
                setCurrentStep('coding');
            } else {
                setCurrentStep('question');
            }

            console.log('Attempting to speak question:', cleanQuestion, 'Sound enabled:', soundEnabled);
            if (soundEnabled && !sessionEndedRef.current) {
                await speechService.speak(cleanQuestion);
                console.log('Speech finished successfully');
            } else {
                console.warn('Skipping speech. Sound:', soundEnabled, 'SessionEnded:', sessionEndedRef.current);
            }
        } catch (err) {
            console.error('Failed to generate question:', err);
            setError('Failed to generate question. Please try again.');
            setIsThinking(false);
        }
    };

    const addAIMessage = (text) => {
        const newMsg = { role: 'ai', text, timestamp: Date.now() };
        conversationRef.current = [...conversationRef.current, newMsg];
        setConversation(prev => [...prev, newMsg]);
    };

    const addUserMessage = (text) => {
        const newMsg = { role: 'user', text, timestamp: Date.now() };
        conversationRef.current = [...conversationRef.current, newMsg];
        setConversation(prev => [...prev, newMsg]);
    };

    const handleSendMessage = async () => {
        // Prevent duplicate submissions with lock
        if (!userInput.trim() || isThinking || processingRef.current) return;

        processingRef.current = true;

        const message = userInput;
        setUserInput('');
        addUserMessage(message);

        try {
            setIsThinking(true);
            setAvatarEmotion('curious'); // Curious while evaluating

            // Evaluate answer and get follow-up
            const evaluation = await geminiService.evaluateAnswer(currentQuestion, message, interviewType);

            // Update results tracking
            setStrengths(prev => [...new Set([...prev, ...(evaluation.strengths || [])])]);
            setImprovements(prev => [...new Set([...prev, ...(evaluation.improvements || [])])]);
            setOverallScore(prev => prev === 0 ? evaluation.score : Math.round((prev + evaluation.score) / 2));

            setIsThinking(false);

            // Set avatar emotion based on score
            const score = evaluation.score || 0;
            if (score >= 90) {
                setAvatarEmotion('impressed');
            } else if (score >= 75) {
                setAvatarEmotion('happy');
            } else if (score >= 50) {
                setAvatarEmotion('encouraging');
            } else if (score >= 30) {
                setAvatarEmotion('concerned');
            } else {
                setAvatarEmotion('disappointed');
            }

            // Reset emotion after speaking
            setTimeout(() => setAvatarEmotion('neutral'), 8000);

            // Build the AI response - include feedback first if available (especially for stuck responses)
            let aiResponse = '';
            if (evaluation.feedback && evaluation.score < 50) {
                // For stuck/low score responses, show encouraging feedback first
                aiResponse = evaluation.feedback;
                if (evaluation.followUp) {
                    aiResponse += ' ' + evaluation.followUp;
                }
            } else if (evaluation.followUp) {
                // Check if we've reached follow-up limit (2 max)
                if (followUpCountRef.current < 2) {
                    aiResponse = evaluation.followUp;
                    followUpCountRef.current += 1;
                } else {
                    // Force next question if limit reached
                    console.log('Follow-up limit reached, moving to next question');
                    aiResponse = ''; // Will trigger next question logic below
                }
            }

            if (aiResponse) {
                // Parse tags
                if (aiResponse.includes('[TYPE:CODING]')) {
                    setIsCodingQuestion(true);
                    aiResponse = aiResponse.replace('[TYPE:CODING]', '');
                } else if (aiResponse.includes('[TYPE:CONCEPT]')) {
                    setIsCodingQuestion(false);
                    aiResponse = aiResponse.replace('[TYPE:CONCEPT]', '');
                }

                // Clean system tokens
                aiResponse = aiResponse.replace(/<s>\[SYSTEM\]\s*/i, '').trim();

                addAIMessage(aiResponse);

                // Use the cleaned response as the new question context
                let nextQuestion = aiResponse;
                if (evaluation.feedback && aiResponse.includes(evaluation.feedback)) {
                    nextQuestion = aiResponse.replace(evaluation.feedback, '').trim();
                }
                setCurrentQuestion(nextQuestion);

                if (soundEnabled && !sessionEndedRef.current) await speechService.speak(aiResponse);
            } else {
                // If no follow-up or follow-up limit reached, transition based on context
                const problemsSolved = problemResults.length;

                // For DSA/Coding: After verbal follow-ups, present the next coding problem
                if (interviewType === 'dsa' || interviewType === 'coding') {
                    // Reset follow-up counter for next problem
                    followUpCountRef.current = 0;

                    if (problemsSolved >= 2) {
                        // Completed enough problems, end interview
                        addAIMessage("Great discussion! You've completed the coding portion. Let's wrap up.");
                        if (soundEnabled && !sessionEndedRef.current) await speechService.speak("Great discussion! Let's wrap up.");
                        setTimeout(() => endInterview(), 2000);
                    } else {
                        // Ask next coding problem
                        addAIMessage("Good! Let's move on to the next problem.");
                        if (soundEnabled && !sessionEndedRef.current) await speechService.speak("Good! Let's move on to the next problem.");
                        setTimeout(() => {
                            setIsCodingQuestion(true); // Next will be coding
                            askNextQuestion();
                        }, 2000);
                    }
                } else {
                    // For HR/System Design: continue as before
                    const aiMessages = conversationRef.current.filter(m => m.role === 'ai').length;
                    if (aiMessages >= 6) {
                        endInterview();
                    } else {
                        await askNextQuestion();
                    }
                }
            }
        } catch (err) {
            console.error('Evaluation error:', err);
            setIsThinking(false);
            // Fallback: just ask next question
            await askNextQuestion();
        } finally {
            processingRef.current = false;
        }
    };

    const handleCodeSubmit = async (code, language) => {
        if (isThinking || processingRef.current) return;

        processingRef.current = true;
        setIsThinking(true);
        addUserMessage(`[Submitted ${language} code]\n\`\`\`${language}\n${code.slice(0, 500)}${code.length > 500 ? '...' : ''}\n\`\`\``);

        try {
            // Use thorough code evaluation
            const evaluation = await geminiService.evaluateCode(currentQuestion, code, language);

            const result = {
                title: currentQuestion.split('\n')[0].replace(/\*\*/g, '').slice(0, 50),
                difficulty: 'Medium',
                solved: evaluation.correctness?.works && evaluation.score >= 60,
                score: evaluation.score,
                optimized: evaluation.timeComplexity?.isOptimal || evaluation.score >= 85
            };

            setProblemResults(prev => [...prev, result]);
            setStrengths(prev => [...new Set([...prev, ...(evaluation.strengths || [])])]);
            setImprovements(prev => [...new Set([...prev, ...(evaluation.improvements || [])])]);
            setOverallScore(prev => prev === 0 ? evaluation.score : Math.round((prev + evaluation.score) / 2));

            setIsThinking(false);

            // Build detailed feedback with complexity info
            let feedbackMsg = evaluation.feedback || "Let me review your code.";
            if (evaluation.timeComplexity?.actual) {
                feedbackMsg += ` I see this is ${evaluation.timeComplexity.actual} time complexity.`;
            }

            addAIMessage(feedbackMsg);
            if (soundEnabled && !sessionEndedRef.current) await speechService.speak(feedbackMsg);

            // IMPORTANT: Ask follow-up question about the code (FAANG style)
            if (evaluation.followUp && followUpCountRef.current < 2) {
                followUpCountRef.current += 1;

                // Small delay before asking follow-up
                const timeoutId = setTimeout(async () => {
                    if (sessionEndedRef.current) return;

                    addAIMessage(evaluation.followUp);
                    setCurrentQuestion(evaluation.followUp); // Set for voice response evaluation
                    setIsCodingQuestion(false); // Follow-up is usually a verbal answer

                    if (soundEnabled && !sessionEndedRef.current) {
                        await speechService.speak(evaluation.followUp);
                    }
                }, 2000);
                timeoutsRef.current.push(timeoutId);
            } else {
                // After follow-ups done or limit reached, move to next problem or end
                followUpCountRef.current = 0; // Reset for next problem

                const timeoutId = setTimeout(() => {
                    if (sessionEndedRef.current) return;

                    if (problemResults.length >= 2) {
                        endInterview();
                    } else {
                        askNextQuestion();
                    }
                }, 3000);
                timeoutsRef.current.push(timeoutId);
            }
        } catch (err) {
            console.error('Code evaluation error:', err);
            setIsThinking(false);
            addAIMessage("I had trouble analyzing your code. Can you explain your approach verbally?");
            setIsCodingQuestion(false); // Switch to verbal mode
        } finally {
            processingRef.current = false;
        }
    };

    const handleTimeUp = () => {
        const msg = "Time's up! Let's wrap up this session.";
        addAIMessage(msg);
        if (soundEnabled && !sessionEndedRef.current) speechService.speak(msg);
        setTimeout(() => endInterview(), 2000);
    };

    const toggleListening = () => {
        if (isListening) {
            speechService.stopListening();
            setIsListening(false);

            // Auto-submit the voice response after stopping
            // Small delay to ensure final transcript is captured
            setTimeout(() => {
                setUserInput(currentInput => {
                    if (currentInput.trim()) {
                        // Trigger submit with the current input
                        handleVoiceSubmit(currentInput.trim());
                    }
                    return ''; // Clear input after submitting
                });
            }, 500);
        } else {
            const success = speechService.startListening(
                (transcript) => {
                    setUserInput(prev => prev + ' ' + transcript);
                },
                (error) => {
                    console.error('Speech recognition error:', error);
                    setIsListening(false);
                    if (error === 'network' || error === 'no-speech' || error === 'not-allowed') {
                        // Don't show full screen error, just stop listening and notify
                        if (error === 'network') {
                            // Optional: notify user via UI if possible, or just fallback silently to text
                            console.log('Network error detected, stopping listening');
                        }
                    }
                }
            );
            if (success) setIsListening(true);
        }
    };

    const handleVoiceSubmit = async (message) => {
        // Prevent duplicate submissions with lock
        if (!message || isThinking || processingRef.current) return;

        processingRef.current = true;

        addUserMessage(message);

        try {
            setIsThinking(true);
            setAvatarEmotion('curious'); // Curious while evaluating

            // Evaluate answer and get follow-up
            const evaluation = await geminiService.evaluateAnswer(currentQuestion, message, interviewType);

            if (sessionEndedRef.current) {
                processingRef.current = false;
                return;
            }


            // Update results tracking
            setStrengths(prev => [...new Set([...prev, ...(evaluation.strengths || [])])]);
            setImprovements(prev => [...new Set([...prev, ...(evaluation.improvements || [])])]);
            setOverallScore(prev => prev === 0 ? evaluation.score : Math.round((prev + evaluation.score) / 2));

            setIsThinking(false);

            // Set avatar emotion based on score
            const score = evaluation.score || 0;
            if (score >= 90) {
                setAvatarEmotion('impressed');
            } else if (score >= 75) {
                setAvatarEmotion('happy');
            } else if (score >= 50) {
                setAvatarEmotion('encouraging');
            } else if (score >= 30) {
                setAvatarEmotion('concerned');
            } else {
                setAvatarEmotion('disappointed');
            }

            // Reset emotion after speaking
            const emotionTimeout = setTimeout(() => {
                if (!sessionEndedRef.current) setAvatarEmotion('neutral');
            }, 8000);
            timeoutsRef.current.push(emotionTimeout);

            // Track if user is stuck (low score means they couldn't answer)
            const isStuck = evaluation.score < 50;

            if (isStuck) {
                stuckCountRef.current += 1;
            } else {
                // Good answer, reset stuck count
                stuckCountRef.current = 0;
            }

            // If stuck 3+ times on same question, move on gracefully
            if (stuckCountRef.current >= 3) {
                stuckCountRef.current = 0;
                setAvatarEmotion('encouraging'); // Be supportive when moving on
                const moveOnMessage = "No worries! That's a tricky one. Let's move on to something different and we can come back to this topic later.";
                addAIMessage(moveOnMessage);
                if (soundEnabled && !sessionEndedRef.current) await speechService.speak(moveOnMessage);
                await askNextQuestion();
                return;
            }

            // Build the AI response - include feedback first if available (especially for stuck responses)
            let aiResponse = '';
            if (evaluation.feedback && evaluation.score < 50) {
                // For stuck/low score responses, show encouraging feedback first
                aiResponse = evaluation.feedback;
                if (evaluation.followUp) {
                    aiResponse += ' ' + evaluation.followUp;
                }
            } else if (evaluation.followUp) {
                // Check follow-up limit
                if (followUpCountRef.current < 2) {
                    aiResponse = evaluation.followUp;
                    followUpCountRef.current += 1;
                    stuckCountRef.current = 0;
                } else {
                    aiResponse = ''; // Force next question
                }
            }

            if (aiResponse) {
                // Parse tags
                if (aiResponse.includes('[TYPE:CODING]')) {
                    setIsCodingQuestion(true);
                    aiResponse = aiResponse.replace('[TYPE:CODING]', '');
                } else if (aiResponse.includes('[TYPE:CONCEPT]')) {
                    setIsCodingQuestion(false);
                    aiResponse = aiResponse.replace('[TYPE:CONCEPT]', '');
                }

                // Clean system tokens
                aiResponse = aiResponse.replace(/<s>\[SYSTEM\]\s*/i, '').trim();

                addAIMessage(aiResponse);

                // Use the cleaned response as the new question context
                // If there was feedback, we want just the question part for the next evaluation context
                let nextQuestion = aiResponse;
                if (evaluation.feedback && aiResponse.includes(evaluation.feedback)) {
                    nextQuestion = aiResponse.replace(evaluation.feedback, '').trim();
                }
                setCurrentQuestion(nextQuestion);

                if (soundEnabled && !sessionEndedRef.current) await speechService.speak(aiResponse);
            } else {
                // If no follow-up, ask a new main question or end if enough questions
                stuckCountRef.current = 0; // Reset when moving to new question
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
        } finally {
            processingRef.current = false;
        }
    };

    const endInterview = async () => {
        // Immediately stop all speech and mark session as ended
        sessionEndedRef.current = true;

        // Clear all pending timeouts
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];

        // Aggressive speech cancellation - call multiple times
        speechService.stopSpeaking();
        speechService.stopListening();
        setIsListening(false);

        // Also try to cancel at window level
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        // Call stop again after a small delay (for Chrome bugs)
        setTimeout(() => {
            speechService.stopSpeaking();
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        }, 100);

        setCurrentStep('complete');

        // Clear timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        // Use the ref for accurate count (state might be stale due to async updates)
        const latestConversation = conversationRef.current;

        // Calculate scores (provide defaults even for quick exits)
        const questionsAttempted = latestConversation.filter(m => m.role === 'user').length;
        const hasAttemptedQuestions = questionsAttempted > 0;

        const finalScore = hasAttemptedQuestions
            ? (overallScore || 50)
            : 0; // No score if no questions attempted

        const results = {
            overallScore: finalScore,
            scores: {
                problemSolving: finalScore,
                communication: hasAttemptedQuestions ? Math.min(100, finalScore + 5) : 0,
                confidence: hasAttemptedQuestions ? Math.max(0, finalScore - 5) : 0,
                accuracy: finalScore
            },
            problems: problemResults,
            patternsAsked: patternsAsked,
            questionsAttempted: questionsAttempted,
            questionsTotal: latestConversation.filter(m => m.role === 'ai').length,
            timeTaken: totalTimeUsed,
            strengths: hasAttemptedQuestions
                ? (strengths.length > 0 ? strengths : ['Willing to try', 'Showed up for practice'])
                : ['Showed up for practice'],
            weakPoints: hasAttemptedQuestions
                ? (improvements.length > 0 ? improvements : ['Could provide more detailed answers'])
                : ['Interview ended too quickly to evaluate'],
            suggestions: hasAttemptedQuestions
                ? ['Practice more mock interviews', 'Take time to fully answer questions']
                : ['Try completing at least a few questions for better feedback'],
            conversation: latestConversation,
            completedEarly: !hasAttemptedQuestions
        };

        const msg = hasAttemptedQuestions
            ? `Great job! You've completed the interview. Your overall performance score is ${results.overallScore}.`
            : `Interview ended. Try answering some questions next time for a proper evaluation!`;
        addAIMessage(msg);

        // Save interview to backend (non-blocking)
        // Save interview to backend (non-blocking) - Don't await
        interviewService.saveInterview({
            interviewType,
            customRole,
            config: { difficulty, companyTarget, techStack, duration: configDuration },
            overallScore: results.overallScore,
            scores: results.scores,
            patternsAsked: results.patternsAsked,
            conversation: results.conversation,
            problems: results.problems,
            strengths: results.strengths,
            weakPoints: results.weakPoints,
            suggestions: results.suggestions,
            timeTaken: results.timeTaken,
            questionsAttempted: results.questionsAttempted,
            questionsTotal: results.questionsTotal,
            completedEarly: results.completedEarly
        }).then(() => {
            console.log('Interview saved successfully');
        }).catch(error => {
            console.error('Failed to save interview:', error);
        });

        // Save weak points to localStorage for tracking
        try {
            const storedWeakPoints = localStorage.getItem('interview_weak_points');
            let allWeakPoints = storedWeakPoints ? JSON.parse(storedWeakPoints) : [];

            // Add new weak points
            results.weakPoints.forEach(wp => {
                const existing = allWeakPoints.find(p => p.topic.toLowerCase() === wp.toLowerCase());
                if (existing) {
                    existing.count += 1;
                    existing.lastSeen = new Date().toISOString();
                } else {
                    allWeakPoints.push({
                        topic: wp,
                        count: 1,
                        lastSeen: new Date().toISOString(),
                        improving: false
                    });
                }
            });

            // Mark as improving if appears in strengths
            results.strengths.forEach(s => {
                const existing = allWeakPoints.find(p =>
                    p.topic.toLowerCase().includes(s.toLowerCase()) ||
                    s.toLowerCase().includes(p.topic.toLowerCase())
                );
                if (existing) {
                    existing.improving = true;
                    existing.improvedAt = new Date().toISOString();
                }
            });

            localStorage.setItem('interview_weak_points', JSON.stringify(allWeakPoints));
        } catch (e) {
            console.error('Failed to save weak points:', e);
        }

        setTimeout(() => {
            if (onResults) onResults(results);
        }, 1500);
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
                            onClick={endInterview} // Fixed: Call local function to save results, NOT the prop
                            className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl transition-all font-bold"
                        >
                            <X className="w-5 h-5" />
                            <span className="hidden sm:inline">End Session</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full p-4 md:p-6 flex flex-col gap-4 overflow-hidden">

                {/* Interview Type Header */}
                <div className="flex items-center justify-between gap-4 px-2">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
                            <Brain className="w-5 h-5 text-cyan-400" />
                            <span className="text-white font-bold capitalize">
                                {interviewType === 'dsa' ? 'DSA Coding' : interviewType === 'system-design' ? 'System Design' : interviewType.replace('-', ' ')} Interview
                            </span>
                            {/* Tech Stack Badges */}
                            {interviewType === 'dsa' && (
                                <div className="flex items-center gap-1.5 ml-2">
                                    <span className="px-2 py-1 text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
                                        {techStack}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-2xl">
                        <span className="text-purple-400 text-sm font-medium">
                            {difficulty === 'beginner' ? 'Fundamentals focused' :
                                difficulty === 'intermediate' ? 'Mix of technical & behavioral' :
                                    'Deep dive technical'}
                        </span>
                    </div>
                </div>

                {/* Two-Panel Video Call Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">

                    {/* Left Panel: AI Interviewer with Realtime Avatar - Takes 2 columns */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-[#0a0a1a] via-[#1a1a2e] to-[#0f0f2a] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[320px] relative overflow-hidden shadow-2xl">
                        {/* Animated background particles */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
                            <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                        </div>

                        {/* Live indicator */}
                        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live</span>
                        </div>

                        {/* Realtime Avatar */}
                        <RealtimeAvatar
                            isSpeaking={isSpeaking}
                            isThinking={isThinking}
                            isListening={isListening}
                            emotion={avatarEmotion}
                            avatarStyle="professional"
                        />
                    </div>

                    {/* Right Panel: User (You) + Controls - Takes 3 columns */}
                    <div className="lg:col-span-3 bg-gradient-to-br from-[#0a0a0f] via-[#1a1a1f] to-[#0f0f14] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex flex-col relative overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">You</h3>
                                    <p className="text-xs text-gray-500">Candidate</p>
                                </div>
                            </div>

                            {/* Recording Status */}
                            {isListening && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl animate-pulse">
                                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                                    <span className="text-sm font-bold text-red-400">Recording...</span>
                                </div>
                            )}
                        </div>

                        {/* Voice Input Visualization */}
                        <div className="flex-1 flex items-center justify-center min-h-[120px] relative">
                            {isListening ? (
                                <div className="flex items-end justify-center gap-1 h-20">
                                    {[...Array(12)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-2 bg-gradient-to-t from-orange-500 to-amber-400 rounded-full animate-pulse"
                                            style={{
                                                height: `${20 + Math.random() * 60}%`,
                                                animationDelay: `${i * 80}ms`,
                                                animationDuration: '0.4s'
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="text-4xl mb-2">🎤</div>
                                    <p className="text-gray-500 text-sm">Click mic to start speaking</p>
                                </div>
                            )}
                        </div>

                        {/* Mic Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={toggleListening}
                                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isListening
                                    ? 'bg-gradient-to-br from-red-500 to-red-600 animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.5)]'
                                    : 'bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 shadow-xl'
                                    }`}
                            >
                                {isListening ? (
                                    <MicOff className="w-8 h-8 text-white" />
                                ) : (
                                    <Mic className="w-8 h-8 text-white" />
                                )}
                            </button>
                        </div>

                        {/* Tip */}
                        <p className="text-center text-gray-600 text-xs mt-4">
                            {isListening ? 'Click to stop and submit your answer' : 'Or type your answer below'}
                        </p>
                    </div>
                </div>

                {/* Conversation Area */}
                <div className="flex-1 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden min-h-[300px]">
                    <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Transcript</span>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Code Editor Toggle - Only show for coding questions */}
                            {isCodingQuestion && (interviewType === 'dsa' || interviewType === 'coding') && (
                                <button
                                    onClick={() => setShowCodeEditor(!showCodeEditor)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${showCodeEditor
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                        : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <code className="text-xs">{'</>'}</code>
                                    {showCodeEditor ? 'Close Editor' : 'Open Code Editor'}
                                </button>
                            )}

                            {isThinking && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full">
                                    <Sparkles className="w-3 h-3 text-purple-400 animate-spin" />
                                    <span className="text-[10px] font-bold text-purple-400 uppercase">AI Thinking</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                        {conversation.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                <div className={`max-w-[85%] px-6 py-4 rounded-[2rem] shadow-xl ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-tr-none'
                                    : 'bg-white/10 text-slate-200 border border-white/5 rounded-tl-none'
                                    }`}>
                                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                    {/* Only show timestamp for AI messages */}
                                    {msg.role === 'ai' && (
                                        <div className="text-[10px] mt-2 opacity-50 text-left">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    )}
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

                {/* Code Editor Panel (DSA / Coding types) - Only show for actual coding questions */}
                {showCodeEditor && isCodingQuestion && (interviewType === 'dsa' || interviewType === 'coding') && (
                    <div className="min-h-[500px] h-[550px] bg-gradient-to-b from-[#0d1117] to-[#161b22] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                        <CodeEditor
                            problem={{
                                description: currentQuestion,
                                difficulty: difficulty === 'beginner' ? 'Easy' : difficulty === 'advanced' ? 'Hard' : 'Medium'
                            }}
                            onSubmit={handleCodeSubmit}
                            disabled={currentStep === 'complete'}
                        />
                    </div>
                )}

                {/* Right Side: Code Editor (DSA only) */}
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

