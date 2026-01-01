import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CourseHeader from './CourseHeader';
import CourseSidebar from './CourseSidebar';
import TopicContent from './TopicContent';
import BottomNavigation from './BottomNavigation';
import axios from 'axios';
import api from '../../services/api';
import { courses, getTopicBySlug, getAdjacentTopics } from '../../data/courses';
import UnderstandingModal from '../common/UnderstandingModal';

export default function CourseLayout() {
    const { courseId, topicSlug } = useParams();
    const navigate = useNavigate();
    const [currentTopic, setCurrentTopic] = useState(null);
    const [progress, setProgress] = useState({});
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    const course = courses[courseId];

    useEffect(() => {
        if (!course) {
            navigate('/dashboard');
            return;
        }

        // If no topic specified, navigate to first topic
        if (!topicSlug) {
            const firstSection = course.sections[0];
            let firstTopic = null;

            if (firstSection.subtopics && firstSection.subtopics.length > 0) {
                firstTopic = firstSection.subtopics[0].topics[0];
            } else if (firstSection.topics && firstSection.topics.length > 0) {
                firstTopic = firstSection.topics[0];
            }

            if (firstTopic) {
                navigate(`/ course / ${courseId}/${firstTopic.slug}`, { replace: true });
                return;
            }
        }

        // Load current topic
        if (topicSlug) {
            const topic = getTopicBySlug(courseId, topicSlug);
            setCurrentTopic(topic);
        }
    }, [courseId, topicSlug, course, navigate]);

    // Load progress from localStorage
    useEffect(() => {
        const savedProgress = localStorage.getItem(`course-progress-${courseId}`);
        if (savedProgress) {
            try {
                setProgress(JSON.parse(savedProgress));
            } catch (e) {
                console.error('Failed to load progress:', e);
            }
        }
    }, [courseId]);

    const handleTopicChange = (newSlug) => {
        navigate(`/course/${courseId}/${newSlug}`);
    };

    const handleProgressUpdate = (topicSlug, isCompleted) => {
        const newProgress = {
            ...progress,
            [topicSlug]: {
                completed: isCompleted,
                lastVisited: new Date().toISOString(),
            }
        };
        setProgress(newProgress);
        localStorage.setItem(`course-progress-${courseId}`, JSON.stringify(newProgress));
    };

    const handleFeedbackSubmit = async (data) => {
        try {
            await api.post('/adaptive-revision/feedback', {
                course: courseId,
                topicId: topicSlug,
                topicTitle: currentTopic.title,
                understandingLevel: data.understandingLevel,
                notes: data.notes
            });

            // Mark as complete locally
            handleProgressUpdate(topicSlug, true);
            setShowFeedbackModal(false);
        } catch (error) {
            console.error('Failed to submit understanding feedback:', error);
            // Mark as complete locally even if API fails
            handleProgressUpdate(topicSlug, true);
            setShowFeedbackModal(false);
        }
    };

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Course not found</div>
            </div>
        );
    }

    if (!currentTopic) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const adjacentTopics = getAdjacentTopics(courseId, topicSlug);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-[1920px] mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                ← Back to Dashboard
                            </button>
                            <span className="text-gray-300">|</span>
                            <span className="text-sm text-gray-600">
                                {course.title}
                            </span>
                        </div>
                        <div className="text-sm text-gray-500">
                            {courseId === 'dsa' && '📚 DSA Course'}
                            {courseId === 'lld' && '🏗️ LLD Course'}
                            {courseId === 'system-design' && '🌐 System Design Course'}
                            {courseId === 'ai-ml' && '🤖 AI/ML Course'}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Course Header */}
            <CourseHeader course={course} />

            {/* Main Layout: Sidebar + Content */}
            <div className="max-w-[1920px] mx-auto flex">
                {/* Fixed Left Sidebar */}
                <CourseSidebar
                    course={course}
                    courseId={courseId}
                    currentTopicSlug={topicSlug}
                    progress={progress}
                    onTopicChange={handleTopicChange}
                />

                {/* Main Content Area */}
                <main className="flex-1 min-w-0">
                    <div className="bg-white min-h-[calc(100vh-200px)]">
                        <TopicContent
                            courseId={courseId}
                            topic={currentTopic}
                            progress={progress[topicSlug]}
                            onProgressUpdate={(isCompleted) => {
                                if (isCompleted && !progress[topicSlug]?.completed) {
                                    // completing for first time -> show modal
                                    setShowFeedbackModal(true);
                                } else {
                                    // unmarking or already completed -> just toggle
                                    handleProgressUpdate(topicSlug, isCompleted);
                                }
                            }}
                        />
                    </div>

                    {/* Bottom Navigation */}
                    <BottomNavigation
                        courseId={courseId}
                        previous={adjacentTopics.previous}
                        next={adjacentTopics.next}
                    />
                </main>
            </div>

            <UnderstandingModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                onSubmit={handleFeedbackSubmit}
                topic={currentTopic}
            />
        </div>
    );
}

