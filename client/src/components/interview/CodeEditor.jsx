import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Send, RotateCcw, Code2 } from 'lucide-react';

// Code Editor for DSA Interview
export default function CodeEditor({
    problem = null,
    onSubmit,
    onRun,
    disabled = false
}) {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('cpp');
    const [isRunning, setIsRunning] = useState(false);

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
}` }
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
    useState(() => {
        setCode(languages[0].template);
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

    return (
        <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
            {/* Problem Display */}
            {problem && (
                <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${problem.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' :
                                problem.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-red-500/20 text-red-400'
                            }`}>
                            {problem.difficulty}
                        </span>
                        <span className="text-slate-400 text-sm">{problem.timeLimit} mins</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{problem.title}</h3>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{problem.description}</p>

                    {problem.examples && (
                        <div className="mt-4 space-y-2">
                            <div className="text-sm font-medium text-slate-400">Examples:</div>
                            {problem.examples.map((example, idx) => (
                                <div key={idx} className="bg-slate-900/50 rounded-lg p-3 text-sm">
                                    <div className="text-cyan-400">Input: <span className="text-slate-300">{example.input}</span></div>
                                    <div className="text-emerald-400">Output: <span className="text-slate-300">{example.output}</span></div>
                                    {example.explanation && (
                                        <div className="text-slate-500 mt-1">Explanation: {example.explanation}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Editor Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800/30">
                <div className="flex items-center gap-3">
                    <Code2 className="w-5 h-5 text-cyan-400" />
                    <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="bg-slate-700 text-white text-sm px-3 py-1.5 rounded-lg border border-slate-600 focus:outline-none focus:border-cyan-500"
                    >
                        {languages.map(lang => (
                            <option key={lang.id} value={lang.id}>{lang.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReset}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        title="Reset Code"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleRun}
                        disabled={isRunning || !code.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Play className="w-4 h-4" fill="currentColor" />
                        {isRunning ? 'Running...' : 'Run'}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={disabled || !code.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                        Submit
                    </button>
                </div>
            </div>

            {/* Monaco Editor */}
            <div className="h-[400px]">
                <Editor
                    height="100%"
                    language={language === 'cpp' ? 'cpp' : 'java'}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{
                        fontSize: 14,
                        fontFamily: 'JetBrains Mono, Consolas, monospace',
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        glyphMargin: false,
                        folding: true,
                        lineDecorationsWidth: 10,
                        automaticLayout: true,
                        tabSize: 4,
                        wordWrap: 'on',
                        padding: { top: 16 },
                    }}
                />
            </div>
        </div>
    );
}
