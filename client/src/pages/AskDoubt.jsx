import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Code, Image as ImageIcon, FileText, Zap, Target, Star, AlertCircle, Upload, X } from 'lucide-react';
import api from '../services/api';

const AskDoubt = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        subject: '',
        subTopic: '',
        title: '',
        description: '',
        codeBlocks: [],
        attachments: [],
        priority: 'normal'
    });
    const [uploadedImages, setUploadedImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const subjects = [
        { id: 'dsa', label: 'DSA', icon: Code, price: '₹99', color: 'cyan' },
        { id: 'dbms', label: 'DBMS', icon: Brain, price: '₹79', color: 'emerald' },
        { id: 'cn', label: 'Computer Networks', icon: Zap, price: '₹79', color: 'violet' },
        { id: 'os', label: 'Operating Systems', icon: Target, price: '₹79', color: 'amber' },
        { id: 'system-design', label: 'System Design', icon: Star, price: '₹149', color: 'orange' },
        { id: 'frontend', label: 'Frontend Dev', icon: Code, price: '₹119', color: 'pink' },
        { id: 'backend', label: 'Backend Dev', icon: Code, price: '₹119', color: 'indigo' }
    ];

    const subTopicsBySubject = {
        'dsa': ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Recursion', 'Sorting', 'Searching'],
        'dbms': ['Normalization', 'SQL Queries', 'Indexing', 'Transactions', 'ACID', 'ER Diagrams'],
        'cn': ['TCP/IP', 'HTTP/HTTPS', 'Routing', 'Subnetting', 'DNS', 'OSI Model'],
        'os': ['Process Management', 'Memory Management', 'Deadlocks', 'Scheduling', 'File Systems'],
        'system-design': ['HLD', 'LLD', 'Scaling', 'Databases', 'Caching', 'Load Balancing'],
        'frontend': ['React', 'JavaScript', 'CSS', 'State Management', 'APIs'],
        'backend': ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'REST APIs', 'Authentication']
    };

    const handleSubjectSelect = (subjectId) => {
        setFormData({ ...formData, subject: subjectId, subTopic: '' });
        setStep(2);
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const maxSize = 5 * 1024 * 1024; // 5MB
        const maxFiles = 5;

        if (uploadedImages.length + files.length > maxFiles) {
            alert(`You can upload maximum ${maxFiles} images`);
            return;
        }

        files.forEach(file => {
            if (file.size > maxSize) {
                alert(`${file.name} is too large. Max size is 5MB`);
                return;
            }

            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not an image`);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImages(prev => [...prev, {
                    file,
                    preview: e.target.result,
                    name: file.name
                }]);
            };
            reader.readAsDataURL(file);
        });

        e.target.value = ''; // Reset input
    };

    const removeImage = (index) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handlePDFUpload = (e) => {
        const files = Array.from(e.target.files);
        const maxSize = 10 * 1024 * 1024; // 10MB
        const maxFiles = 3;

        const currentPDFs = formData.attachments.filter(a => a.type === 'pdf');

        if (currentPDFs.length + files.length > maxFiles) {
            alert(`You can upload maximum ${maxFiles} PDFs`);
            return;
        }

        files.forEach(file => {
            if (file.size > maxSize) {
                alert(`${file.name} is too large. Max size is 10MB`);
                return;
            }

            if (file.type !== 'application/pdf') {
                alert(`${file.name} is not a PDF`);
                return;
            }

            setFormData(prev => ({
                ...prev,
                attachments: [...prev.attachments, {
                    type: 'pdf',
                    filename: file.name,
                    size: file.size,
                    file: file
                }]
            }));
        });

        e.target.value = ''; // Reset input
    };

    const removePDF = (index) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const addCodeBlock = () => {
        setFormData(prev => ({
            ...prev,
            codeBlocks: [...prev.codeBlocks, { language: 'javascript', code: '' }]
        }));
    };

    const updateCodeBlock = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            codeBlocks: prev.codeBlocks.map((block, i) =>
                i === index ? { ...block, [field]: value } : block
            )
        }));
    };

    const removeCodeBlock = (index) => {
        setFormData(prev => ({
            ...prev,
            codeBlocks: prev.codeBlocks.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);

            const response = await api.post('/doubts/submit', formData);

            if (response.data.success) {
                navigate(`/doubts/${response.data.data.doubtId}`);
            }
        } catch (error) {
            console.error('Failed to submit doubt:', error);
            alert('Failed to submit doubt. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="fixed bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="relative z-10 container mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-black text-white mb-2">Ask Your Doubt</h1>
                    <p className="text-slate-400">Get expert help from specialized mentors</p>
                </motion.div>

                {/* Progress Steps */}
                <div className="max-w-3xl mx-auto mb-8">
                    <div className="flex items-center justify-between">
                        {['Subject', 'Topic', 'Details'].map((label, idx) => (
                            <div key={idx} className="flex items-center flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step > idx ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white' :
                                    step === idx + 1 ? 'bg-cyan-500 text-white' :
                                        'bg-slate-800 text-slate-500'
                                    }`}>
                                    {idx + 1}
                                </div>
                                <div className={`ml-3 ${step === idx + 1 ? 'text-white' : 'text-slate-500'}`}>
                                    {label}
                                </div>
                                {idx < 2 && (
                                    <div className={`flex-1 h-1 mx-4 ${step > idx + 1 ? 'bg-gradient-to-r from-cyan-500 to-violet-500' : 'bg-slate-800'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step 1: Select Subject */}
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {subjects.map(subject => {
                                const Icon = subject.icon;
                                return (
                                    <motion.button
                                        key={subject.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSubjectSelect(subject.id)}
                                        className={`p-6 rounded-2xl border-2 text-left transition-all ${formData.subject === subject.id
                                            ? `bg-${subject.color}-500/20 border-${subject.color}-500/50`
                                            : 'bg-slate-900/60 border-white/10 hover:border-white/30'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-${subject.color}-500/20`}>
                                            <Icon className={`w-6 h-6 text-${subject.color}-400`} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1">{subject.label}</h3>
                                        <p className="text-sm text-slate-400">Starting from {subject.price}</p>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Select Sub-topic */}
                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="max-w-3xl mx-auto"
                    >
                        <button
                            onClick={() => setStep(1)}
                            className="mb-6 text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
                        >
                            ← Back to subjects
                        </button>

                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-6">
                            <h3 className="text-xl font-bold text-white mb-4">Select Sub-Topic</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {subTopicsBySubject[formData.subject]?.map(topic => (
                                    <button
                                        key={topic}
                                        onClick={() => {
                                            setFormData({ ...formData, subTopic: topic });
                                            setStep(3);
                                        }}
                                        className={`p-4 rounded-xl text-sm font-medium transition-all ${formData.subTopic === topic
                                            ? 'bg-cyan-500/20 border-2 border-cyan-500/50 text-white'
                                            : 'bg-slate-800/50 border-2 border-transparent text-slate-300 hover:border-white/20'
                                            }`}
                                    >
                                        {topic}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Write Doubt */}
                {step === 3 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="max-w-3xl mx-auto"
                    >
                        <button
                            onClick={() => setStep(2)}
                            className="mb-6 text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
                        >
                            ← Back to topics
                        </button>

                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                            {/* Title */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-white mb-2">
                                    Doubt Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., How to implement binary search recursively?"
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                                    maxLength={200}
                                />
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-white mb-2">
                                    Describe Your Doubt *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Explain your doubt in detail. Include what you've tried and where you're stuck..."
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 min-h-[200px]"
                                    maxLength={5000}
                                />
                                <p className="text-xs text-slate-500 mt-1">{formData.description.length}/5000 characters</p>
                            </div>

                            {/* Code Blocks */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-white">
                                        Data Snip / Code (Optional)
                                    </label>
                                    <button
                                        onClick={addCodeBlock}
                                        className="text-xs flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition-colors border border-cyan-500/30"
                                    >
                                        <Code className="w-3 h-3" />
                                        Add Code Block
                                    </button>
                                </div>

                                {formData.codeBlocks.map((block, idx) => (
                                    <div key={idx} className="mb-4 bg-slate-950 rounded-xl border border-slate-700 overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                                            <select
                                                value={block.language}
                                                onChange={(e) => updateCodeBlock(idx, 'language', e.target.value)}
                                                className="bg-transparent text-xs font-mono text-slate-300 focus:outline-none cursor-pointer"
                                            >
                                                <option value="javascript">JavaScript</option>
                                                <option value="python">Python</option>
                                                <option value="cpp">C++</option>
                                                <option value="java">Java</option>
                                                <option value="html">HTML</option>
                                                <option value="css">CSS</option>
                                                <option value="sql">SQL</option>
                                            </select>
                                            <button
                                                onClick={() => removeCodeBlock(idx)}
                                                className="text-slate-500 hover:text-red-400 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <textarea
                                            value={block.code}
                                            onChange={(e) => updateCodeBlock(idx, 'code', e.target.value)}
                                            placeholder="// Paste your code here..."
                                            className="w-full h-32 p-4 bg-slate-950 text-slate-300 font-mono text-sm resize-none focus:outline-none"
                                            spellCheck="false"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Image Upload */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-white mb-2">
                                    Attach Images (Optional)
                                </label>

                                {/* Upload Button */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-cyan-500 hover:bg-cyan-500/5 transition-all cursor-pointer"
                                >
                                    <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                                    <p className="text-sm text-slate-400 mb-1">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-slate-600">
                                        PNG, JPG, WEBP up to 5MB (Max 5 images)
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>

                                {/* Image Previews */}
                                {uploadedImages.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {uploadedImages.map((img, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="relative group"
                                            >
                                                <img
                                                    src={img.preview}
                                                    alt={img.name}
                                                    className="w-full h-32 object-cover rounded-xl border border-slate-700"
                                                />
                                                <button
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4 text-white" />
                                                </button>
                                                <p className="text-xs text-slate-500 mt-1 truncate">{img.name}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                <p className="text-xs text-slate-500 mt-2">
                                    {uploadedImages.length}/5 images uploaded
                                </p>
                            </div>

                            {/* PDF Upload */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-white mb-2">
                                    Attach PDFs (Optional)
                                </label>

                                <div className="flex gap-3">
                                    <label className="flex-1 border-2 border-dashed border-slate-700 rounded-xl p-4 text-center hover:border-violet-500 hover:bg-violet-500/5 transition-all cursor-pointer">
                                        <FileText className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                                        <p className="text-xs text-slate-400">Upload PDF</p>
                                        <p className="text-xs text-slate-600">Max 10MB</p>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            multiple
                                            onChange={handlePDFUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {/* PDF List */}
                                {formData.attachments.filter(a => a.type === 'pdf').length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {formData.attachments
                                            .filter(a => a.type === 'pdf')
                                            .map((pdf, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <FileText className="w-5 h-5 text-violet-400 flex-shrink-0" />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm text-white truncate">{pdf.filename}</p>
                                                            <p className="text-xs text-slate-500">
                                                                {(pdf.size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removePDF(formData.attachments.indexOf(pdf))}
                                                        className="ml-2 w-7 h-7 bg-red-500/20 hover:bg-red-500 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                                                    >
                                                        <X className="w-4 h-4 text-red-400" />
                                                    </button>
                                                </motion.div>
                                            ))
                                        }
                                    </div>
                                )}

                                <p className="text-xs text-slate-500 mt-2">
                                    {formData.attachments.filter(a => a.type === 'pdf').length}/3 PDFs uploaded
                                </p>
                            </div>

                            {/* Priority Toggle */}
                            <div className="mb-6 p-4 bg-slate-800/50 rounded-xl">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="font-bold text-white flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-orange-400" />
                                            I'm Stuck!
                                        </h4>
                                        <p className="text-xs text-slate-400 mt-1">Get faster response (1.5x price)</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.priority === 'stuck'}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.checked ? 'stuck' : 'normal' })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Pricing Summary */}
                            <div className="bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400">Estimated Price</p>
                                        <p className="text-2xl font-black text-white">
                                            ₹{formData.priority === 'stuck' ? '149' : '99'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-400">Response Time</p>
                                        <p className="text-lg font-bold text-cyan-400">
                                            {formData.priority === 'stuck' ? '~1 hour' : '~2 hours'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={!formData.title || !formData.description || submitting}
                                className={`w-full py-4 rounded-xl font-bold text-white transition-all ${!formData.title || !formData.description || submitting
                                    ? 'bg-slate-700 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-cyan-500 to-violet-500 hover:shadow-lg hover:shadow-cyan-500/30'
                                    }`}
                            >
                                {submitting ? 'Submitting...' : 'Submit Doubt & Get AI Hint'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AskDoubt;
