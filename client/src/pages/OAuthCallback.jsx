import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { handleOAuthCallback } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const error = searchParams.get('error');

        if (error) {
            toast.error('OAuth authentication failed. Please try again.');
            navigate('/login');
            return;
        }

        if (token && refreshToken) {
            handleOAuthCallback(token, refreshToken);
            toast.success('Successfully signed in with Google!');
            navigate('/dashboard');
        } else {
            toast.error('Authentication failed. Please try again.');
            navigate('/login');
        }
    }, [searchParams, navigate, handleOAuthCallback]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Completing sign in...</p>
            </div>
        </div>
    );
}

