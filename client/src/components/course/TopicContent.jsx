import { useState } from 'react';
import { CheckCircle2, Circle, Code, Lightbulb, AlertTriangle, Briefcase, BookOpen, Play } from 'lucide-react';

export default function TopicContent({ courseId, topic, progress, onProgressUpdate }) {
    const [activeCodeTab, setActiveCodeTab] = useState('python');
    const [isCompleted, setIsCompleted] = useState(progress?.completed || false);

    // Mock content - in real app, this would come from API/database
    const topicContent = {
        motivation: "Don't worry if this seems complex at first. We'll break it down step by step, and by the end, you'll have a solid understanding that will help you in interviews.",
        explanation: `This topic covers the fundamental concepts and techniques you need to master. We'll start with the basics and gradually build up to more advanced applications.

Understanding this concept is crucial because it forms the foundation for many interview problems. Once you grasp the core idea, you'll be able to recognize when to apply it and solve problems efficiently.`,
        visual: {
            type: 'diagram', // or 'illustration', 'chart'
            description: 'Visual representation showing the key concepts'
        },
        codeExamples: {
            python: `# Example implementation
def example_function():
    # Your code here
    pass`,
            javascript: `// Example implementation
function exampleFunction() {
    // Your code here
}`,
            java: `// Example implementation
public class Example {
    public void exampleMethod() {
        // Your code here
    }
}`,
        },
        keyObservations: [
            'Key insight about the concept',
            'Important pattern to recognize',
            'Common application scenarios',
            'Performance considerations',
        ],
        commonMistakes: [
            'Mistake 1: Description of what goes wrong',
            'Mistake 2: Another common pitfall',
            'Mistake 3: Edge case handling issues',
        ],
        interviewTips: [
            'How to approach this in interviews',
            'What interviewers are looking for',
            'How to communicate your solution',
            'Time complexity discussion points',
        ],
        practiceProblems: [
            { title: 'Problem 1: Basic Application', difficulty: 'Easy', link: '#' },
            { title: 'Problem 2: Medium Complexity', difficulty: 'Medium', link: '#' },
            { title: 'Problem 3: Advanced Challenge', difficulty: 'Hard', link: '#' },
        ],
        revisionSummary: `Quick recap: This topic covered the essential concepts, key patterns, and practical applications. Remember the main intuition and common pitfalls when approaching similar problems.`,
    };

    const handleMarkComplete = () => {
        const newCompleted = !isCompleted;
        setIsCompleted(newCompleted);
        onProgressUpdate(newCompleted);
    };

    return (
        <div className="max-w-4xl mx-auto px-8 py-10">
            {/* Topic Title */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-4xl font-bold text-gray-900">
                        {topic.title}
                    </h1>
                    <button
                        onClick={handleMarkComplete}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                            isCompleted
                                ? 'bg-green-50 border-green-200 text-green-700'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {isCompleted ? (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="text-sm font-medium">Completed</span>
                            </>
                        ) : (
                            <>
                                <Circle className="w-5 h-5" />
                                <span className="text-sm font-medium">Mark as Complete</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Motivation Line */}
                <p className="text-lg text-gray-600 italic">
                    {topicContent.motivation}
                </p>
            </div>

            {/* Core Explanation */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    Core Explanation
                </h2>
                <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {topicContent.explanation}
                    </p>
                </div>
            </section>

            {/* Visual / Diagram Placeholder */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Visual Guide
                </h2>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-xl p-12 text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-gray-600 text-lg">
                        {topicContent.visual.description}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        (Diagram/Illustration placeholder)
                    </p>
                </div>
            </section>

            {/* Code Examples */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Code className="w-6 h-6 text-blue-600" />
                    Code Examples
                </h2>
                
                {/* Language Tabs */}
                <div className="flex gap-2 mb-4 border-b border-gray-200">
                    {['python', 'javascript', 'java'].map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setActiveCodeTab(lang)}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeCodeTab === lang
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Code Block */}
                <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                    <pre className="text-sm text-gray-100 font-mono">
                        <code>{topicContent.codeExamples[activeCodeTab]}</code>
                    </pre>
                </div>
            </section>

            {/* Key Observations / Intuition */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-yellow-500" />
                    Key Observations & Intuition
                </h2>
                <ul className="space-y-3">
                    {topicContent.keyObservations.map((observation, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-yellow-600 text-xs font-bold">{index + 1}</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{observation}</p>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Common Mistakes */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                    Common Mistakes
                </h2>
                <ul className="space-y-3">
                    {topicContent.commonMistakes.map((mistake, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-orange-600 text-xs font-bold">!</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{mistake}</p>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Interview Tips */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                    Interview Tips
                </h2>
                <ul className="space-y-3">
                    {topicContent.interviewTips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-600 text-xs font-bold">💡</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{tip}</p>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Practice Problems */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Play className="w-6 h-6 text-green-600" />
                    Practice Problems
                </h2>
                <div className="space-y-3">
                    {topicContent.practiceProblems.map((problem, index) => (
                        <a
                            key={index}
                            href={problem.link}
                            className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900">{problem.title}</h3>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                    problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {problem.difficulty}
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            </section>

            {/* Revision Summary */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Revision Summary
                </h2>
                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
                    <p className="text-gray-700 leading-relaxed">
                        {topicContent.revisionSummary}
                    </p>
                </div>
            </section>
        </div>
    );
}

