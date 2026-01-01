import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Briefcase, Clock, DollarSign, Globe, Linkedin,
    Award, CheckCircle, Save, Camera, Code
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const MentorProfileSettings = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        headline: 'New Mentor',
        bio: '',
        currentCompany: '',
        currentRole: '',
        yearsOfExperience: 0,
        expertise: [],
        ratePerMinute: 5,
        linkedinUrl: '',
        portfolioUrl: '',
        upiId: ''
    });

    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        fetchMentorProfile();
    }, []);

    const fetchMentorProfile = async () => {
        try {
            const response = await api.get('/mentors/me');

            if (response.data.success) {
                const mentor = response.data.data;
                setFormData(prev => ({
                    ...prev,
                    headline: mentor.headline || '',
                    bio: mentor.bio || '',
                    currentCompany: mentor.currentCompany || '',
                    currentRole: mentor.currentRole || '',
                    yearsOfExperience: mentor.yearsOfExperience || 0,
                    expertise: mentor.expertise || [],
                    ratePerMinute: mentor.ratePerMinute || 0,
                    linkedinUrl: mentor.verificationDocs?.linkedinUrl || '',
                    upiId: mentor.paymentDetails?.upiId || ''
                }));
            }
        } catch (error) {
            // If 404, profile doesn't exist yet - allow creating new
            if (error.response && error.response.status === 404) {
                console.log('No existing profile found. Initializing with defaults.');
            } else {
                console.error('Error fetching profile:', error);
                toast.error('Could not load profile data');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const addSkill = () => {
        if (newSkill && !formData.expertise.includes(newSkill)) {
            setFormData(prev => ({
                ...prev,
                expertise: [...prev.expertise, newSkill]
            }));
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            expertise: prev.expertise.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.patch('/mentors/profile', formData);
            toast.success('Profile updated successfully!');
            // Update local user context if needed
        } catch (error) {
            console.error('Error updating profile:', error.response?.data || error);
            toast.error(error.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-[#020617] py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <header className="mb-10 text-center">
                    <h1 className="text-3xl font-black text-white mb-2">Mentor Profile Settings</h1>
                    <p className="text-slate-400">Manage how you appear to students and your availability.</p>
                </header>

                <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
                    {/* Left Column: Avatar & Basic Info */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/10 text-center">
                            <div className="relative w-32 h-32 mx-auto mb-4">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 p-1">
                                    <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center">
                                        <img
                                            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <button type="button" className="absolute bottom-0 right-0 p-2 bg-slate-800 rounded-full border border-slate-700 text-cyan-400 hover:text-white transition-colors">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="text-white font-bold text-lg">{user?.name}</h3>
                            <p className="text-slate-500 text-sm mb-4">Mentor ID: {user?._id?.slice(-6).toUpperCase()}</p>

                            <div className="flex justify-center gap-2">
                                <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Verified
                                </div>
                            </div>
                        </div>

                        {/* Pricing Card */}
                        <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/10">
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-400" />
                                Pricing
                            </h4>
                            <div>
                                <label className="block text-slate-400 text-xs font-bold mb-2 uppercase">Rate per Minute (₹)</label>
                                <input
                                    type="number"
                                    name="ratePerMinute"
                                    value={formData.ratePerMinute}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white font-bold"
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    We charge a 10% platform fee. You will receive ₹{formData.ratePerMinute * 0.9}/min.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Professional Info */}
                        <div className="bg-slate-900/60 p-8 rounded-2xl border border-white/10">
                            <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-violet-400" />
                                Professional Details
                            </h4>

                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-slate-400 text-sm font-bold mb-2">Current Role</label>
                                    <input
                                        type="text"
                                        name="currentRole"
                                        value={formData.currentRole}
                                        onChange={handleChange}
                                        placeholder="e.g. Senior Software Engineer"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-violet-500 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm font-bold mb-2">Company</label>
                                    <input
                                        type="text"
                                        name="currentCompany"
                                        value={formData.currentCompany}
                                        onChange={handleChange}
                                        placeholder="e.g. Google"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-violet-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-slate-400 text-sm font-bold mb-2">Headline</label>
                                <input
                                    type="text"
                                    name="headline"
                                    value={formData.headline}
                                    onChange={handleChange}
                                    placeholder="Brief intro, e.g. Ex-Amazon | System Design Expert"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-violet-500 outline-none transition-colors"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-slate-400 text-sm font-bold mb-2">About Me</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Tell students about your journey and how you can help them..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-violet-500 outline-none transition-colors resize-none"
                                ></textarea>
                            </div>
                        </div>

                        {/* Expertise & Skills */}
                        <div className="bg-slate-900/60 p-8 rounded-2xl border border-white/10">
                            <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Code className="w-5 h-5 text-cyan-400" />
                                Expertise & Skills
                            </h4>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {formData.expertise.map((skill, index) => (
                                    <span key={index} className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm font-bold flex items-center gap-2">
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => removeSkill(skill)}
                                            className="hover:text-white"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    placeholder="Add a skill (e.g. React, Java)..."
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition-colors"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                />
                                <button
                                    type="button"
                                    onClick={addSkill}
                                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="bg-slate-900/60 p-8 rounded-2xl border border-white/10">
                            <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Wallet className="w-5 h-4 text-emerald-400" />
                                Payout Details
                            </h4>
                            <div>
                                <label className="block text-slate-400 text-sm font-bold mb-2">UPI ID</label>
                                <input
                                    type="text"
                                    name="upiId"
                                    value={formData.upiId}
                                    onChange={handleChange}
                                    placeholder="username@bank"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                                />
                                <p className="text-xs text-slate-500 mt-2">Earnings will be transferred to this UPI ID weekly.</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                type="button"
                                className="px-6 py-3 text-slate-400 hover:text-white font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {saving ? 'Saving...' : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
// Add Wallet icon locally or import
import { Wallet } from 'lucide-react';

export default MentorProfileSettings;
