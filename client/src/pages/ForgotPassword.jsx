import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            // Step 1: Check provider type via backend to give helpful error messages
            // This prevents Google users from trying to reset password
            const checkRes = await api.post('/auth/check-provider', { email });
            const { provider, exists } = checkRes.data;

            if (!exists) {
                throw new Error('No account found with this email.');
            }

            if (provider === 'google') {
                throw new Error('This account uses Google Sign-In. Please login with Google instead.');
            }

            // Step 2: Send Firebase Reset Email
            const auth = getAuth();
            await sendPasswordResetEmail(auth, email);

            setStatus('success');
            setMessage(`Password reset link sent to ${email}. Please check your inbox (and spam folder).`);
            toast.success('Reset email sent!');

        } catch (error) {
            console.error('Reset error:', error);
            setStatus('error');
            // Firebase error mapping
            let errorMsg = error.message;
            if (errorMsg.includes('auth/invalid-email')) errorMsg = 'Invalid email address.';
            if (errorMsg.includes('auth/user-not-found')) errorMsg = 'No user found (this shouldn\'t happen).';

            setMessage(errorMsg);
            toast.error(errorMsg);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-8 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <Link to="/login" className="inline-flex items-center text-stone-400 hover:text-white text-sm mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
                </Link>

                <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-stone-400 text-sm mb-6">
                    Enter your email to receive a password reset link.
                </p>

                {status === 'success' ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center animate-in fade-in zoom-in duration-300">
                        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                        <h3 className="text-white font-medium mb-1">Check your email</h3>
                        <p className="text-stone-400 text-sm">{message}</p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="mt-4 text-emerald-400 text-sm hover:underline"
                        >
                            Send another email
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {status === 'error' && (
                            <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p>{message}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium text-stone-300 uppercase tracking-wide mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                                    placeholder="johndoe@example.com"
                                    required
                                />
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {status === 'loading' ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
