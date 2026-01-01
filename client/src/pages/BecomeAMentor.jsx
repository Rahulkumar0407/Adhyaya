import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    Users, Clock, Wallet, Star, CheckCircle, ArrowRight,
    Briefcase, GraduationCap, IndianRupee, Calendar,
    BadgeCheck, TrendingUp, Heart, Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Benefit Card Component
const BenefitCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
        <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-orange-600" />
        </div>
        <h3 className="font-bold text-lg text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </motion.div>
);

// Step Component
const Step = ({ number, title, description }) => (
    <div className="flex gap-4">
        <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                {number}
            </div>
        </div>
        <div>
            <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
            <p className="text-gray-600 text-sm">{description}</p>
        </div>
    </div>
);

// Expertise options
const EXPERTISE_OPTIONS = [
    'DSA', 'System Design', 'Backend', 'Frontend',
    'React', 'Node.js', 'Python', 'Java', 'C++',
    'DBMS', 'OS', 'Computer Networks', 'OOPS',
    'Machine Learning', 'Data Science', 'DevOps',
    'Interview Prep', 'Resume Review', 'Career Guidance'
];

const BecomeAMentor = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        headline: '',
        bio: '',
        expertise: [],
        yearsOfExperience: '',
        currentCompany: '',
        currentRole: '',
        linkedinUrl: '',
        ratePerMinute: ''
    });

    const handleExpertiseToggle = (exp) => {
        setFormData(prev => ({
            ...prev,
            expertise: prev.expertise.includes(exp)
                ? prev.expertise.filter(e => e !== exp)
                : [...prev.expertise, exp]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            navigate('/login?redirect=/become-mentor');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/mentors/apply', formData);
            if (response.data.success) {
                setSuccess(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting application');
        } finally {
            setLoading(false);
        }
    };

    const isStep1Valid = formData.headline && formData.expertise.length > 0 && formData.yearsOfExperience;
    const isStep2Valid = formData.bio && formData.currentRole && formData.linkedinUrl;
    const isStep3Valid = formData.ratePerMinute >= 1 && formData.ratePerMinute <= 100;

    if (success) {
        return (
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f0a06 0%, #1a1008 50%, #0f0a06 100%)' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-orange-950/40 to-transparent backdrop-blur rounded-3xl shadow-xl border border-orange-800/30 p-8 max-w-md text-center"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
                    <p className="text-orange-100/70 mb-6">
                        Thank you for applying to become a mentor. We'll review your application and get back to you within 48 hours.
                    </p>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                    >
                        Go to Dashboard
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0a06 0%, #1a1008 50%, #0f0a06 100%)' }}>
            {/* Hero Section */}
            <section className="relative py-20 px-4 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-orange-600/15 to-amber-600/15 rounded-full blur-3xl" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-950/60 backdrop-blur border border-orange-800/30 rounded-full mb-6">
                            <Sparkles className="w-4 h-4 text-orange-400" />
                            <span className="text-orange-100/80 font-medium text-sm">Join the Top 1% of Mentors</span>
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                            Share Your Knowledge,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
                                Fund Your Next Gadget 📱
                            </span>
                        </h1>

                        <p className="text-xl text-orange-100/70 mb-8 max-w-2xl mx-auto">
                            Turn your free time into an extra income stream.
                            <span className="block mt-2 font-medium text-orange-400">Don't let your weekends go to waste.</span>
                        </p>

                        <div className="flex flex-wrap justify-center gap-6 text-left">
                            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-md">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <IndianRupee className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">₹3-15k/month</div>
                                    <div className="text-gray-500 text-sm">Avg. earnings</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-md">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">Flexible</div>
                                    <div className="text-gray-500 text-sm">Your schedule</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-md">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <Star className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">Weekly</div>
                                    <div className="text-gray-500 text-sm">Payouts</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 px-4 bg-gradient-to-b from-transparent to-orange-950/20">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-white mb-4">Why Mentor on BPL?</h2>
                        <p className="text-orange-100/60 max-w-2xl mx-auto">
                            We've built the best platform for mentors to share knowledge and earn
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <BenefitCard
                            icon={Wallet}
                            title="Set Your Rate"
                            description="You decide your per-minute rate (₹1-100/min). Higher skills = higher earnings."
                            delay={0}
                        />
                        <BenefitCard
                            icon={Calendar}
                            title="Flexible Hours"
                            description="Go online whenever you're free. Accept calls when it suits you."
                            delay={0.1}
                        />
                        <BenefitCard
                            icon={TrendingUp}
                            title="Grow Your Profile"
                            description="Build your reputation with student reviews. Get featured on our platform."
                            delay={0.2}
                        />
                        <BenefitCard
                            icon={Heart}
                            title="Make an Impact"
                            description="Help students land their dream jobs. Your guidance changes careers."
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 px-4 bg-gradient-to-b from-orange-950/20 to-transparent">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
                    </motion.div>

                    <div className="space-y-6">
                        <Step
                            number={1}
                            title="Apply with your profile"
                            description="Fill out the form below with your expertise and experience. It takes 5 minutes."
                        />
                        <Step
                            number={2}
                            title="Get verified"
                            description="Our team reviews applications within 48 hours. We verify via LinkedIn."
                        />
                        <Step
                            number={3}
                            title="Set up your profile"
                            description="Add your bio, set your rate, and configure your availability slots."
                        />
                        <Step
                            number={4}
                            title="Start earning"
                            description="Go online and receive calls from students. Earn for every minute you mentor."
                        />
                    </div>
                </div>
            </section>

            {/* Application Form */}
            <section className="py-16 px-4 bg-gradient-to-b from-transparent to-orange-950/20" id="apply">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-8"
                    >
                        <h2 className="text-3xl font-bold text-white mb-4">Apply Now</h2>
                        <p className="text-orange-100/60">Fill out the form to start your mentor journey</p>
                    </motion.div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${step >= s
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-200 text-gray-500'
                                        }`}
                                >
                                    {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                                </div>
                                {s < 3 && (
                                    <div className={`w-16 h-1 mx-2 rounded ${step > s ? 'bg-orange-500' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-6 lg:p-8">
                        {/* Step 1: Basic Info */}
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h3 className="text-xl font-bold text-white mb-4">Basic Information</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Professional Headline *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.headline}
                                        onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                                        placeholder="e.g., SDE @ Google | DSA Expert"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        maxLength={100}
                                    />
                                    <p className="text-gray-400 text-sm mt-1">{formData.headline.length}/100 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Years of Experience *
                                    </label>
                                    <select
                                        value={formData.yearsOfExperience}
                                        onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="">Select experience</option>
                                        <option value="1">1+ years</option>
                                        <option value="2">2+ years</option>
                                        <option value="3">3+ years</option>
                                        <option value="5">5+ years</option>
                                        <option value="7">7+ years</option>
                                        <option value="10">10+ years</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Areas of Expertise * (select up to 6)
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {EXPERTISE_OPTIONS.map((exp) => (
                                            <button
                                                key={exp}
                                                type="button"
                                                onClick={() => handleExpertiseToggle(exp)}
                                                disabled={formData.expertise.length >= 6 && !formData.expertise.includes(exp)}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.expertise.includes(exp)
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300 disabled:opacity-50'
                                                    }`}
                                            >
                                                {exp}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-gray-400 text-sm mt-2">{formData.expertise.length}/6 selected</p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    disabled={!isStep1Valid}
                                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue
                                </button>
                            </motion.div>
                        )}

                        {/* Step 2: Experience */}
                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h3 className="text-xl font-bold text-white mb-4">Your Experience</h3>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Company
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.currentCompany}
                                            onChange={(e) => setFormData(prev => ({ ...prev, currentCompany: e.target.value }))}
                                            placeholder="e.g., Google"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Role *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.currentRole}
                                            onChange={(e) => setFormData(prev => ({ ...prev, currentRole: e.target.value }))}
                                            placeholder="e.g., Software Engineer"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bio / About You *
                                    </label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                        placeholder="Tell students about your experience, teaching style, and what they can learn from you..."
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                        maxLength={1000}
                                    />
                                    <p className="text-gray-400 text-sm mt-1">{formData.bio.length}/1000 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        LinkedIn Profile URL *
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.linkedinUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                                        placeholder="https://linkedin.com/in/yourprofile"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                    <p className="text-gray-400 text-sm mt-1">Used for verification purposes</p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        disabled={!isStep2Valid}
                                        className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Pricing */}
                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h3 className="text-xl font-bold text-white mb-4">Set Your Rate</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rate per minute (₹) *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                                        <input
                                            type="number"
                                            value={formData.ratePerMinute}
                                            onChange={(e) => setFormData(prev => ({ ...prev, ratePerMinute: parseInt(e.target.value) || '' }))}
                                            placeholder="5"
                                            min={1}
                                            max={100}
                                            className="w-full pl-8 pr-16 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-2xl font-bold"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">/min</span>
                                    </div>
                                    <p className="text-gray-400 text-sm mt-1">Range: ₹1 - ₹100 per minute</p>
                                </div>

                                {formData.ratePerMinute && (
                                    <div className="bg-orange-100 rounded-xl p-4">
                                        <h4 className="font-semibold text-white mb-3">Estimated Earnings</h4>
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div>
                                                <div className="text-2xl font-bold text-orange-600">
                                                    ₹{formData.ratePerMinute * 30}
                                                </div>
                                                <div className="text-gray-500 text-sm">30 min call</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-orange-600">
                                                    ₹{formData.ratePerMinute * 60 * 2}
                                                </div>
                                                <div className="text-gray-500 text-sm">2 hrs/day</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-orange-600">
                                                    ₹{(formData.ratePerMinute * 60 * 2 * 20 * 0.8).toLocaleString()}
                                                </div>
                                                <div className="text-gray-500 text-sm">Monthly*</div>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-xs mt-3 text-center">
                                            *Based on 2 hrs/day, 20 days/month. 20% platform fee applied.
                                        </p>
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!isStep3Valid || loading}
                                        className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Submit Application
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </form>

                    {/* Login prompt */}
                    {!user && (
                        <p className="text-center text-gray-500 mt-4">
                            Already have an account?{' '}
                            <Link to="/login" className="text-orange-400 hover:text-orange-300 hover:underline font-medium transition-colors">
                                Log in
                            </Link>{' '}
                            to apply faster.
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default BecomeAMentor;
