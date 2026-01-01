import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, Clock, Play, Lock } from 'lucide-react';

// Syllabus data for each course
const syllabusData = {
    dsa: {
        title: 'Data Structures & Algorithms',
        description: 'Master the fundamentals of DSA for placements',
        color: 'from-cyan-500 to-blue-600',
        startLink: '/patterns',
        modules: [
            {
                id: 1,
                title: 'Arrays & Strings',
                topics: ['Two Pointers', 'Sliding Window', 'Prefix Sum', 'Kadane\'s Algorithm'],
                duration: '8 hours',
                completed: true,
            },
            {
                id: 2,
                title: 'Linked Lists',
                topics: ['Singly Linked List', 'Doubly Linked List', 'Fast & Slow Pointers', 'Cycle Detection'],
                duration: '6 hours',
                completed: true,
            },
            {
                id: 3,
                title: 'Stacks & Queues',
                topics: ['Stack Operations', 'Monotonic Stack', 'Queue using Stack', 'Priority Queue'],
                duration: '5 hours',
                completed: false,
            },
            {
                id: 4,
                title: 'Trees',
                topics: ['Binary Trees', 'BST', 'Tree Traversals', 'Lowest Common Ancestor'],
                duration: '10 hours',
                completed: false,
            },
            {
                id: 5,
                title: 'Graphs',
                topics: ['BFS', 'DFS', 'Dijkstra', 'Topological Sort', 'Union Find'],
                duration: '12 hours',
                completed: false,
            },
            {
                id: 6,
                title: 'Dynamic Programming',
                topics: ['1D DP', '2D DP', 'DP on Strings', 'DP on Trees'],
                duration: '15 hours',
                completed: false,
            },
            {
                id: 7,
                title: 'Recursion & Backtracking',
                topics: ['Recursion Basics', 'Subsets', 'Permutations', 'N-Queens'],
                duration: '8 hours',
                completed: false,
            },
            {
                id: 8,
                title: 'Sorting & Searching',
                topics: ['Binary Search', 'Merge Sort', 'Quick Sort', 'Search in Rotated Array'],
                duration: '6 hours',
                completed: false,
            },
        ],
    },
    'system-design': {
        title: 'System Design',
        description: 'Learn to design scalable systems',
        color: 'from-purple-500 to-indigo-600',
        startLink: '/system-design',
        modules: [
            {
                id: 1,
                title: 'Fundamentals',
                topics: ['Client-Server Model', 'IP & DNS', 'Load Balancing', 'Caching Basics'],
                duration: '6 hours',
                completed: false,
            },
            {
                id: 2,
                title: 'Database Design',
                topics: ['SQL vs NoSQL', 'Indexing', 'Sharding', 'Replication'],
                duration: '8 hours',
                completed: false,
            },
            {
                id: 3,
                title: 'Scaling Techniques',
                topics: ['Horizontal vs Vertical', 'CDN', 'Message Queues', 'Microservices'],
                duration: '10 hours',
                completed: false,
            },
            {
                id: 4,
                title: 'Design Patterns',
                topics: ['API Gateway', 'Circuit Breaker', 'Rate Limiting', 'CQRS'],
                duration: '8 hours',
                completed: false,
            },
            {
                id: 5,
                title: 'Case Studies',
                topics: ['Design URL Shortener', 'Design Twitter', 'Design WhatsApp', 'Design Netflix'],
                duration: '15 hours',
                completed: false,
            },
        ],
    },
    dbms: {
        title: 'Database Management Systems',
        description: 'Master SQL and database concepts',
        color: 'from-emerald-500 to-teal-600',
        startLink: '/dbms',
        modules: [
            {
                id: 1,
                title: 'SQL Basics',
                topics: ['SELECT, WHERE, ORDER BY', 'JOINs', 'GROUP BY & HAVING', 'Subqueries'],
                duration: '8 hours',
                completed: false,
            },
            {
                id: 2,
                title: 'Database Design',
                topics: ['ER Diagrams', 'Normalization', 'Keys & Constraints', 'Schema Design'],
                duration: '6 hours',
                completed: false,
            },
            {
                id: 3,
                title: 'Transactions',
                topics: ['ACID Properties', 'Isolation Levels', 'Deadlocks', 'Concurrency Control'],
                duration: '5 hours',
                completed: false,
            },
            {
                id: 4,
                title: 'Indexing & Optimization',
                topics: ['B-Trees', 'Hash Indexes', 'Query Optimization', 'Execution Plans'],
                duration: '6 hours',
                completed: false,
            },
            {
                id: 5,
                title: 'NoSQL Databases',
                topics: ['MongoDB', 'Redis', 'Cassandra', 'When to use NoSQL'],
                duration: '5 hours',
                completed: false,
            },
        ],
    },
};

export default function Syllabus() {
    const { courseId } = useParams();
    const [activeModule, setActiveModule] = useState(null);

    const course = syllabusData[courseId];

    if (!course) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Course not found</h1>
                    <Link to="/dashboard" className="text-cyan-400 hover:underline">Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    const completedCount = course.modules.filter(m => m.completed).length;
    const progress = Math.round((completedCount / course.modules.length) * 100);

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            {/* Header */}
            <header className="bg-[#0a0a0f] border-b border-gray-800/50 sticky top-0 z-50 backdrop-blur-sm">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Dashboard</span>
                    </Link>
                    <Link
                        to={course.startLink}
                        className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${course.color} text-white font-semibold rounded-full hover:opacity-90 transition-opacity`}
                    >
                        <Play className="w-4 h-4" fill="currentColor" />
                        Shuru Karo
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="text-center mb-16">
                    <h1 className={`text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${course.color} mb-4`}>
                        {course.title}
                    </h1>
                    <p className="text-gray-400 text-lg mb-6">{course.description}</p>
                    <div className="flex items-center justify-center gap-6 text-sm">
                        <span className="text-gray-400">
                            <strong className="text-white">{course.modules.length}</strong> Modules
                        </span>
                        <span className="text-gray-400">
                            <strong className="text-white">{course.modules.reduce((acc, m) => acc + parseInt(m.duration), 0)}</strong> Hours
                        </span>
                        <span className="text-gray-400">
                            <strong className="text-emerald-400">{progress}%</strong> Complete
                        </span>
                    </div>
                </div>

                {/* Roadmap */}
                <div className="relative">
                    {/* Animated Center Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2">
                        {/* Background line */}
                        <div className="absolute inset-0 bg-gray-800 rounded-full"></div>
                        {/* Animated gradient line */}
                        <div
                            className={`absolute top-0 left-0 right-0 bg-gradient-to-b ${course.color} rounded-full animate-pulse`}
                            style={{ height: `${progress}%` }}
                        ></div>
                        {/* Glowing orb */}
                        <div
                            className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-r ${course.color} rounded-full shadow-lg shadow-cyan-500/50 animate-bounce`}
                            style={{ top: `${Math.min(progress, 95)}%` }}
                        ></div>
                    </div>

                    {/* Modules */}
                    <div className="space-y-8">
                        {course.modules.map((module, index) => (
                            <div
                                key={module.id}
                                className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                            >
                                {/* Connector dot */}
                                <div className="absolute left-1/2 -translate-x-1/2 z-10">
                                    <div className={`w-6 h-6 rounded-full border-4 ${module.completed
                                            ? 'bg-emerald-500 border-emerald-400'
                                            : 'bg-gray-800 border-gray-700'
                                        } flex items-center justify-center`}>
                                        {module.completed && <CheckCircle className="w-3 h-3 text-white" />}
                                    </div>
                                </div>

                                {/* Card */}
                                <div
                                    className={`w-[45%] ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}
                                >
                                    <div
                                        onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                                        className={`bg-[#12121a] border rounded-2xl p-5 cursor-pointer transition-all hover:border-gray-600 ${module.completed ? 'border-emerald-500/30' : 'border-gray-800'
                                            } ${activeModule === module.id ? 'ring-2 ring-cyan-500/50' : ''}`}
                                    >
                                        <div className={`flex items-center gap-3 mb-2 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                                            <span className="text-gray-500 text-xs">Module {module.id}</span>
                                            {module.completed ? (
                                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">Completed</span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-gray-500 text-xs">
                                                    <Clock className="w-3 h-3" />
                                                    {module.duration}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-semibold text-white mb-2">{module.title}</h3>

                                        {/* Expanded topics */}
                                        <div className={`overflow-hidden transition-all duration-300 ${activeModule === module.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <div className={`flex flex-wrap gap-2 mt-3 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                                                {module.topics.map((topic, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-3 py-1 bg-gray-800 text-gray-400 text-xs rounded-full"
                                                    >
                                                        {topic}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* End marker */}
                    <div className="flex justify-center mt-8">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${course.color} flex items-center justify-center shadow-lg`}>
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Start Button */}
                <div className="text-center mt-12">
                    <Link
                        to={course.startLink}
                        className={`inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r ${course.color} text-white font-bold text-lg rounded-full hover:opacity-90 transition-opacity shadow-lg`}
                    >
                        <Play className="w-5 h-5" fill="currentColor" />
                        Start Learning
                    </Link>
                </div>
            </div>
        </div>
    );
}
