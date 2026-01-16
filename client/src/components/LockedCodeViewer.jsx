import { useState, useEffect, useRef } from 'react';
import { Lock, Copy, Check, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'prismjs/themes/prism-tomorrow.css';

const STORAGE_KEY = 'babua_watched_videos';

export function getWatchedVideos() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

export function markVideoWatched(videoId, startTime, endTime) {
    try {
        const watched = getWatchedVideos();
        const key = `${videoId}_${startTime}_${endTime}`;
        watched[key] = {
            completedAt: Date.now(),
            videoId,
            startTime,
            endTime
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
        return true;
    } catch {
        return false;
    }
}

export function isVideoWatched(videoId, startTime, endTime) {
    const watched = getWatchedVideos();
    const key = `${videoId}_${startTime}_${endTime}`;
    return Boolean(watched[key]);
}

export default function LockedCodeViewer({
    javaCode,
    cppCode,
    intuition,
    videoId,
    startTime,
    endTime,
    className = '',
    unlocked = false // New prop to force unlock from parent
}) {
    const [isUnlocked, setIsUnlocked] = useState(unlocked);
    const [activeTab, setActiveTab] = useState('java');
    const [copied, setCopied] = useState(false);
    const prismRef = useRef(null); // holds Prism once loaded

    useEffect(() => {
        setIsUnlocked(unlocked || isVideoWatched(videoId, startTime, endTime));
    }, [videoId, startTime, endTime, unlocked]);

    // Lazy-load Prism + languages to avoid ordering issues during Vite dev HMR
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const Prism = (await import('prismjs')).default;
                await import('prismjs/components/prism-clike');
                await import('prismjs/components/prism-java');
                await import('prismjs/components/prism-c');
                await import('prismjs/components/prism-cpp');
                prismRef.current = Prism;

                if (mounted && isUnlocked && Prism?.highlightAll) {
                    Prism.highlightAll();
                }
            } catch (err) {
                console.error('Failed to load Prism languages', err);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [isUnlocked, activeTab]);

    // Listen for video completion events
    useEffect(() => {
        const handleVideoComplete = (e) => {
            if (
                e.detail.videoId === videoId &&
                e.detail.startTime === startTime &&
                e.detail.endTime === endTime
            ) {
                setIsUnlocked(true);
            }
        };

        window.addEventListener('videoCompleted', handleVideoComplete);
        return () => window.removeEventListener('videoCompleted', handleVideoComplete);
    }, [videoId, startTime, endTime]);

    const copyCode = async () => {
        const code = activeTab === 'java' ? javaCode : cppCode;
        if (!code) return;

        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            console.error('Failed to copy');
        }
    };

    const hasCode = javaCode || cppCode;

    if (!hasCode && !intuition) {
        return null;
    }

    return (
        <div className={`bg-[#1a1a1a] rounded-2xl border border-gray-800 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-white">Code Solution</span>
                    {!isUnlocked && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-orange-500/20 text-orange-300 rounded-full flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Locked
                        </span>
                    )}
                </div>

                {isUnlocked && hasCode && (
                    <div className="flex items-center gap-2">
                        {/* Language Tabs */}
                        <div className="flex bg-gray-800 rounded-lg p-1">
                            {javaCode && (
                                <button
                                    onClick={() => setActiveTab('java')}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${activeTab === 'java'
                                        ? 'bg-orange-500 text-white'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    Java
                                </button>
                            )}
                            {cppCode && (
                                <button
                                    onClick={() => setActiveTab('cpp')}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${activeTab === 'cpp'
                                        ? 'bg-orange-500 text-white'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    C++
                                </button>
                            )}
                        </div>

                        {/* Copy Button */}
                        <button
                            onClick={copyCode}
                            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                            title="Copy code"
                        >
                            {copied ? (
                                <Check className="w-4 h-4 text-green-500" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="relative">
                <AnimatePresence mode="wait">
                    {!isUnlocked ? (
                        /* Locked State */
                        <motion.div
                            key="locked"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="relative"
                        >
                            {/* Blurred Preview */}
                            <div className="p-4 blur-md select-none pointer-events-none">
                                <pre className="text-sm text-gray-400 font-mono leading-relaxed">
                                    {`class Solution {
    public int[] solve(int[] nums) {
        // Two pointer approach
        int left = 0;
        int right = nums.length - 1;
        
        while (left < right) {
            // Process logic here
            if (condition) {
                left++;
            } else {
                right--;
            }
        }
        
        return result;
    }
}`}
                                </pre>
                            </div>

                            {/* Lock Overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-center"
                                >
                                    <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                                        <Lock className="w-8 h-8 text-orange-500" />
                                    </div>
                                    <p className="text-xl font-bold text-white mb-2">
                                        🔒 Pehle video complete karo babua
                                    </p>
                                    <p className="text-sm text-gray-400 max-w-xs">
                                        Watch the complete video explanation to unlock the code solution
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    ) : (
                        /* Unlocked State */
                        <motion.div
                            key="unlocked"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Intuition Section */}
                            {intuition && (
                                <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-orange-500/5 to-transparent">
                                    <h4 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
                                        💡 Intuition (Simple Language)
                                    </h4>
                                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                        {intuition}
                                    </p>
                                </div>
                            )}

                            {/* Code Section */}
                            {hasCode && (
                                <div className="p-4 overflow-x-auto">
                                    <pre className="text-sm leading-relaxed">
                                        <code
                                            className={`language-${activeTab === 'java' ? 'java' : 'cpp'}`}
                                        >
                                            {activeTab === 'java' ? javaCode : cppCode}
                                        </code>
                                    </pre>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
