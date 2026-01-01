import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Lock } from 'lucide-react';

export default function CourseSidebar({ course, courseId, currentTopicSlug, progress, onTopicChange }) {
    const [expandedSections, setExpandedSections] = useState(new Set(course.sections.map(s => s.id)));
    const [expandedSubtopics, setExpandedSubtopics] = useState(new Set());

    const toggleSection = (sectionId) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    const toggleSubtopic = (subtopicId) => {
        const newExpanded = new Set(expandedSubtopics);
        if (newExpanded.has(subtopicId)) {
            newExpanded.delete(subtopicId);
        } else {
            newExpanded.add(subtopicId);
        }
        setExpandedSubtopics(newExpanded);
    };

    const getTopicStatus = (topicSlug) => {
        const topicProgress = progress[topicSlug];
        if (topicProgress?.completed) return 'completed';
        if (topicSlug === currentTopicSlug) return 'current';
        return 'pending';
    };

    const calculateSectionProgress = (section) => {
        let totalTopics = 0;
        let completedTopics = 0;

        if (section.subtopics) {
            section.subtopics.forEach(subtopic => {
                subtopic.topics.forEach(topic => {
                    totalTopics++;
                    if (progress[topic.slug]?.completed) {
                        completedTopics++;
                    }
                });
            });
        } else {
            section.topics.forEach(topic => {
                totalTopics++;
                if (progress[topic.slug]?.completed) {
                    completedTopics++;
                }
            });
        }

        return totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    };

    return (
        <aside className="w-80 bg-white border-r border-gray-200 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto hide-scrollbar">
            <div className="p-4">
                <div className="mb-4">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Course Structure
                    </h2>
                    <div className="text-xs text-gray-400">
                        {course.sections.length} sections
                    </div>
                </div>

                <nav className="space-y-1">
                    {course.sections.map((section) => {
                        const isExpanded = expandedSections.has(section.id);
                        const sectionProgress = calculateSectionProgress(section);

                        return (
                            <div key={section.id} className="mb-2">
                                {/* Section Header */}
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-gray-50 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {isExpanded ? (
                                            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        )}
                                        <span className="font-medium text-gray-900 text-sm truncate">
                                            {section.title}
                                        </span>
                                    </div>
                                    {sectionProgress > 0 && (
                                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                            {sectionProgress}%
                                        </span>
                                    )}
                                </button>

                                {/* Section Content */}
                                {isExpanded && (
                                    <div className="ml-4 mt-1 space-y-0.5">
                                        {section.subtopics ? (
                                            // Nested structure (e.g., Design Patterns)
                                            section.subtopics.map((subtopic) => {
                                                const isSubtopicExpanded = expandedSubtopics.has(subtopic.id);
                                                
                                                return (
                                                    <div key={subtopic.id} className="mb-2">
                                                        <button
                                                            onClick={() => toggleSubtopic(subtopic.id)}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                                                        >
                                                            {isSubtopicExpanded ? (
                                                                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                                            ) : (
                                                                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                                                            )}
                                                            <span className="text-sm text-gray-700 font-medium">
                                                                {subtopic.title}
                                                            </span>
                                                        </button>

                                                        {isSubtopicExpanded && (
                                                            <div className="ml-6 mt-1 space-y-0.5">
                                                                {subtopic.topics.map((topic) => {
                                                                    const status = getTopicStatus(topic.slug);
                                                                    const isCurrent = topic.slug === currentTopicSlug;

                                                                    return (
                                                                        <button
                                                                            key={topic.id}
                                                                            onClick={() => onTopicChange(topic.slug)}
                                                                            className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-md transition-colors ${
                                                                                isCurrent
                                                                                    ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                                                                                    : 'hover:bg-gray-50 text-gray-700'
                                                                            }`}
                                                                        >
                                                                            <div className="flex-shrink-0">
                                                                                {status === 'completed' ? (
                                                                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                                                ) : status === 'current' ? (
                                                                                    <Circle className="w-4 h-4 text-blue-600 fill-blue-600" />
                                                                                ) : (
                                                                                    <Circle className="w-4 h-4 text-gray-300" />
                                                                                )}
                                                                            </div>
                                                                            <span className={`text-sm truncate ${
                                                                                isCurrent ? 'font-medium' : ''
                                                                            }`}>
                                                                                {topic.title}
                                                                            </span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            // Regular structure
                                            section.topics.map((topic) => {
                                                const status = getTopicStatus(topic.slug);
                                                const isCurrent = topic.slug === currentTopicSlug;

                                                return (
                                                    <button
                                                        key={topic.id}
                                                        onClick={() => onTopicChange(topic.slug)}
                                                        className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-md transition-colors ${
                                                            isCurrent
                                                                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                                                                : 'hover:bg-gray-50 text-gray-700'
                                                        }`}
                                                    >
                                                        <div className="flex-shrink-0">
                                                            {status === 'completed' ? (
                                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                            ) : status === 'current' ? (
                                                                <Circle className="w-4 h-4 text-blue-600 fill-blue-600" />
                                                            ) : (
                                                                <Circle className="w-4 h-4 text-gray-300" />
                                                            )}
                                                        </div>
                                                        <span className={`text-sm truncate ${
                                                            isCurrent ? 'font-medium' : ''
                                                        }`}>
                                                            {topic.title}
                                                        </span>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}

