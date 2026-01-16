import { useState, useEffect, useRef } from 'react';
import UserProfileDropdown from '../components/common/UserProfileDropdown';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import {
    ArrowLeft, Camera, Save, User, Mail, Phone, MapPin,
    Building2, GraduationCap, Linkedin, Github, Globe, Calendar,
    Sparkles, Rocket, Star, Zap, Heart, Home, Bell, Trophy, Crown
} from 'lucide-react';

// Animated 3D Background - Same as Profile
function AnimatedBackground() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // Create floating geometric shapes
        const shapes = [];
        const geometries = [
            new THREE.IcosahedronGeometry(1, 0),
            new THREE.OctahedronGeometry(1, 0),
            new THREE.TetrahedronGeometry(1, 0),
        ];

        const colors = [0xf97316, 0xfbbf24, 0xef4444, 0x8b5cf6];

        for (let i = 0; i < 15; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = new THREE.MeshBasicMaterial({
                color: colors[i % colors.length],
                wireframe: true,
                transparent: true,
                opacity: 0.1 + Math.random() * 0.1,
            });
            const mesh = new THREE.Mesh(geometry, material);

            const side = i % 2 === 0 ? -1 : 1;
            mesh.position.x = side * (20 + Math.random() * 25);
            mesh.position.y = (Math.random() - 0.5) * 40;
            mesh.position.z = (Math.random() - 0.5) * 20 - 10;

            const scale = Math.random() * 2 + 0.5;
            mesh.scale.set(scale, scale, scale);

            mesh.userData = {
                rotationSpeed: { x: (Math.random() - 0.5) * 0.01, y: (Math.random() - 0.5) * 0.01 },
                floatSpeed: Math.random() * 0.3 + 0.1,
                floatOffset: Math.random() * Math.PI * 2,
            };

            shapes.push(mesh);
            scene.add(mesh);
        }

        let animationId;
        const clock = new THREE.Clock();

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            shapes.forEach((shape) => {
                shape.rotation.x += shape.userData.rotationSpeed.x;
                shape.rotation.y += shape.userData.rotationSpeed.y;
                shape.position.y += Math.sin(elapsedTime * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.01;
            });

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            if (containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return <div ref={containerRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
}

// Nav items
const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Rewards', href: '/how-to-earn', icon: Trophy },
];

export default function Settings() {
    const { user, token } = useAuth();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [activeSection, setActiveSection] = useState('photo');

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
        revisionMode: 'manual'
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
                    revisionMode: profile.revisionMode || 'manual'
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
                revisionMode: formData.revisionMode,
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

    const sections = [
        { id: 'photo', label: 'Photo', icon: Camera, emoji: '📸' },
        { id: 'basic', label: 'Basic', icon: User, emoji: '👤' },
        { id: 'education', label: 'Education', icon: GraduationCap, emoji: '🎓' },
        { id: 'social', label: 'Social', icon: Globe, emoji: '🔗' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f0a06 0%, #1a1008 50%, #0f0a06 100%)' }}>
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-orange-500/30 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">☕</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0a06 0%, #1a1008 50%, #0f0a06 100%)' }}>
            <AnimatedBackground />

            {/* Ambient Orbs */}
            <div className="fixed top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>



            <main className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
                {/* Page Header - Matching Profile style */}
                <div className="relative mb-8">
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-orange-500/20 rounded-3xl blur-xl"></div>
                    <div className="relative bg-gradient-to-br from-orange-950/40 to-[#0f0a06]/60 backdrop-blur rounded-3xl border border-orange-800/30 overflow-hidden p-6">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/profile"
                                className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                            >
                                <ArrowLeft className="w-5 h-5 text-orange-400" />
                            </Link>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 text-orange-400" />
                                    Profile Customize Karo
                                </h1>
                                <p className="text-orange-100/50 text-sm mt-1">Apni pehchan banao, badiya dikhao! ✨</p>
                            </div>
                            <div className="hidden md:flex items-center gap-2">
                                <Crown className="w-5 h-5 text-orange-400" />
                                <span className="text-orange-400 text-sm font-medium">Premium Profile</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Message - Styled like Profile alerts */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-2xl backdrop-blur border ${message.type === 'success'
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                        }`}>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{message.type === 'success' ? '🎉' : '😅'}</span>
                            <span className={`font-medium ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                {message.text}
                            </span>
                        </div>
                    </div>
                )}

                {/* Section Navigation - Profile styled */}
                <div className="flex flex-wrap gap-2 mb-8 p-2 bg-gradient-to-br from-orange-950/40 to-transparent backdrop-blur rounded-2xl border border-orange-900/30">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex-1 min-w-fit px-5 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${activeSection === section.id
                                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25'
                                : 'text-orange-100/60 hover:text-orange-400 hover:bg-orange-900/30'
                                }`}
                        >
                            <span>{section.emoji}</span>
                            <span>{section.label}</span>
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Photo Section */}
                    {activeSection === 'photo' && (
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-orange-500/10 rounded-3xl blur-xl"></div>
                            <div className="relative bg-gradient-to-br from-orange-950/40 to-[#0f0a06]/60 backdrop-blur rounded-3xl border border-orange-800/30 p-8 overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-2xl"></div>
                                <Sparkles className="absolute top-4 right-4 w-6 h-6 text-orange-300/30" />

                                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                    Apni Photo Lagao
                                </h2>
                                <p className="text-orange-100/50 text-sm mb-8">Badiya photo lagao, impression jhakaas ho! 📸</p>

                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div
                                        onClick={handleAvatarClick}
                                        className="relative w-40 h-40 rounded-full cursor-pointer group/avatar"
                                    >
                                        {/* Animated ring */}
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 p-1 shadow-xl shadow-orange-500/30">
                                            <div className="w-full h-full rounded-full bg-[#0f0a06]"></div>
                                        </div>

                                        {/* Avatar */}
                                        <div className="absolute inset-2 rounded-full bg-[#0f0a06] flex items-center justify-center overflow-hidden">
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-6xl font-bold bg-gradient-to-br from-orange-400 to-amber-500 bg-clip-text text-transparent">
                                                    {formData.name?.charAt(0) || '?'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Hover overlay */}
                                        <div className="absolute inset-2 rounded-full bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-300">
                                            <Camera className="w-8 h-8 text-white mb-2" />
                                            <span className="text-white text-xs font-medium">Click Karo</span>
                                        </div>

                                        {/* Sparkle effect */}
                                        <div className="absolute -top-2 -right-2 text-2xl animate-bounce">✨</div>
                                    </div>

                                    <div className="text-center md:text-left">
                                        <button
                                            type="button"
                                            onClick={handleAvatarClick}
                                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                                        >
                                            <Zap className="w-4 h-4" />
                                            Naya Photo Upload Karo
                                        </button>
                                        <p className="text-xs text-orange-100/40 mt-3 flex items-center gap-2">
                                            <span>💡</span>
                                            JPG, PNG supported. Max 5MB tak chalega.
                                        </p>
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
                        </div>
                    )}

                    {/* Basic Info */}
                    {activeSection === 'basic' && (
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-blue-500/10 rounded-3xl blur-xl"></div>
                            <div className="relative bg-gradient-to-br from-orange-950/40 to-[#0f0a06]/60 backdrop-blur rounded-3xl border border-orange-800/30 p-8 overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500"></div>
                                <Sparkles className="absolute top-4 right-4 w-6 h-6 text-orange-300/30" />

                                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    Basic Jaankari
                                </h2>
                                <p className="text-orange-100/50 text-sm mb-8">Batao kaun ho tum! 🎭</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="block text-sm text-orange-100/70 mb-2 flex items-center gap-2">
                                            <Star className="w-3 h-3 text-amber-500" />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Apna naam likho babua..."
                                            className="w-full px-5 py-4 bg-orange-950/30 border-2 border-orange-900/30 rounded-2xl text-white placeholder-orange-100/30 focus:outline-none focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/10 transition-all duration-300"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm text-orange-100/70 mb-2 flex items-center gap-2">
                                            <Mail className="w-3 h-3 text-blue-500" />
                                            Email (Change nahi hoga)
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            disabled
                                            className="w-full px-5 py-4 bg-orange-950/20 border-2 border-orange-900/20 rounded-2xl text-orange-100/40 cursor-not-allowed opacity-60"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm text-orange-100/70 mb-2 flex items-center gap-2">
                                            <Phone className="w-3 h-3 text-green-500" />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+91 9876543210"
                                            className="w-full px-5 py-4 bg-orange-950/30 border-2 border-orange-900/30 rounded-2xl text-white placeholder-orange-100/30 focus:outline-none focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/10 transition-all duration-300"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm text-orange-100/70 mb-2 flex items-center gap-2">
                                            <MapPin className="w-3 h-3 text-red-500" />
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="Patna, Bihar 🏠"
                                            className="w-full px-5 py-4 bg-orange-950/30 border-2 border-orange-900/30 rounded-2xl text-white placeholder-orange-100/30 focus:outline-none focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/10 transition-all duration-300"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 group">
                                    <label className="block text-sm text-orange-100/70 mb-2 flex items-center gap-2">
                                        <Heart className="w-3 h-3 text-pink-500" />
                                        Bio (Apne baare mein kuch batao)
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="Hum hai Bihari boy/girl, placement phodne aaye hain... 💪🔥"
                                        maxLength={200}
                                        rows={3}
                                        className="w-full px-5 py-4 bg-orange-950/30 border-2 border-orange-900/30 rounded-2xl text-white placeholder-orange-100/30 focus:outline-none focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/10 transition-all duration-300 resize-none"
                                    />
                                    <div className="flex justify-between mt-2">
                                        <p className="text-xs text-orange-100/40">Thoda funky rakhna! 😎</p>
                                        <p className={`text-xs ${formData.bio.length > 180 ? 'text-orange-500' : 'text-orange-100/40'}`}>
                                            {formData.bio.length}/200
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {activeSection === 'education' && (
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-purple-500/10 rounded-3xl blur-xl"></div>
                            <div className="relative bg-gradient-to-br from-orange-950/40 to-[#0f0a06]/60 backdrop-blur rounded-3xl border border-orange-800/30 p-8 overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>
                                <Sparkles className="absolute top-4 right-4 w-6 h-6 text-orange-300/30" />

                                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                        <GraduationCap className="w-6 h-6 text-white" />
                                    </div>
                                    Padhai Ka Byora
                                </h2>
                                <p className="text-orange-100/50 text-sm mb-8">Kahan se padhe ho? College ki baat batao! 📚</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 group">
                                        <label className="block text-sm text-orange-100/70 mb-2 flex items-center gap-2">
                                            <Building2 className="w-3 h-3 text-purple-500" />
                                            College/University
                                        </label>
                                        <input
                                            type="text"
                                            name="college"
                                            value={formData.college}
                                            onChange={handleChange}
                                            placeholder="IIT Patna, NIT Jamshedpur, BITS ye sab chalega..."
                                            className="w-full px-5 py-4 bg-orange-950/30 border-2 border-orange-900/30 rounded-2xl text-white placeholder-orange-100/30 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/10 transition-all duration-300"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm text-orange-100/70 mb-2">Course/Branch</label>
                                        <input
                                            type="text"
                                            name="course"
                                            value={formData.course}
                                            onChange={handleChange}
                                            placeholder="B.Tech CSE, BCA, MCA..."
                                            className="w-full px-5 py-4 bg-orange-950/30 border-2 border-orange-900/30 rounded-2xl text-white placeholder-orange-100/30 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/10 transition-all duration-300"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm text-orange-100/70 mb-2 flex items-center gap-2">
                                            <Calendar className="w-3 h-3 text-amber-500" />
                                            Graduation Year
                                        </label>
                                        <select
                                            name="graduationYear"
                                            value={formData.graduationYear}
                                            onChange={handleChange}
                                            className="w-full px-5 py-4 bg-orange-950/30 border-2 border-orange-900/30 rounded-2xl text-white focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/10 transition-all duration-300 appearance-none cursor-pointer"
                                        >
                                            <option value="">Kab pass out hoge? 🎓</option>
                                            {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Social Links */}
                    {activeSection === 'social' && (
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10 rounded-3xl blur-xl"></div>
                            <div className="relative bg-gradient-to-br from-orange-950/40 to-[#0f0a06]/60 backdrop-blur rounded-3xl border border-orange-800/30 p-8 overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500"></div>
                                <Sparkles className="absolute top-4 right-4 w-6 h-6 text-orange-300/30" />

                                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                                        <Globe className="w-6 h-6 text-white" />
                                    </div>
                                    Social Links
                                </h2>
                                <p className="text-orange-100/50 text-sm mb-8">Duniya ko batao ki tum kahan ho! 🌍</p>

                                <div className="space-y-6">
                                    <div className="group">
                                        <label className="block text-sm text-orange-100/70 mb-2 flex items-center gap-2">
                                            <Linkedin className="w-4 h-4 text-blue-500" />
                                            LinkedIn
                                        </label>
                                        <input
                                            type="url"
                                            name="linkedinUrl"
                                            value={formData.linkedinUrl}
                                            onChange={handleChange}
                                            placeholder="https://linkedin.com/in/tumhara-naam"
                                            className="w-full px-5 py-4 bg-orange-950/30 border-2 border-orange-900/30 rounded-2xl text-white placeholder-orange-100/30 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10 transition-all duration-300"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm text-orange-100/70 mb-2 flex items-center gap-2">
                                            <Github className="w-4 h-4 text-gray-400" />
                                            GitHub
                                        </label>
                                        <input
                                            type="url"
                                            name="githubUrl"
                                            value={formData.githubUrl}
                                            onChange={handleChange}
                                            placeholder="https://github.com/tumhara-username"
                                            className="w-full px-5 py-4 bg-orange-950/30 border-2 border-orange-900/30 rounded-2xl text-white placeholder-orange-100/30 focus:outline-none focus:border-gray-500 focus:shadow-lg focus:shadow-gray-500/10 transition-all duration-300"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm text-orange-100/70 mb-2 flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-green-500" />
                                            Portfolio Website
                                        </label>
                                        <input
                                            type="url"
                                            name="portfolioUrl"
                                            value={formData.portfolioUrl}
                                            onChange={handleChange}
                                            placeholder="https://tumhari-website.com"
                                            className="w-full px-5 py-4 bg-orange-950/30 border-2 border-orange-900/30 rounded-2xl text-white placeholder-orange-100/30 focus:outline-none focus:border-green-500 focus:shadow-lg focus:shadow-green-500/10 transition-all duration-300"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}



                    {/* Save Button - Profile styled */}
                    <div className="flex flex-col md:flex-row justify-end gap-4 pt-4">
                        <Link
                            to="/profile"
                            className="px-8 py-4 bg-orange-950/30 text-orange-100/60 font-bold rounded-2xl border border-orange-900/30 hover:border-orange-500/50 hover:bg-orange-900/30 hover:text-orange-400 transition-all duration-300 text-center"
                        >
                            Cancel Karo 👋
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            {saving ? 'Saving ho raha hai... ⏳' : 'Save Karo! 🚀'}
                        </button>
                    </div>
                </form>

                {/* Fun tip at bottom - Profile styled */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-br from-orange-950/40 to-transparent backdrop-blur-xl rounded-full border border-orange-900/30">
                        <span className="text-xl">💡</span>
                        <span className="text-orange-100/50 text-sm">Pro Tip: Complete profile wale ko interviewer zyada seriously lete hain!</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
