import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar as CalendarIcon, Clock, ShieldCheck,
    CreditCard, ArrowLeft, Star, Building2,
    Award, Zap, CheckCircle2, ChevronRight, AlertCircle, Wallet
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const interviewers = [
    { id: 1, name: 'Ankita Sharma', role: 'SDE-3 @ Google', rating: 4.9, sessions: 154, price: 399, image: '👩‍💼', bio: 'Expert in DSA and System Design with 6+ years of industry experience. I focus on core problem-solving intuition and backend scalability.', company: 'Google', experience: '6+ Years', expertise: ['DSA', 'System Design', 'Scalability'], education: 'B.Tech IT, NIT Allahabad' },
    { id: 2, name: 'Rahul Verma', role: 'Senior Architect @ Amazon', rating: 4.8, sessions: 210, price: 399, image: '👨‍💼', bio: 'Specializes in scalable backend systems and high-level design patterns. Helping students crack senior roles.', company: 'Amazon', experience: '8+ Years', expertise: ['HLD', 'Scalability', 'K8s'], education: 'M.Tech CSE, IIT Delhi' },
    { id: 3, name: 'Priya Patel', role: 'Staff Engineer @ Microsoft', rating: 5.0, sessions: 89, price: 399, image: '👩‍🔬', bio: 'Focuses on clean code principles and distributed systems. Expert in Java/Spring ecosystem.', company: 'Microsoft', experience: '5+ Years', expertise: ['Backend', 'Java', 'Clean Code'], education: 'B.Tech CS, BITS Pilani' },
    { id: 4, name: 'Vikram Singh', role: 'E4 @ Meta', rating: 4.7, sessions: 312, price: 399, image: '👨‍🎨', bio: 'Product-focused SDE with a deep understanding of mobile systems and React Native.', company: 'Meta', experience: '4+ Years', expertise: ['Mobile', 'React', 'RN'], education: 'B.E CS, NSIT' },
    { id: 5, name: 'Sanya Gupta', role: 'Lead Dev @ Netflix', rating: 4.9, sessions: 124, price: 399, image: '👩‍🎤', bio: 'Expert in full-stack development and real-time data streaming. High performance web apps.', company: 'Netflix', experience: '7+ Years', expertise: ['Fullstack', 'NodeJS', 'Kafka'], education: 'B.Tech IT, DTU' },
    { id: 6, name: 'Arjun Reddy', role: 'Principal Engineer @ Apple', rating: 4.8, sessions: 445, price: 399, image: '👨‍🚀', bio: 'Low-level systems expert with focus on performance, security and compilers.', company: 'Apple', experience: '10+ Years', expertise: ['C++', 'Rust', 'OS'], education: 'PhD CS, IISc Bangalore' },
];

const InterviewerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const interviewer = interviewers.find(i => i.id === parseInt(id)) || interviewers[0];

    const [step, setStep] = useState(1); // 1: Details, 2: Schedule, 3: Payment
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [isLoadingWallet, setIsLoadingWallet] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const dates = [
        { day: 'Mon', date: '15 Jan' },
        { day: 'Tue', date: '16 Jan' },
        { day: 'Wed', date: '17 Jan' },
        { day: 'Thu', date: '18 Jan' },
    ];

    const slots = [
        '10:00 AM', '11:30 AM', '02:00 PM',
        '04:30 PM', '06:00 PM', '08:30 PM'
    ];

    const [isBooked, setIsBooked] = useState(false);

    // Fetch wallet balance on mount
    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const response = await api.get('/wallet');
                if (response.data.success) {
                    setWalletBalance(response.data.data.balance || 0);
                }
            } catch (error) {
                console.error('Failed to fetch wallet:', error);
                setWalletBalance(0);
            } finally {
                setIsLoadingWallet(false);
            }
        };
        fetchWallet();
    }, []);

    const balance = parseFloat(walletBalance) || 0;
    const price = parseFloat(interviewer.price) || 0;
    const hasInsufficientBalance = balance < price;

    const handleNextStep = async () => {
        if (step === 1) setStep(2);
        else if (step === 2 && selectedDate && selectedSlot) setStep(3);
        else if (step === 3) {
            // Check wallet balance before booking
            if (hasInsufficientBalance) {
                toast.error(`Insufficient balance! You need ₹${interviewer.price} but have ₹${walletBalance}. Please top up your wallet.`);
                return;
            }

            setIsProcessing(true);
            try {
                // Debit wallet for the booking
                const debitResponse = await api.post('/wallet/debit', {
                    amount: interviewer.price,
                    type: 'interview_booking',
                    description: `Interview session with ${interviewer.name}`,
                    metadata: {
                        interviewerId: interviewer.id,
                        interviewerName: interviewer.name,
                        date: dates[selectedDate]?.date,
                        slot: slots[selectedSlot]
                    }
                });

                if (debitResponse.data.success) {
                    toast.success('Payment successful! Booking confirmed.');
                    setIsBooked(true);
                } else {
                    toast.error(debitResponse.data.message || 'Payment failed. Please try again.');
                }
            } catch (error) {
                console.error('Booking payment failed:', error);
                toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    if (isBooked) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] p-12 border border-white/5 text-center"
                >
                    <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/30">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                    </div>
                    <h2 className="text-4xl font-black mb-4">Booking Confirmed!</h2>
                    <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                        Your session with {interviewer.name} is scheduled. You will receive a calendar invite shortly.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-6 bg-white text-indigo-950 font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-105 transition-all"
                    >
                        Go to Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white py-12 px-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Back Link */}
                <button
                    onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold uppercase tracking-widest text-xs">Back to Experts</span>
                </button>

                {/* Progress Bar */}
                <div className="flex items-center gap-4 mb-12 max-w-md mx-auto">
                    {[1, 2, 3].map(i => (
                        <React.Fragment key={i}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all duration-500 ${step >= i ? 'bg-indigo-500 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'bg-slate-900 border-white/10 text-slate-500'}`}>
                                {i}
                            </div>
                            {i < 3 && <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step > i ? 'bg-indigo-500' : 'bg-slate-800'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid lg:grid-cols-2 gap-12"
                        >
                            {/* Left: Bio & Stats */}
                            <div className="space-y-8">
                                <div className="p-10 bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] border border-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Award className="w-32 h-32" />
                                    </div>
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="w-32 h-32 bg-slate-800 rounded-[2rem] flex items-center justify-center text-6xl shadow-inner border border-white/5">
                                            {interviewer.image}
                                        </div>
                                        <div>
                                            <h1 className="text-4xl font-black mb-2 tracking-tight">{interviewer.name}</h1>
                                            <div className="flex items-center gap-2 text-indigo-400 font-bold">
                                                <Building2 className="w-5 h-5" />
                                                {interviewer.role}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Experience</p>
                                            <p className="text-lg font-bold">{interviewer.experience}</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Rating</p>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-amber-400 fill-current" />
                                                <p className="text-lg font-bold">{interviewer.rating}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-slate-400 leading-relaxed font-medium">
                                        {interviewer.bio}
                                    </p>
                                </div>

                                <div className="p-8 bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/5">
                                    <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                        <Zap className="w-6 h-6 text-rose-500" />
                                        Expertise Area
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {interviewer.expertise.map(tag => (
                                            <div key={tag} className="px-6 py-3 bg-indigo-500/10 text-indigo-300 rounded-2xl font-black text-xs uppercase tracking-widest border border-indigo-500/20">
                                                {tag}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Summary & Action */}
                            <div className="lg:pt-12">
                                <div className="sticky top-12 p-10 bg-gradient-to-br from-indigo-600/20 to-rose-600/20 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-3xl text-center">
                                    <p className="text-indigo-300 font-black uppercase tracking-[0.3em] text-xs mb-4">Investment for Journey</p>
                                    <div className="text-7xl font-black text-white mb-8 tracking-tighter">
                                        ₹{interviewer.price}
                                    </div>

                                    <ul className="text-left space-y-4 mb-10 text-slate-300 font-medium">
                                        <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> 1-on-1 LIVE Mock Interview</li>
                                        <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Professional Feedback Report</li>
                                        <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Q&A on Career Guidance</li>
                                        <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Company-Specific Tips</li>
                                    </ul>

                                    <button
                                        onClick={handleNextStep}
                                        className="w-full py-6 bg-white text-indigo-950 font-black uppercase tracking-[0.2em] text-sm rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-[0_10px_40px_rgba(255,255,255,0.25)]"
                                    >
                                        Book Slot
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] p-12 border border-white/5">
                                <h2 className="text-4xl font-black text-center mb-12">Select Day & Time</h2>

                                <div className="mb-12">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 text-center">Available Dates</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {dates.map((d, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedDate(i)}
                                                className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-2 ${selectedDate === i ? 'bg-indigo-500 border-indigo-400' : 'bg-slate-800/50 border-white/5 hover:border-white/20'}`}
                                            >
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${selectedDate === i ? 'text-indigo-100' : 'text-slate-500'}`}>{d.day}</span>
                                                <span className="text-xl font-black">{d.date}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-12">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 text-center">Available Slots</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {slots.map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedSlot(i)}
                                                className={`py-4 rounded-2xl border shadow-lg font-black text-xs transition-all ${selectedSlot === i ? 'bg-rose-500 border-rose-400 text-white' : 'bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/20'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    disabled={selectedDate === null || selectedSlot === null}
                                    onClick={handleNextStep}
                                    className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm transition-all shadow-2xl ${selectedDate !== null && selectedSlot !== null ? 'bg-white text-indigo-950 hover:scale-[1.02]' : 'bg-slate-800 text-slate-600 disabled:cursor-not-allowed'}`}
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-xl mx-auto"
                        >
                            <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] p-12 border border-white/5">
                                <div className="text-center mb-10">
                                    <div className="w-20 h-20 bg-emerald-500/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                                        <CreditCard className="w-10 h-10 text-emerald-400" />
                                    </div>
                                    <h2 className="text-3xl font-black mb-2">Final Checkout</h2>
                                    <p className="text-slate-400 font-medium">Session with {interviewer.name}</p>
                                </div>

                                <div className="space-y-4 mb-10">
                                    {/* Wallet Balance Display */}
                                    <div className={`flex justify-between items-center p-4 rounded-2xl border ${hasInsufficientBalance ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                                        <div className="flex items-center gap-2">
                                            <Wallet className={`w-5 h-5 ${hasInsufficientBalance ? 'text-red-400' : 'text-emerald-400'}`} />
                                            <span className={`font-bold ${hasInsufficientBalance ? 'text-red-400' : 'text-emerald-400'}`}>Wallet Balance</span>
                                        </div>
                                        <span className={`font-black ${hasInsufficientBalance ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {isLoadingWallet ? '...' : `₹${walletBalance}`}
                                        </span>
                                    </div>

                                    {hasInsufficientBalance && (
                                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                                            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                            <span className="text-red-400 text-sm">
                                                Insufficient balance. You need ₹{interviewer.price - walletBalance} more.
                                                <button
                                                    onClick={() => navigate('/wallet')}
                                                    className="underline ml-1 hover:text-red-300"
                                                >
                                                    Top up now
                                                </button>
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-slate-500 font-bold">Session Fee</span>
                                        <span className="font-black">₹{interviewer.price}</span>
                                    </div>
                                    <div className="h-px bg-white/10 my-2" />
                                    <div className="flex justify-between items-center p-4">
                                        <span className="text-xl font-black">Total Amount</span>
                                        <span className="text-3xl font-black text-rose-400">₹{interviewer.price}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={handleNextStep}
                                        disabled={isProcessing || hasInsufficientBalance}
                                        className={`w-full py-6 font-black uppercase tracking-[0.2em] text-sm rounded-[2rem] transition-all ${hasInsufficientBalance
                                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                            : isProcessing
                                                ? 'bg-emerald-600 text-white cursor-wait'
                                                : 'bg-emerald-500 text-white hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]'
                                            }`}
                                    >
                                        {isProcessing ? 'Processing...' : hasInsufficientBalance ? 'Insufficient Balance' : 'Pay & Confirm'}
                                    </button>
                                    <div className="flex justify-center gap-4 py-4 opacity-50">
                                        <ShieldCheck className="w-5 h-5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Secure Wallet Payment</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default InterviewerDetail;
