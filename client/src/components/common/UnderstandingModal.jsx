import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const UnderstandingModal = ({ isOpen, onClose, onSubmit, topic }) => {
    const [selected, setSelected] = useState(null);
    const [notes, setNotes] = useState('');

    const levels = [
        { id: 'confused', emoji: '😕', label: 'Confused', desc: 'Need more practice', color: 'bg-red-500/20 border-red-500/50' },
        { id: 'partial', emoji: '🙂', label: 'Partially Clear', desc: 'Some doubts remain', color: 'bg-orange-500/20 border-orange-500/50' },
        { id: 'clear', emoji: '😄', label: 'Mostly Clear', desc: 'Good understanding', color: 'bg-emerald-500/20 border-emerald-500/50' },
        { id: 'crystal', emoji: '🚀', label: 'Crystal Clear', desc: 'Fully confident', color: 'bg-cyan-500/20 border-cyan-500/50' }
    ];

    const handleSubmit = () => {
        if (selected) {
            onSubmit({ understandingLevel: selected, notes });
            setSelected(null);
            setNotes('');
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-slate-900 rounded-3xl p-8 max-w-lg w-full border border-white/10"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-black text-white">How well did you understand?</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {topic && (
                    <p className="text-slate-400 mb-6">{topic.title || topic.topicTitle}</p>
                )}

                <div className="grid grid-cols-2 gap-3 mb-6">
                    {levels.map(level => (
                        <button
                            key={level.id}
                            onClick={() => setSelected(level.id)}
                            className={`p-4 rounded-xl border-2 transition-all ${selected === level.id
                                ? level.color + ' scale-105'
                                : 'bg-slate-800/50 border-transparent hover:border-white/20'
                                }`}
                        >
                            <div className="text-3xl mb-2">{level.emoji}</div>
                            <div className="font-bold text-white text-sm">{level.label}</div>
                            <div className="text-slate-500 text-xs">{level.desc}</div>
                        </button>
                    ))}
                </div>

                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any notes? (optional)"
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 resize-none h-20 focus:outline-none focus:border-cyan-500/50"
                />

                <button
                    onClick={handleSubmit}
                    disabled={!selected}
                    className={`w-full mt-4 py-4 rounded-xl font-bold text-white transition-all ${selected
                        ? 'bg-gradient-to-r from-cyan-500 to-violet-500 hover:shadow-lg'
                        : 'bg-slate-700 cursor-not-allowed'
                        }`}
                >
                    Submit & Generate Revisions
                </button>
            </motion.div>
        </motion.div>
    );
};

export default UnderstandingModal;
