import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { handleOAuthCallback } = useAuth();

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');

        if (accessToken && refreshToken) {
            handleOAuthCallback(accessToken, refreshToken);
            navigate('/dashboard');
        } else {
            navigate('/login?error=missing_tokens');
        }
    }, [searchParams, handleOAuthCallback, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0b0f14]">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-babua-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-white text-lg">Logging you in...</p>
            </div>
        </div>
    );
}
