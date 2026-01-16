import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Send, RotateCcw, Code2, ChevronDown, ChevronUp, FileCode } from 'lucide-react';

// Enhanced Code Editor for DSA Interview with scrollable problem panel
export default function CodeEditor({
    problem = null,
    onSubmit,
    onRun,
    disabled = false
}) {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('cpp');
    const [isRunning, setIsRunning] = useState(false);
    const [problemExpanded, setProblemExpanded] = useState(true);

    const languages = [
        {
            id: 'cpp', name: 'C++', template: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    // Your solution here
    
};

int main() {
    Solution sol;
    // Test your solution
    return 0;
}` },
        {
            id: 'java', name: 'Java', template: `import java.util.*;

class Solution {
    // Your solution here
    
}

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        // Test your solution
    }
}` },
        {
            id: 'python', name: 'Python', template: `class Solution:
    def solve(self):
        # Your solution here
        pass

if __name__ == "__main__":
    sol = Solution()
    # Test your solution
` },
        {
            id: 'javascript', name: 'JavaScript', template: `class Solution {
    // Your solution here
    solve() {
        
    }
}

// Test your solution
const sol = new Solution();
` }
    ];

    // Initialize with template when language changes
    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
        const template = languages.find(l => l.id === newLang)?.template || '';
        if (!code || code === languages.find(l => l.id === language)?.template) {
            setCode(template);
        }
    };

    // Set initial template
    useEffect(() => {
        if (!code) {
            setCode(languages[0].template);
        }
    }, []);

    const handleRun = async () => {
        if (!code.trim()) return;
        setIsRunning(true);
        if (onRun) {
            await onRun(code, language);
        }
        setIsRunning(false);
    };

    const handleSubmit = () => {
        if (!code.trim() || disabled) return;
        if (onSubmit) {
            onSubmit(code, language);
        }
    };

    const handleReset = () => {
        const template = languages.find(l => l.id === language)?.template || '';
        setCode(template);
    };

    const getMonacoLanguage = (lang) => {
        const map = {
            'cpp': 'cpp',
            'java': 'java',
            'python': 'python',
            'javascript': 'javascript'
        };
        return map[lang] || 'cpp';
    };

    return (
        <div className="flex flex-col h-full min-h-[400px] bg-gradient-to-b from-[#0d1117] to-[#161b22] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">

            {/* Problem Statement Panel - Collapsible & Scrollable */}
            {problem && (
                <div className={`flex-shrink-0 border-b border-white/10 transition-all duration-300 ${problemExpanded ? 'max-h-[200px]' : 'max-h-12'}`}>
                    {/* Problem Header - Always visible */}
                    <button
                        onClick={() => setProblemExpanded(!problemExpanded)}
                        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 hover:from-purple-500/20 hover:to-cyan-500/20 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <FileCode className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="text-left">
                                <span className="text-white font-semibold text-sm">Problem Statement</span>
                                {problem.difficulty && (
                                    <span className={`ml-3 px-2 py-0.5 text-xs font-bold rounded-full ${problem.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' :
                                        problem.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                        {problem.difficulty}
                                    </span>
                                )}
                            </div>
                        </div>
                        {problemExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                    </button>

                    {/* Problem Content - Scrollable */}
                    {problemExpanded && (
                        <div className="p-4 overflow-y-auto max-h-[150px] custom-scrollbar bg-[#0d1117]/50">
                            <div className="prose prose-invert prose-sm max-w-none">
                                <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                                    {problem.description}
                                </p>
                            </div>

                            {problem.examples && problem.examples.length > 0 && (
                                <div className="mt-4 space-y-3">
                                    <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Examples</div>
                                    {problem.examples.map((example, idx) => (
                                        <div key={idx} className="bg-black/30 rounded-xl p-3 border border-white/5">
                                            <div className="flex items-start gap-2 mb-1">
                                                <span className="text-cyan-400 text-xs font-medium">Input:</span>
                                                <code className="text-gray-300 text-xs font-mono">{example.input}</code>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-emerald-400 text-xs font-medium">Output:</span>
                                                <code className="text-gray-300 text-xs font-mono">{example.output}</code>
                                            </div>
                                            {example.explanation && (
                                                <div className="mt-2 pt-2 border-t border-white/5 text-gray-500 text-xs">
                                                    💡 {example.explanation}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {problem.constraints && (
                                <div className="mt-4">
                                    <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Constraints</div>
                                    <ul className="text-gray-400 text-xs space-y-1">
                                        {problem.constraints.map((c, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <span className="w-1 h-1 bg-gray-500 rounded-full" />
                                                <code>{c}</code>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#161b22]">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Editor</span>
                    </div>

                    {/* Language Selector with nice styling */}
                    <div className="flex items-center gap-1 bg-black/30 rounded-lg p-1">
                        {languages.map(lang => (
                            <button
                                key={lang.id}
                                onClick={() => handleLanguageChange(lang.id)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${language === lang.id
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReset}
                        className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        title="Reset Code"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={disabled || !code.trim()}
                        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <Send className="w-4 h-4" />
                        Submit Solution
                    </button>
                </div>
            </div>

            {/* Monaco Editor - Fills remaining space with guaranteed min height */}
            <div className="flex-1 min-h-[250px]">
                <Editor
                    height="100%"
                    language={getMonacoLanguage(language)}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{
                        fontSize: 14,
                        fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                        fontLigatures: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: true,
                        lineNumbers: 'on',
                        glyphMargin: false,
                        folding: true,
                        lineDecorationsWidth: 10,
                        automaticLayout: true,
                        tabSize: 4,
                        wordWrap: 'on',
                        padding: { top: 16, bottom: 16 },
                        smoothScrolling: true,
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        renderLineHighlight: 'all',
                        readOnly: disabled, // Bind disabled prop to readOnly
                        domReadOnly: disabled, // Ensure DOM is also read-only if needed
                        scrollbar: {
                            vertical: 'visible',
                            horizontal: 'visible',
                            verticalScrollbarSize: 10,
                            horizontalScrollbarSize: 10,
                        }
                    }}
                />
            </div>

            {/* Custom scrollbar styles */}
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
