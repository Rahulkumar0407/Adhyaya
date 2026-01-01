import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ReactMarkdown from 'react-markdown';
import {
    ArrowLeft,
    Play,
    FileText,
    Code2,
    ChevronRight,
    BookOpen,
    Clock,
    CheckCircle2
} from 'lucide-react';

export default function PatternDetail() {
    const { slug } = useParams();
    const [pattern, setPattern] = useState(null);
    const [problems, setProblems] = useState({ core: [], variations: [], practice: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('cheatsheet');

    useEffect(() => {
        fetchPattern();
    }, [slug]);

    const fetchPattern = async () => {
        try {
            const response = await api.get(`/patterns/${slug}`);
            setPattern(response.data.data.pattern);
            setProblems(response.data.data.problems);
        } catch (error) {
            console.error('Failed to fetch pattern:', error);
            // Mock data for demo
            setPattern({
                name: 'Two Pointers (Same Direction)',
                slug: 'two-pointers-same',
                category: 'foundational',
                subcategory: 'two-pointers',
                description: 'Use two pointers moving in the same direction to solve array problems efficiently.',
                videoUrl: 'https://www.youtube.com/embed/VEPCm3BCtik',
                cheatsheet: `## Two Pointers (Same Direction)

### When to Use
- Removing duplicates from sorted array
- Merging two sorted arrays
- Moving zeros to end
- Finding longest sequence

### Template
\`\`\`javascript
let slow = 0;
for (let fast = 0; fast < arr.length; fast++) {
  if (condition) {
    arr[slow] = arr[fast];
    slow++;
  }
}
\`\`\`

### Key Insight
Slow pointer marks the position of the "result," fast pointer explores.`,
                keyConcepts: [
                    { title: 'Slow & Fast', description: 'Slow marks position, fast explores' },
                    { title: 'In-place', description: 'Modify array without extra space' }
                ],
                whenToUse: [
                    'Sorted array with duplicates',
                    'Need to modify array in-place',
                    'O(1) space requirement'
                ],
                typicalComplexity: { time: 'O(n)', space: 'O(1)' }
            });
            setProblems({
                core: [
                    { _id: '1', title: 'Remove Duplicates from Sorted Array', slug: 'remove-duplicates-sorted-array', difficulty: 'easy' },
                    { _id: '2', title: 'Move Zeroes', slug: 'move-zeroes', difficulty: 'easy' },
                ],
                variations: [
                    { _id: '3', title: 'Remove Element', slug: 'remove-element', difficulty: 'easy' },
                ],
                practice: [
                    { _id: '4', title: 'Merge Sorted Array', slug: 'merge-sorted-array', difficulty: 'easy' },
                ],
                total: 4
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-babua-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!pattern) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Pattern not found</h2>
                    <Link to="/patterns" className="btn btn-primary">
                        Back to Patterns
                    </Link>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'cheatsheet', label: 'Cheatsheet', icon: FileText },
        { id: 'video', label: 'Video', icon: Play },
        { id: 'problems', label: 'Problems', icon: Code2 },
    ];

    return (
        <div className="min-h-screen pt-20 pb-10 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <Link
                    to="/patterns"
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Patterns
                </Link>

                {/* Header */}
                <div className="card mb-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <span className={`badge badge-${pattern.category === 'foundational' ? 'cyan' : pattern.category === 'intermediate' ? 'purple' : 'rose'} mb-2`}>
                                {pattern.category}
                            </span>
                            <h1 className="text-3xl font-bold text-white mb-2">{pattern.name}</h1>
                            <p className="text-white/60">{pattern.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{problems.total || 0}</div>
                                <div className="text-xs text-white/50">Problems</div>
                            </div>
                            {pattern.typicalComplexity && (
                                <div className="text-center">
                                    <div className="text-lg font-mono text-babua-accent">{pattern.typicalComplexity.time}</div>
                                    <div className="text-xs text-white/50">Time</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-white/10 pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                    ? 'bg-babua-primary text-white'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        {activeTab === 'cheatsheet' && (
                            <div className="card">
                                <div className="markdown-content">
                                    <ReactMarkdown>{pattern.cheatsheet || 'No cheatsheet available.'}</ReactMarkdown>
                                </div>

                                {pattern.keyConcepts?.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-white/10">
                                        <h3 className="text-lg font-semibold text-white mb-4">Key Concepts</h3>
                                        <div className="grid gap-3">
                                            {pattern.keyConcepts.map((concept, idx) => (
                                                <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                                                    <CheckCircle2 className="w-5 h-5 text-babua-success flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <div className="font-medium text-white">{concept.title}</div>
                                                        <div className="text-sm text-white/60">{concept.description}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {pattern.whenToUse?.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-white/10">
                                        <h3 className="text-lg font-semibold text-white mb-4">When to Use</h3>
                                        <ul className="space-y-2">
                                            {pattern.whenToUse.map((item, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-white/80">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-babua-primary" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'video' && (
                            <div className="card">
                                {pattern.videoUrl ? (
                                    <div className="aspect-video rounded-lg overflow-hidden">
                                        <iframe
                                            src={pattern.videoUrl}
                                            title={pattern.name}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-video flex items-center justify-center bg-white/5 rounded-lg">
                                        <div className="text-center text-white/50">
                                            <Play className="w-12 h-12 mx-auto mb-2" />
                                            <p>Video coming soon</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'problems' && (
                            <div className="space-y-6">
                                {problems.core?.length > 0 && (
                                    <div className="card">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-babua-primary" />
                                            Core Problems
                                        </h3>
                                        <div className="space-y-2">
                                            {problems.core.map((problem) => (
                                                <ProblemRow key={problem._id} problem={problem} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {problems.variations?.length > 0 && (
                                    <div className="card">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                            <Code2 className="w-5 h-5 text-purple-400" />
                                            Variations
                                        </h3>
                                        <div className="space-y-2">
                                            {problems.variations.map((problem) => (
                                                <ProblemRow key={problem._id} problem={problem} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {problems.practice?.length > 0 && (
                                    <div className="card">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-amber-400" />
                                            Practice
                                        </h3>
                                        <div className="space-y-2">
                                            {problems.practice.map((problem) => (
                                                <ProblemRow key={problem._id} problem={problem} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="card">
                            <h3 className="text-lg font-semibold text-white mb-4">Quick Start</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setActiveTab('video')}
                                    className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-babua-primary/20 rounded-lg transition-colors group"
                                >
                                    <Play className="w-5 h-5 text-babua-primary" />
                                    <span className="text-white/80 group-hover:text-white">Watch Video</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('cheatsheet')}
                                    className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-babua-primary/20 rounded-lg transition-colors group"
                                >
                                    <FileText className="w-5 h-5 text-babua-primary" />
                                    <span className="text-white/80 group-hover:text-white">Read Cheatsheet</span>
                                </button>
                                {problems.core?.[0] && (
                                    <Link
                                        to={`/problems/${problems.core[0].slug}`}
                                        className="w-full flex items-center gap-3 p-3 bg-babua-primary/20 hover:bg-babua-primary/30 rounded-lg transition-colors group"
                                    >
                                        <Code2 className="w-5 h-5 text-babua-primary" />
                                        <span className="text-white">Start First Problem</span>
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="text-lg font-semibold text-white mb-4">Complexity</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-white/60">Time</span>
                                    <span className="font-mono text-babua-accent">{pattern.typicalComplexity?.time || 'O(n)'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Space</span>
                                    <span className="font-mono text-babua-accent">{pattern.typicalComplexity?.space || 'O(1)'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProblemRow({ problem }) {
    return (
        <Link
            to={`/problems/${problem.slug}`}
            className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
        >
            <span className="text-white group-hover:text-babua-primary transition-colors">
                {problem.title}
            </span>
            <div className="flex items-center gap-2">
                <span className={`badge badge-${problem.difficulty}`}>
                    {problem.difficulty}
                </span>
                <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-babua-primary transition-colors" />
            </div>
        </Link>
    );
}
