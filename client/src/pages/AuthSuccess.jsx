import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AuthSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { handleOAuthCallback } = useAuth();
    const [processed, setProcessed] = useState(false);

    useEffect(() => {
        // Only process once
        if (processed) return;

        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');

        if (accessToken && refreshToken) {
            setProcessed(true);
            // Wait for OAuth callback to complete, then navigate
            handleOAuthCallback(accessToken, refreshToken).then(async (user) => {
                if (user) {
                    // Admin users always go to admin dashboard
                    if (user.role === 'admin') {
                        navigate('/admin', { replace: true });
                        return;
                    }

                    const intent = localStorage.getItem('login_intent_role');
                    localStorage.removeItem('login_intent_role'); // Clean up

                    if (intent === 'mentor') {
                        if (user.role === 'mentor') {
                            navigate('/mentor-dashboard', { replace: true });
                        } else {
                            // OAuth success but role mismatch -> Auto-Upgrade for this flow
                            try {
                                const activateRes = await api.post('/mentors/activate');
                                if (activateRes.data.success) {
                                    // Force full reload to refresh context role
                                    window.location.href = '/mentor-dashboard';
                                } else {
                                    navigate('/login?error=activation_failed');
                                }
                            } catch (error) {
                                console.error('Activation failed', error);
                                navigate('/login?error=activation_failed');
                            }
                        }
                    } else {
                        // Default / Student intent
                        if (user.role === 'mentor') {
                            navigate('/mentor-dashboard', { replace: true });
                        } else {
                            navigate('/dashboard', { replace: true });
                        }
                    }
                } else {
                    navigate('/login?error=oauth_failed');
                }
            });
        } else {
            navigate('/login?error=missing_tokens');
        }
    }, [searchParams, handleOAuthCallback, navigate, processed]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0b0f14]">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-white text-lg">Logging you in...</p>
                <p className="mt-2 text-gray-400 text-sm">Hold tight, almost there! 🚀</p>
            </div>
        </div>
    );
}

