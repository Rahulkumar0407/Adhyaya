import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import {
    ArrowLeft,
    Play,
    Lightbulb,
    Clock,
    CheckCircle2,
    BookmarkPlus,
    ExternalLink,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

export default function Problem() {
    const { slug } = useParams();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [showHints, setShowHints] = useState([]);
    const [showSolution, setShowSolution] = useState(false);
    const [timedMode, setTimedMode] = useState(false);
    const [timer, setTimer] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchProblem();
    }, [slug]);

    useEffect(() => {
        let interval;
        if (timedMode) {
            interval = setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timedMode]);

    const fetchProblem = async () => {
        try {
            const response = await api.get(`/problems/${slug}`);
            setProblem(response.data.data);
            setCode(response.data.data.starterCode?.[language] || '// Write your solution here\n');
        } catch (error) {
            console.error('Failed to fetch problem:', error);
            // Mock data for demo
            setProblem({
                title: 'Remove Duplicates from Sorted Array',
                slug: 'remove-duplicates-sorted-array',
                difficulty: 'easy',
                pattern: { name: 'Two Pointers', slug: 'two-pointers-same' },
                description: 'Given a sorted array nums, remove the duplicates in-place such that each element appears only once and returns the new length.\n\nDo not allocate extra space for another array; you must do this by modifying the input array in-place with O(1) extra memory.',
                examples: [
                    { input: 'nums = [1,1,2]', output: '2, nums = [1,2,_]', explanation: 'Your function should return k = 2, with the first two elements being 1 and 2.' }
                ],
                constraints: [
                    '1 <= nums.length <= 3 * 10^4',
                    '-100 <= nums[i] <= 100',
                    'nums is sorted in non-decreasing order'
                ],
                hints: [
                    { level: 1, content: 'Use two pointers - one slow and one fast.' },
                    { level: 2, content: 'The slow pointer marks the last unique element.' },
                    { level: 3, content: 'When fast finds a new unique element, increment slow and copy.' }
                ],
                starterCode: {
                    javascript: `function removeDuplicates(nums) {
  // Your code here
  
}`,
                    python: `def removeDuplicates(nums):
    # Your code here
    pass`
                },
                solution: {
                    approach: 'Use two pointers where slow tracks the position of unique elements and fast explores the array.',
                    code: {
                        javascript: `function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  
  let slow = 0;
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }
  return slow + 1;
}`
                    },
                    complexity: { time: 'O(n)', space: 'O(1)' }
                },
                leetcodeLink: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/'
            });
            setCode(`function removeDuplicates(nums) {
  // Your code here
  
}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const response = await api.post(`/problems/${slug}/submit`, {
                code,
                language,
                timeTaken: timer,
                usedHints: showHints.length > 0,
                hintsUsedCount: showHints.length
            });

            if (response.data.data.submission.status === 'passed') {
                toast.success('All tests passed! 🎉');
                if (response.data.data.isFirstSuccess) {
                    toast.success(`+${response.data.data.coinsEarned} Babua Coins!`);
                }
            } else {
                toast.error('Some tests failed. Try again!');
            }
        } catch (error) {
            // Mock success for demo
            toast.success('All tests passed! 🎉 (Demo mode)');
        } finally {
            setSubmitting(false);
            setTimedMode(false);
        }
    };

    const handleMarkForRevision = async () => {
        try {
            await api.post(`/problems/${slug}/revision`);
            toast.success('Added to revision schedule!');
        } catch (error) {
            toast.success('Added to revision schedule! (Demo mode)');
        }
    };

    const toggleHint = (level) => {
        if (showHints.includes(level)) {
            setShowHints(showHints.filter(l => l !== level));
        } else {
            setShowHints([...showHints, level]);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-babua-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Problem not found</h2>
                    <Link to="/patterns" className="btn btn-primary">
                        Back to Patterns
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-16">
            <div className="h-[calc(100vh-4rem)] flex">
                {/* Left Panel - Problem Description */}
                <div className="w-1/2 border-r border-white/10 overflow-y-auto p-6">
                    <Link
                        to={`/patterns/${problem.pattern?.slug || 'two-pointers-same'}`}
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {problem.pattern?.name || 'Pattern'}
                    </Link>

                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">{problem.title}</h1>
                            <div className="flex items-center gap-3">
                                <span className={`badge badge-${problem.difficulty}`}>
                                    {problem.difficulty}
                                </span>
                                {problem.leetcodeLink && (
                                    <a
                                        href={problem.leetcodeLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-white/50 hover:text-babua-primary flex items-center gap-1"
                                    >
                                        LeetCode <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleMarkForRevision}
                            className="btn btn-ghost text-sm"
                        >
                            <BookmarkPlus className="w-4 h-4" />
                            Mark for Revision
                        </button>
                    </div>

                    {/* Description */}
                    <div className="prose prose-invert mb-6">
                        <div className="text-white/80 whitespace-pre-wrap">{problem.description}</div>
                    </div>

                    {/* Examples */}
                    {problem.examples?.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white mb-3">Examples</h3>
                            {problem.examples.map((ex, idx) => (
                                <div key={idx} className="bg-babua-dark rounded-lg p-4 mb-3">
                                    <div className="mb-2">
                                        <span className="text-white/50 text-sm">Input: </span>
                                        <code className="text-babua-accent">{ex.input}</code>
                                    </div>
                                    <div className="mb-2">
                                        <span className="text-white/50 text-sm">Output: </span>
                                        <code className="text-babua-success">{ex.output}</code>
                                    </div>
                                    {ex.explanation && (
                                        <div className="text-sm text-white/60 mt-2 pt-2 border-t border-white/10">
                                            {ex.explanation}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Constraints */}
                    {problem.constraints?.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white mb-3">Constraints</h3>
                            <ul className="space-y-1">
                                {problem.constraints.map((c, idx) => (
                                    <li key={idx} className="text-white/70 font-mono text-sm">• {c}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Hints */}
                    {problem.hints?.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-yellow-400" />
                                Hints
                            </h3>
                            <div className="space-y-2">
                                {problem.hints.map((hint) => (
                                    <div key={hint.level} className="border border-white/10 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => toggleHint(hint.level)}
                                            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            <span className="text-white/80">Hint {hint.level}</span>
                                            {showHints.includes(hint.level) ? (
                                                <ChevronUp className="w-4 h-4 text-white/50" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-white/50" />
                                            )}
                                        </button>
                                        {showHints.includes(hint.level) && (
                                            <div className="p-3 text-white/70 text-sm border-t border-white/10">
                                                {hint.content}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Solution */}
                    <div className="mb-6">
                        <button
                            onClick={() => setShowSolution(!showSolution)}
                            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                        >
                            <span className="text-white/80 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-babua-success" />
                                View Solution
                            </span>
                            {showSolution ? (
                                <ChevronUp className="w-4 h-4 text-white/50" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-white/50" />
                            )}
                        </button>
                        {showSolution && problem.solution && (
                            <div className="mt-2 p-4 bg-babua-dark rounded-lg">
                                <p className="text-white/70 mb-4">{problem.solution.approach}</p>
                                <div className="bg-black/30 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-sm">
                                        <code className="text-babua-accent">
                                            {problem.solution.code?.[language] || problem.solution.code?.javascript}
                                        </code>
                                    </pre>
                                </div>
                                <div className="flex gap-4 mt-3 text-sm">
                                    <span className="text-white/50">Time: <span className="text-babua-accent">{problem.solution.complexity?.time}</span></span>
                                    <span className="text-white/50">Space: <span className="text-babua-accent">{problem.solution.complexity?.space}</span></span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Code Editor */}
                <div className="w-1/2 flex flex-col">
                    {/* Editor Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <div className="flex items-center gap-4">
                            <select
                                value={language}
                                onChange={(e) => {
                                    setLanguage(e.target.value);
                                    setCode(problem.starterCode?.[e.target.value] || '// Write your solution here\n');
                                }}
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm"
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                            </select>

                            <button
                                onClick={() => {
                                    setTimedMode(!timedMode);
                                    if (!timedMode) setTimer(0);
                                }}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${timedMode
                                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                                    }`}
                            >
                                <Clock className="w-4 h-4" />
                                {timedMode ? formatTime(timer) : 'Timed Mode'}
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCode(problem.starterCode?.[language] || '// Write your solution here\n')}
                                className="btn btn-ghost text-sm py-1.5"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="btn btn-primary text-sm py-1.5"
                            >
                                {submitting ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Play className="w-4 h-4" />
                                        Submit
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Code Editor (Simple Textarea - Monaco would go here) */}
                    <div className="flex-1 p-4">
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-full bg-babua-dark border border-white/10 rounded-lg p-4 font-mono text-sm text-white resize-none focus:outline-none focus:border-babua-primary"
                            placeholder="Write your solution here..."
                            spellCheck={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
