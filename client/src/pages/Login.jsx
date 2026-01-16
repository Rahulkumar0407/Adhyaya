import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import ThreeBackground from '../components/common/ThreeBackground';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isMentorLogin, setIsMentorLogin] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login, logout } = useAuth(); // Destructure logout ensuring it's available
    const navigate = useNavigate();

    // Check for messages in URL (from OAuth redirect or registration)
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);

        // Check for mentor login redirect
        const role = queryParams.get('role');
        if (role === 'mentor') {
            setIsMentorLogin(true);
            toast.success('Welcome back, Mentor! Login to access your dashboard. 👨‍🏫', { duration: 3000 });
            // Clean URL but keep on login page
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }

        // Check for successful registration redirect
        const registered = queryParams.get('registered');
        if (registered === 'true') {
            toast.success('Account ban gaya! Ab login karo! 🎉', { duration: 4000 });
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }

        const errorMsg = queryParams.get('error');
        if (errorMsg) {
            let message = 'Login failed';
            switch (errorMsg) {
                case 'oauth_failed': message = 'Google login failed. Please try again.'; break;
                case 'auth_failed': message = 'Authentication failed.'; break;
                case 'missing_tokens': message = 'Could not retrieve login tokens.'; break;
                case 'activation_failed': message = 'Mentor account activation failed.'; break;
                default: message = errorMsg.replace(/_/g, ' ');
            }
            setError(message);
            toast.error(message);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userData = await login(email, password);

            // Admin users always go to admin dashboard
            if (userData.role === 'admin') {
                toast.success('Welcome back, Admin! 🛡️');
                navigate('/admin');
                return;
            }

            // Role Validation Logic
            if (isMentorLogin) {
                if (userData.role !== 'mentor') {
                    // Start logout process if role mismatch
                    logout();
                    throw new Error('This account is not registered as a Mentor.');
                }
                toast.success('Welcome back, Mentor! 🎓');
                navigate('/mentor-dashboard');
            } else {
                // Student Login
                if (userData.role === 'mentor') {
                    // Optional: Redirect mentors to their dashboard even if they use student login, 
                    // OR force them to use mentor login. Let's be nice and auto-redirect.
                    toast.success('Welcome back, Mentor! Redirecting to your portal...');
                    navigate('/mentor-dashboard');
                } else {
                    toast.success('Swagat hai babua! 🙏');
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            console.error(err);
            setError(err.message || err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Store intended role to handle redirect after callback
        localStorage.setItem('login_intent_role', isMentorLogin ? 'mentor' : 'student');

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        window.location.href = `${apiUrl}/auth/google`;
    };

    return (
        <div
            className="h-screen overflow-hidden relative"
            style={{
                background: 'linear-gradient(135deg, #1a1209 0%, #0f0f0f 50%, #1a0f0a 100%)',
            }}
        >
            {/* Background texture overlay */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            ></div>

            {/* Three.js Animated Background */}
            <ThreeBackground />

            {/* Gradient orbs for depth */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            {/* Main Content - Split Layout */}
            <div className="relative z-10 h-full flex items-center">
                <div className="container-babua flex w-full">
                    {/* Left Side - Hero */}
                    <div className="hidden lg:flex lg:w-1/2 flex-col justify-center pr-12">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5 mb-5 w-fit">
                            <span className="text-orange-400">🚀</span>
                            <span className="text-orange-400 text-xs font-medium">TOP CHOICE FOR ENGINEERS</span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-4xl font-bold mb-4">
                            <span className="text-white">Engineer babu,</span>
                            <br />
                            <span className="text-orange-500">Sapna sakar Kare?</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-gray-400 text-sm mb-6 max-w-sm">
                            Join the community of 50,000+ students cracking placements with desi style and modern tech.
                        </p>

                        {/* Stats */}
                        <div className="flex gap-3 mb-6">
                            <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl px-5 py-3 border border-gray-800">
                                <p className="text-2xl font-bold text-white">500+</p>
                                <p className="text-xs text-gray-400">COMPANIES</p>
                            </div>
                            <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl px-5 py-3 border border-gray-800">
                                <p className="text-2xl font-bold text-white">12 LPA</p>
                                <p className="text-xs text-gray-400">AVG PACKAGE</p>
                            </div>
                        </div>

                        {/* Coder Illustration */}
                        <div className="relative w-72 h-40 flex items-center justify-center">
                            <svg viewBox="0 0 300 180" className="w-full h-full">
                                {/* Yellow lightning bolts */}
                                <path d="M200 20 L210 35 L205 35 L215 50 L200 35 L205 35 Z" fill="#facc15" />
                                <path d="M230 30 L238 42 L234 42 L242 54 L230 42 L234 42 Z" fill="#facc15" />

                                {/* Yellow squiggles */}
                                <path d="M60 50 Q70 45, 80 50 Q90 55, 100 50" stroke="#facc15" strokeWidth="2" fill="none" />
                                <path d="M55 60 Q65 55, 75 60" stroke="#facc15" strokeWidth="2" fill="none" />

                                {/* White dashes on right */}
                                <line x1="250" y1="35" x2="270" y2="35" stroke="white" strokeWidth="2" opacity="0.6" />
                                <line x1="255" y1="45" x2="275" y2="45" stroke="white" strokeWidth="2" opacity="0.6" />

                                {/* Bench */}
                                <path d="M50 150 L250 150" stroke="white" strokeWidth="2" fill="none" />
                                <path d="M60 150 L60 165" stroke="white" strokeWidth="2" />
                                <path d="M240 150 L240 165" stroke="white" strokeWidth="2" />
                                <path d="M50 120 L50 150" stroke="white" strokeWidth="2" />
                                <path d="M250 120 L250 150" stroke="white" strokeWidth="2" />
                                <path d="M45 120 L255 120" stroke="white" strokeWidth="2" />

                                {/* Person body - sitting */}
                                <ellipse cx="130" cy="55" rx="18" ry="20" fill="white" /> {/* Head */}
                                <path d="M125 40 Q120 30, 130 28 Q145 30, 140 40" stroke="#333" strokeWidth="2" fill="none" /> {/* Hair */}

                                {/* Torso */}
                                <path d="M115 75 L110 115 L155 115 L150 75 Z" fill="white" />

                                {/* Arms */}
                                <path d="M115 80 L100 95 L120 105" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" />
                                <path d="M150 80 L165 95 L140 105" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" />

                                {/* Legs */}
                                <path d="M115 115 L100 145 L95 155" stroke="#333" strokeWidth="12" fill="none" strokeLinecap="round" />
                                <path d="M145 115 L160 145 L165 155" stroke="#333" strokeWidth="12" fill="none" strokeLinecap="round" />

                                {/* Shoes */}
                                <ellipse cx="95" cy="160" rx="12" ry="6" fill="white" />
                                <ellipse cx="165" cy="160" rx="12" ry="6" fill="white" />

                                {/* Laptop */}
                                <rect x="113" y="85" width="35" height="25" rx="2" fill="#333" stroke="white" strokeWidth="1.5" />
                                <rect x="108" y="110" width="45" height="5" rx="1" fill="#333" stroke="white" strokeWidth="1.5" />
                                <rect x="118" y="90" width="25" height="15" fill="#facc15" opacity="0.3" /> {/* Screen glow */}
                            </svg>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                        {/* Animated Border Wrapper */}
                        <div className="relative p-[2px] rounded-2xl overflow-hidden">
                            {/* Animated gradient border */}
                            <div className="absolute inset-0 rounded-2xl animate-border-spin"></div>
                            {/* Inner card with solid background */}
                            <div className="relative w-full max-w-sm bg-[#0f0f0f] rounded-2xl p-6">
                                {/* Header */}
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                                        Swagat Ba! <span className="text-2xl">👋</span>
                                    </h2>
                                    <p className="text-gray-400 text-sm mt-1">Log in karke padhai shuru kara babua.</p>
                                </div>

                                {/* OAuth Button */}
                                <button
                                    onClick={handleGoogleLogin}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a1a1a] hover:bg-[#252525] border border-gray-700 rounded-lg transition-colors mb-4"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span className="text-white text-sm">Continue with Google</span>
                                </button>

                                {/* Divider */}
                                <div className="text-center text-gray-500 text-xs mb-4">Ya fir email se</div>

                                {/* Role Toggle */}
                                <div className="flex p-1 bg-[#1a1a1a] border border-gray-800 rounded-xl mb-6 relative">
                                    <div
                                        className={`absolute inset-y-1 w-[calc(50%-4px)] bg-gray-800 rounded-lg transition-all duration-300 ease-out ${isMentorLogin ? 'left-[calc(50%+2px)]' : 'left-1'}`}
                                    ></div>
                                    <button
                                        type="button"
                                        onClick={() => setIsMentorLogin(false)}
                                        className={`relative flex-1 py-2 text-sm font-medium transition-colors z-10 ${!isMentorLogin ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        Student
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsMentorLogin(true)}
                                        className={`relative flex-1 py-2 text-sm font-medium transition-colors z-10 ${isMentorLogin ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        Mentor
                                    </button>
                                </div>

                                {/* Login Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {error && (
                                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    {/* Email Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                            {isMentorLogin ? 'Mentor Email' : 'Email ID ya Username'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                                placeholder={isMentorLogin ? "mentor@example.com" : "babua@example.com"}
                                                required
                                            />
                                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        </div>
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                            Password {isMentorLogin ? '' : '(Gupt Baat)'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                                placeholder="••••••••"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Remember & Forgot */}
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-600 bg-[#1a1a1a] text-orange-500 focus:ring-orange-500"
                                            />
                                            <span className="text-xs text-gray-400">
                                                {isMentorLogin ? 'Remember me' : 'Yaad rakha humke'}
                                            </span>
                                        </label>
                                        <Link to="/forgot-password" className="text-xs text-orange-500 hover:underline">
                                            Forgot Password
                                        </Link>
                                    </div>

                                    {/* Login Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 ${isMentorLogin
                                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-violet-500/30'
                                            : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-orange-500/30'}`}
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            isMentorLogin ? 'Login to Mentor Portal' : 'Login Mara'
                                        )}
                                    </button>
                                </form>

                                {/* Sign Up Link */}
                                <p className="text-center text-gray-400 text-sm mt-4">
                                    Account naikhe?{' '}
                                    <Link to="/register" className="text-orange-500 font-semibold hover:underline">
                                        Sign Up kara!
                                    </Link>
                                </p>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
