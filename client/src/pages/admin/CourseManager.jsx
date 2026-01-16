import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Plus,
    Upload,
    Video,
    FileText,
    Code,
    Trash2,
    Edit,
    Eye,
    ChevronRight,
    Loader2,
    Search,
    Filter,
    Clock
} from 'lucide-react';
import GlassCard from '../../components/admin/GlassCard';
import NeonButton from '../../components/admin/NeonButton';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../../services/adminService';

// Course data structure
const coursesData = [
    {
        id: 'dsa',
        name: 'DSA Patterns',
        icon: '🧮',
        color: 'cyan',
        totalTopics: 15,
        totalVideos: 120,
        status: 'active',
    },
    {
        id: 'system-design',
        name: 'System Design',
        icon: '🏗️',
        color: 'purple',
        totalTopics: 10,
        totalVideos: 45,
        status: 'active',
    },
    {
        id: 'dbms',
        name: 'DBMS',
        icon: '🗄️',
        color: 'green',
        totalTopics: 8,
        totalVideos: 32,
        status: 'active',
    },
    {
        id: 'cn',
        name: 'Computer Networks',
        icon: '🌐',
        color: 'orange',
        totalTopics: 0,
        totalVideos: 0,
        status: 'coming_soon',
    },
    {
        id: 'os',
        name: 'Operating Systems',
        icon: '💻',
        color: 'pink',
        totalTopics: 0,
        totalVideos: 0,
        status: 'coming_soon',
    },
];

const CourseManager = () => {
    const queryClient = useQueryClient();
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: '',
        type: 'other',
        status: 'draft'
    });

    // Fetch courses
    const { data: coursesData, isLoading } = useQuery({
        queryKey: ['admin-courses'],
        queryFn: getCourses
    });

    const courses = coursesData?.courses || [];

    // Create course mutation
    const createMutation = useMutation({
        mutationFn: createCourse,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-courses']);
            toast.success('Course created successfully');
            setShowAddModal(false);
            setNewCourse({ title: '', description: '', type: 'other', status: 'draft' });
        },
        onError: () => toast.error('Failed to create course')
    });

    const handleCreateCourse = () => {
        if (!newCourse.title || !newCourse.description) {
            toast.error('Title and description are required');
            return;
        }
        createMutation.mutate(newCourse);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">Course Content Manager</h2>
                    <p className="text-gray-500">Manage videos, PDFs, and code snippets</p>
                </div>
                <NeonButton variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
                    Add Content
                </NeonButton>
            </div>

            {/* Course Cards Grid */}
            <div className="grid grid-cols-3 gap-6">
                {courses.map((course) => (
                    <motion.div key={course._id} variants={itemVariants}>
                        <GlassCard
                            neonColor={course.type === 'dsa' ? 'cyan' : 'purple'} // Simple color logic for now
                            padding="p-0"
                            hover={true}
                        >
                            <button
                                onClick={() => setSelectedCourse(course)}
                                className="w-full text-left"
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-4xl text-white">📚</span>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${course.status === 'published'
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-gray-500/20 text-gray-400'
                                                }`}
                                        >
                                            {course.status}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <span>{course.sections?.length || 0} Topics</span>
                                        <span>•</span>
                                        <span>{course.type}</span>
                                    </div>
                                </div>
                                <div className="px-6 py-3 border-t border-gray-800/50 flex items-center justify-between">
                                    <span className="text-sm text-cyan-400">Manage Content</span>
                                    <ChevronRight className="w-4 h-4 text-cyan-400" />
                                </div>
                            </button>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* Content Management Panel */}
            <AnimatePresence>
                {selectedCourse && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <GlassCard neonColor={selectedCourse.color} padding="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{selectedCourse.icon}</span>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{selectedCourse.name}</h3>
                                        <p className="text-sm text-gray-500">Manage course content</p>
                                    </div>
                                </div>
                                <NeonButton variant="ghost" onClick={() => setSelectedCourse(null)}>
                                    Close
                                </NeonButton>
                            </div>

                            {/* Search and Filter */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search topics..."
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 
                      text-white placeholder:text-gray-500 outline-none focus:border-cyan-500/30"
                                    />
                                </div>
                                <NeonButton variant="secondary" icon={Filter}>
                                    Filter
                                </NeonButton>
                            </div>

                            {/* Content Actions */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <button
                                    className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50
                    hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all"
                                    onClick={() => toast.success('Video uploader coming soon!')}
                                >
                                    <Video className="w-6 h-6 text-cyan-400" />
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-white">Upload Video</p>
                                        <p className="text-xs text-gray-500">YouTube or local</p>
                                    </div>
                                </button>
                                <button
                                    className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50
                    hover:bg-purple-500/10 hover:border-purple-500/30 transition-all"
                                    onClick={() => toast.success('PDF uploader coming soon!')}
                                >
                                    <FileText className="w-6 h-6 text-purple-400" />
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-white">Upload PDF</p>
                                        <p className="text-xs text-gray-500">Lecture notes</p>
                                    </div>
                                </button>
                                <button
                                    className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50
                    hover:bg-green-500/10 hover:border-green-500/30 transition-all"
                                    onClick={() => toast.success('Code editor coming soon!')}
                                >
                                    <Code className="w-6 h-6 text-green-400" />
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-white">Add Code</p>
                                        <p className="text-xs text-gray-500">Monaco editor</p>
                                    </div>
                                </button>
                            </div>

                            {/* Placeholder for content list */}
                            <div className="text-center py-12 text-gray-500">
                                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg">Content management UI in progress</p>
                                <p className="text-sm">Video/PDF upload and code editor coming soon</p>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Content Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-lg rounded-2xl overflow-hidden"
                            style={{
                                background: 'rgba(15, 15, 25, 0.95)',
                                border: '1px solid rgba(0, 240, 255, 0.2)',
                            }}
                        >
                            <div className="p-6 border-b border-cyan-500/10">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Plus className="w-6 h-6 text-cyan-400" />
                                    Add New Content
                                </h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={newCourse.title}
                                        onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none"
                                        placeholder="Course Title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Description</label>
                                    <textarea
                                        value={newCourse.description}
                                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none"
                                        placeholder="Course Description"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Type</label>
                                    <select
                                        value={newCourse.type}
                                        onChange={(e) => setNewCourse({ ...newCourse, type: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none"
                                    >
                                        <option value="dsa">DSA</option>
                                        <option value="system-design">System Design</option>
                                        <option value="dbms">DBMS</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Content Type</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'video', label: 'Video', icon: Video, color: 'cyan' },
                                            { id: 'pdf', label: 'PDF', icon: FileText, color: 'purple' },
                                            { id: 'code', label: 'Code', icon: Code, color: 'green' },
                                        ].map((type) => (
                                            <button
                                                key={type.id}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all
                          bg-${type.color}-500/5 border-${type.color}-500/20 hover:border-${type.color}-500/50`}
                                            >
                                                <type.icon className={`w-6 h-6 text-${type.color}-400`} />
                                                <span className="text-sm text-white">{type.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Topic Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Two Pointer Pattern Introduction"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-cyan-500/10 flex gap-3">
                                <NeonButton variant="ghost" fullWidth onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </NeonButton>
                                <NeonButton variant="primary" fullWidth icon={Plus} onClick={handleCreateCourse} loading={createMutation.isLoading}>
                                    Create Course
                                </NeonButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CourseManager;
