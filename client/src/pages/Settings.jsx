import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, Camera, Save, User, Mail, Phone, MapPin,
    Building2, GraduationCap, Linkedin, Github, Globe, Calendar
} from 'lucide-react';

export default function Settings() {
    const { user, token } = useAuth();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        location: '',
        college: '',
        graduationYear: '',
        course: '',
        linkedinUrl: '',
        githubUrl: '',
        portfolioUrl: '',
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const profile = data.data;
                setFormData({
                    name: profile.name || '',
                    email: profile.email || '',
                    phone: profile.phone || '',
                    bio: profile.bio || '',
                    location: profile.location || '',
                    college: profile.college || '',
                    graduationYear: profile.graduationYear || '',
                    course: profile.course || '',
                    linkedinUrl: profile.socialLinks?.linkedin || '',
                    githubUrl: profile.socialLinks?.github || '',
                    portfolioUrl: profile.socialLinks?.portfolio || '',
                });
                if (profile.avatar) {
                    setAvatarPreview(profile.avatar);
                }
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            setMessage({ type: 'error', text: 'Profile load karne mein dikkat hui!' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'Photo 5MB se chhota hona chahiye!' });
                return;
            }
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            // Upload avatar first if changed
            let avatarUrl = null;
            if (avatarFile) {
                const formDataUpload = new FormData();
                formDataUpload.append('avatar', avatarFile);

                const uploadRes = await fetch(`${API_URL}/profile/avatar`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formDataUpload
                });
                const uploadData = await uploadRes.json();
                if (uploadData.success) {
                    avatarUrl = uploadData.data.avatar;
                }
            }

            // Update profile
            const updateData = {
                name: formData.name,
                phone: formData.phone,
                bio: formData.bio,
                location: formData.location,
                college: formData.college,
                graduationYear: formData.graduationYear,
                course: formData.course,
                socialLinks: {
                    linkedin: formData.linkedinUrl,
                    github: formData.githubUrl,
                    portfolio: formData.portfolioUrl,
                },
            };

            if (avatarUrl) {
                updateData.avatar = avatarUrl;
            }

            const res = await fetch(`${API_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Profile update ho gaya! 🎉' });
                setAvatarFile(null);
            } else {
                setMessage({ type: 'error', text: data.message || 'Update mein dikkat hui!' });
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            setMessage({ type: 'error', text: 'Server se baat nahi ho payi!' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            {/* Header */}
            <header className="bg-[#0a0a0a] border-b border-gray-800 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Link to="/profile" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-white">Edit Profile</h1>
                        <p className="text-xs text-gray-500">Apni details update karo</p>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-3xl">
                {/* Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl ${message.type === 'success'
                            ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                            : 'bg-red-500/20 border border-red-500/30 text-red-400'
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Profile Photo Section */}
                    <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Camera className="w-5 h-5 text-orange-500" />
                            Profile Photo
                        </h2>
                        <div className="flex items-center gap-6">
                            <div
                                onClick={handleAvatarClick}
                                className="relative w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-500 p-1 cursor-pointer group"
                            >
                                <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-white">
                                            {formData.name?.charAt(0) || 'B'}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    onClick={handleAvatarClick}
                                    className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    Photo Badlo
                                </button>
                                <p className="text-xs text-gray-500 mt-2">JPG, PNG. Max 5MB.</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-orange-500" />
                            Basic Info
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Apna naam likho"
                                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+91 9876543210"
                                        className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="City, State"
                                        className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm text-gray-400 mb-2">Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Apne baare mein kuch batao... (max 200 characters)"
                                maxLength={200}
                                rows={3}
                                className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/200</p>
                        </div>
                    </div>

                    {/* Education */}
                    <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-orange-500" />
                            Education
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm text-gray-400 mb-2">College/University</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        name="college"
                                        value={formData.college}
                                        onChange={handleChange}
                                        placeholder="IIT Patna, NIT Jamshedpur, etc."
                                        className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Course/Branch</label>
                                <input
                                    type="text"
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    placeholder="B.Tech CSE, BCA, etc."
                                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Graduation Year</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <select
                                        name="graduationYear"
                                        value={formData.graduationYear}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none"
                                    >
                                        <option value="">Select Year</option>
                                        {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-orange-500" />
                            Social Links
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">LinkedIn</label>
                                <div className="relative">
                                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                                    <input
                                        type="url"
                                        name="linkedinUrl"
                                        value={formData.linkedinUrl}
                                        onChange={handleChange}
                                        placeholder="https://linkedin.com/in/username"
                                        className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">GitHub</label>
                                <div className="relative">
                                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="url"
                                        name="githubUrl"
                                        value={formData.githubUrl}
                                        onChange={handleChange}
                                        placeholder="https://github.com/username"
                                        className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Portfolio Website</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                                    <input
                                        type="url"
                                        name="portfolioUrl"
                                        value={formData.portfolioUrl}
                                        onChange={handleChange}
                                        placeholder="https://yourwebsite.com"
                                        className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-4">
                        <Link
                            to="/profile"
                            className="px-6 py-3 bg-[#2a2a2a] text-gray-300 font-medium rounded-xl border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
