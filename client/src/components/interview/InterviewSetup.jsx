import { ArrowLeft, ArrowRight, Brain, Target, MessageSquare, Users, Sparkles, Clock, Zap, Building2, Code2, BookOpen, Volume2, Play } from 'lucide-react';
import speechService from '../../services/speechService';
import { useEffect, useState } from 'react';

// Interview Setup Component - Enhanced configuration after type selection
export default function InterviewSetup({
    selectedType,
    customRole = '',
    onStart,
    onBack
}) {
    const [config, setConfig] = useState({
        difficulty: 'intermediate',
        companyTarget: 'product',
        duration: 30,
        techStack: 'javascript',
        voiceURI: ''
    });

    const [availableVoices, setAvailableVoices] = useState([]);

    useEffect(() => {
        const loadVoices = () => {
            const voices = speechService.getAvailableVoices();
            setAvailableVoices(voices);
            if (voices.length > 0 && !config.voiceURI) {
                // Try to find a good default one if none selected
                const defaultVoice =
                    voices.find(v => v.name.includes('Microsoft Aria')) ||
                    voices.find(v => v.name.includes('Google')) ||
                    voices[0];

                if (defaultVoice) {
                    setConfig(prev => ({ ...prev, voiceURI: defaultVoice.voiceURI }));
                }
            }
        };

        loadVoices();
        // Support dynamic voice loading (common in browsers)
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    const handleTestVoice = (voiceURI) => {
        speechService.setVoice(voiceURI);
        speechService.speak("Hello! This is a test of my voice. How do I sound?");
    };

    // Type metadata
    const typeInfo = {
        'hr': {
            title: 'HR / Behavioral Interview',
            icon: Users,
            color: 'from-pink-500 to-rose-500',
            description: 'Practice soft skills, STAR method, and confidence building'
        },
        'dsa': {
            title: 'DSA Concept Interview',
            icon: Brain,
            color: 'from-cyan-500 to-blue-500',
            description: 'Explain data structures & algorithms concepts verbally'
        },
        'coding': {
            title: 'Coding Interview',
            icon: Zap,
            color: 'from-amber-500 to-orange-500',
            description: 'Solve problems with code editor - text only'
        },
        'system-design': {
            title: 'System Design Interview',
            icon: Target,
            color: 'from-purple-500 to-pink-500',
            description: 'Design scalable systems with voice + text diagrams'
        },
        'custom': {
            title: customRole || 'Custom Interview',
            icon: Users,
            color: 'from-emerald-500 to-teal-500',
            description: `Tailored questions for ${customRole || 'your target role'}`
        }
    };

    const currentType = typeInfo[selectedType] || typeInfo['custom'];
    const TypeIcon = currentType.icon;

    // Difficulty options
    const difficulties = [
        { id: 'beginner', label: 'Beginner', desc: 'Fundamentals & easy problems', color: 'emerald' },
        { id: 'intermediate', label: 'Intermediate', desc: 'Medium difficulty, follow-ups', color: 'amber' },
        { id: 'advanced', label: 'Advanced', desc: 'Hard problems, deep dives', color: 'red' }
    ];

    // Company targets
    const companies = [
        { id: 'faang', label: 'FAANG / Big Tech', desc: 'Google, Amazon, Meta, etc.', icon: '🏆' },
        { id: 'product', label: 'Product Companies', desc: 'Flipkart, Razorpay, etc.', icon: '🚀' },
        { id: 'service', label: 'Service Companies', desc: 'TCS, Infosys, Wipro, etc.', icon: '🏢' },
        { id: 'startup', label: 'Startups', desc: 'Early-stage, practical focus', icon: '💡' }
    ];

    // Duration options
    const durations = [
        { value: 15, label: '15 min', desc: 'Quick practice' },
        { value: 30, label: '30 min', desc: 'Standard round' },
        { value: 45, label: '45 min', desc: 'Full interview' }
    ];

    // Tech stack options (for DSA)
    const techStacks = [
        { id: 'javascript', label: 'JavaScript', icon: '🟨' },
        { id: 'python', label: 'Python', icon: '🐍' },
        { id: 'java', label: 'Java', icon: '☕' },
        { id: 'cpp', label: 'C++', icon: '⚡' }
    ];

    const handleStart = () => {
        onStart({
            ...config,
            interviewType: selectedType,
            customRole
        });
    };

    return (
        <div className="min-h-screen bg-[#020617] relative overflow-hidden">
            {/* Background effects */}
            <div className="fixed top-[-10%] right-[-5%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="fixed bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

            <main className="container mx-auto px-6 py-12 max-w-4xl relative z-10">
                {/* Header */}
                <div className="text-center mb-12 animate-in fade-in slide-in-from-top-8 duration-700">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors font-bold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Selection
                    </button>

                    <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${currentType.color} rounded-3xl mb-6 shadow-2xl`}>
                        <TypeIcon className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        Configure Your <span className={`bg-gradient-to-r ${currentType.color} bg-clip-text text-transparent`}>Session</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        {currentType.description}
                    </p>
                </div>

                {/* Configuration Cards */}
                <div className="space-y-8">
                    {/* Difficulty Selection */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                <Zap className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">Difficulty Level</h2>
                                <p className="text-slate-500 text-sm">Choose based on your experience</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {difficulties.map((diff) => (
                                <button
                                    key={diff.id}
                                    onClick={() => setConfig(prev => ({ ...prev, difficulty: diff.id }))}
                                    className={`relative p-5 rounded-2xl border-2 transition-all duration-300 text-left group ${config.difficulty === diff.id
                                        ? `border-${diff.color}-500 bg-${diff.color}-500/10`
                                        : 'border-white/10 hover:border-white/20 bg-white/5'
                                        }`}
                                >
                                    {config.difficulty === diff.id && (
                                        <div className={`absolute -top-1 -right-1 w-4 h-4 bg-${diff.color}-500 rounded-full flex items-center justify-center`}>
                                            <Sparkles className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    )}
                                    <h3 className={`font-black text-lg mb-1 ${config.difficulty === diff.id ? `text-${diff.color}-400` : 'text-white'
                                        }`}>
                                        {diff.label}
                                    </h3>
                                    <p className="text-slate-400 text-sm">{diff.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Company Target */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">Target Company Type</h2>
                                <p className="text-slate-500 text-sm">Adjusts question style and expectations</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {companies.map((company) => (
                                <button
                                    key={company.id}
                                    onClick={() => setConfig(prev => ({ ...prev, companyTarget: company.id }))}
                                    className={`relative p-5 rounded-2xl border-2 transition-all duration-300 text-center group hover:scale-[1.02] ${config.companyTarget === company.id
                                        ? 'border-cyan-500 bg-cyan-500/10'
                                        : 'border-white/10 hover:border-white/20 bg-white/5'
                                        }`}
                                >
                                    <div className="text-3xl mb-3">{company.icon}</div>
                                    <h3 className={`font-bold text-sm mb-1 ${config.companyTarget === company.id ? 'text-cyan-400' : 'text-white'
                                        }`}>
                                        {company.label}
                                    </h3>
                                    <p className="text-slate-500 text-xs">{company.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration Selection */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">Session Duration</h2>
                                <p className="text-slate-500 text-sm">How long do you want to practice?</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 justify-center">
                            {durations.map((dur) => (
                                <button
                                    key={dur.value}
                                    onClick={() => setConfig(prev => ({ ...prev, duration: dur.value }))}
                                    className={`relative px-8 py-4 rounded-2xl border-2 transition-all duration-300 group ${config.duration === dur.value
                                        ? 'border-amber-500 bg-amber-500/10'
                                        : 'border-white/10 hover:border-white/20 bg-white/5'
                                        }`}
                                >
                                    <h3 className={`font-black text-2xl mb-1 ${config.duration === dur.value ? 'text-amber-400' : 'text-white'
                                        }`}>
                                        {dur.label}
                                    </h3>
                                    <p className="text-slate-400 text-sm">{dur.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tech Stack (DSA only) */}
                    {selectedType === 'dsa' && (
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                    <Code2 className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white">Preferred Language</h2>
                                    <p className="text-slate-500 text-sm">For coding problems</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 justify-center">
                                {techStacks.map((tech) => (
                                    <button
                                        key={tech.id}
                                        onClick={() => setConfig(prev => ({ ...prev, techStack: tech.id }))}
                                        className={`relative px-6 py-4 rounded-2xl border-2 transition-all duration-300 group ${config.techStack === tech.id
                                            ? 'border-emerald-500 bg-emerald-500/10'
                                            : 'border-white/10 hover:border-white/20 bg-white/5'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{tech.icon}</span>
                                            <span className={`font-bold ${config.techStack === tech.id ? 'text-emerald-400' : 'text-white'
                                                }`}>
                                                {tech.label}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Voice Selection */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '350ms' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center">
                                <Volume2 className="w-5 h-5 text-pink-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">Interviewer Voice</h2>
                                <p className="text-slate-500 text-sm">Select and test the AI's voice</p>
                            </div>
                        </div>

                        {availableVoices.length === 0 ? (
                            <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 text-sm">
                                <p className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Loading voices... If this takes too long, please ensure your browser supports Speech Synthesis.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {availableVoices.map((voice) => (
                                    <div
                                        key={voice.voiceURI}
                                        className={`p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group ${config.voiceURI === voice.voiceURI
                                            ? 'border-pink-500 bg-pink-500/10'
                                            : 'border-white/10 hover:border-white/20 bg-white/5'
                                            }`}
                                    >
                                        <button
                                            onClick={() => setConfig(prev => ({ ...prev, voiceURI: voice.voiceURI }))}
                                            className="flex-1 text-left mr-4"
                                        >
                                            <h3 className={`font-bold text-sm truncate ${config.voiceURI === voice.voiceURI ? 'text-pink-400' : 'text-white'}`}>
                                                {voice.name}
                                            </h3>
                                            <p className="text-slate-500 text-[10px] uppercase tracking-wider">{voice.lang}</p>
                                        </button>
                                        <button
                                            onClick={() => handleTestVoice(voice.voiceURI)}
                                            className="p-2 rounded-lg bg-pink-500/20 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink-500/40"
                                            title="Test Voice"
                                        >
                                            <Play className="w-4 h-4 fill-current" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Configuration Summary & Start Button */}
                <div className="mt-12 bg-gradient-to-br from-slate-900/80 via-slate-950/90 to-slate-900/80 rounded-[2.5rem] p-10 border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: '400ms' }}>
                    <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Difficulty</span>
                            <p className="text-white font-black capitalize">{config.difficulty}</p>
                        </div>
                        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Target</span>
                            <p className="text-white font-black uppercase">{config.companyTarget}</p>
                        </div>
                        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Duration</span>
                            <p className="text-white font-black">{config.duration} min</p>
                        </div>
                        {selectedType === 'dsa' && (
                            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Language</span>
                                <p className="text-white font-black capitalize">{config.techStack}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button
                            onClick={handleStart}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-12 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-widest rounded-[2rem] hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-[0.95] transition-all"
                        >
                            <Sparkles className="w-6 h-6" />
                            Start Interview
                            <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>

                    <p className="text-center text-slate-500 text-sm mt-6">
                        💡 Tip: The AI will adapt questions based on your responses
                    </p>
                </div>
            </main>
        </div>
    );
}
