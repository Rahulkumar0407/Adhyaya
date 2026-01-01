import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Sparkles, ChevronRight, GraduationCap, Building2, Briefcase } from 'lucide-react';

const interviewers = [
    { id: 1, name: 'Ankita Sharma', role: 'SDE-3 @ Google', rating: 4.9, sessions: 154, price: 399, image: '👩‍💼', bio: 'Expert in DSA and System Design with 6+ years of industry experience.', company: 'Google', tags: ['System Design', 'DSA'] },
    { id: 2, name: 'Rahul Verma', role: 'Senior Architect @ Amazon', rating: 4.8, sessions: 210, price: 399, image: '👨‍💼', bio: 'Specializes in scalable backend systems and high-level design patterns.', company: 'Amazon', tags: ['HLD', 'Scalability'] },
    { id: 3, name: 'Priya Patel', role: 'Staff Engineer @ Microsoft', rating: 5.0, sessions: 89, price: 399, image: '👩‍🔬', bio: 'Focuses on clean code principles and distributed systems.', company: 'Microsoft', tags: ['Backend', 'Java'] },
    { id: 4, name: 'Vikram Singh', role: 'E4 @ Meta', rating: 4.7, sessions: 312, price: 399, image: '👨‍🎨', bio: 'Product-focused SDE with a deep understanding of mobile systems.', company: 'Meta', tags: ['Mobile', 'Prod Mgmt'] },
    { id: 5, name: 'Sanya Gupta', role: 'Lead Dev @ Netflix', rating: 4.9, sessions: 124, price: 399, image: '👩‍🎤', bio: 'Expert in full-stack development and real-time data streaming.', company: 'Netflix', tags: ['React', 'Streaming'] },
    { id: 6, name: 'Arjun Reddy', role: 'Principal Engineer @ Apple', rating: 4.8, sessions: 445, price: 399, image: '👨‍🚀', bio: 'Low-level systems expert with focus on performance and security.', company: 'Apple', tags: ['C++', 'Security'] },
];

const InterviewerSelection = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0f172a] text-white py-20 px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-4">
                        <Sparkles className="w-4 h-4" />
                        Exclusive Mentorship
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-rose-100">
                        Select Your Interviewer
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                        Practice with industry veterans who have interviewed thousands for top-tier companies. Get real feedback, not just scores.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {interviewers.map((interviewer, index) => (
                        <motion.div
                            key={interviewer.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => navigate(`/interviewer/${interviewer.id}`)}
                            className="group relative bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 cursor-pointer hover:border-indigo-500/40 transition-all duration-500"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-rose-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]" />

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center text-5xl shadow-2xl group-hover:scale-110 transition-transform duration-500 border border-white/5">
                                        {interviewer.image}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                                            <Star className="w-3 h-3 text-amber-400 fill-current" />
                                            <span className="text-xs font-black text-amber-400">{interviewer.rating}</span>
                                        </div>
                                        <div className="mt-2 text-rose-400 text-[10px] font-black uppercase tracking-widest">
                                            {interviewer.sessions}+ Sessions
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-2xl font-black text-white mb-2 leading-tight group-hover:text-indigo-300 transition-colors">
                                        {interviewer.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                                        <Building2 className="w-4 h-4 text-indigo-400" />
                                        {interviewer.role}
                                    </div>
                                </div>

                                <p className="text-slate-400 text-sm mb-8 line-clamp-2 font-medium leading-relaxed">
                                    {interviewer.bio}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-8">
                                    {interviewer.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-300 border border-white/5">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <div className="text-2xl font-black text-white">
                                        ₹{interviewer.price}
                                        <span className="text-[10px] text-slate-500 font-medium ml-1">/ session</span>
                                    </div>
                                    <button className="px-6 py-3 bg-indigo-500/10 text-indigo-400 font-black uppercase tracking-widest text-[10px] rounded-xl border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                        Book Slot
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InterviewerSelection;
