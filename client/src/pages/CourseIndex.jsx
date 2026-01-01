import { Link } from 'react-router-dom';
import { courses } from '../data/courses';
import { Code, Layers, Network, Brain } from 'lucide-react';

const courseIcons = {
    dsa: Code,
    lld: Layers,
    'system-design': Network,
    'ai-ml': Brain,
};

const courseColors = {
    dsa: 'from-blue-500 to-cyan-600',
    lld: 'from-purple-500 to-pink-600',
    'system-design': 'from-green-500 to-emerald-600',
    'ai-ml': 'from-orange-500 to-red-600',
};

export default function CourseIndex() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Choose Your Learning Path
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Structured courses designed to help you crack tech interviews. 
                        Each course follows a clear roadmap from fundamentals to advanced topics.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {Object.values(courses).map((course) => {
                        const Icon = courseIcons[course.id];
                        const colorClass = courseColors[course.id];
                        const totalTopics = course.sections.reduce((acc, section) => {
                            if (section.subtopics) {
                                return acc + section.subtopics.reduce((subAcc, subtopic) => 
                                    subAcc + subtopic.topics.length, 0);
                            }
                            return acc + section.topics.length;
                        }, 0);

                        return (
                            <Link
                                key={course.id}
                                to={`/course/${course.id}`}
                                className="group"
                            >
                                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
                                    {/* Header with gradient */}
                                    <div className={`bg-gradient-to-r ${colorClass} p-8 text-white`}>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <h2 className="text-2xl font-bold">{course.title}</h2>
                                        </div>
                                        <p className="text-blue-100 text-lg">{course.subtitle}</p>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <p className="text-gray-600 mb-6">{course.description}</p>
                                        
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <span>{course.sections.length} Sections</span>
                                            <span>{totalTopics} Topics</span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                                Start Learning →
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Free Course
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

