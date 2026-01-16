import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import api from '../services/api';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Initialize hook inside provider (allowed since it's child of BrowserRouter)

    useEffect(() => {
        checkAuth();
    }, []);

    // Socket listener for real-time ban enforcement
    useEffect(() => {
        if (!user) return;

        const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const socket = io(SOCKET_URL, {
            auth: { token: localStorage.getItem('accessToken') }
        });

        socket.on('connect', () => {
            // console.log('Auth socket connected');
            socket.emit('join:user', user._id);
        });

        const handleBanLogout = (reason) => {
            toast.error(
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-lg">Account Banned 🚫</span>
                    <span>{reason || 'Your account has been suspended.'}</span>
                </div>,
                { duration: 5000, position: 'top-center', id: 'ban-toast' } // Use ID to prevent duplicates
            );

            // Wait for toast to be seen
            setTimeout(() => {
                logout();
            }, 3000);
        };

        socket.on('user:banned', (data) => {
            handleBanLogout(data.reason);
        });

        socket.on('force_disconnect', (data) => {
            // Treat force_disconnect as a ban action if reason is provided
            if (data?.reason) {
                handleBanLogout(data.reason);
            } else {
                logout();
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [user?._id]); // Re-run if user changes

    const checkAuth = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/auth/me');
            setUser(response.data.data);
        } catch (error) {
            // Token might be expired, try to refresh
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const refreshResponse = await api.post('/auth/refresh', { refreshToken });
                    localStorage.setItem('accessToken', refreshResponse.data.data.accessToken);
                    localStorage.setItem('refreshToken', refreshResponse.data.data.refreshToken);

                    const userResponse = await api.get('/auth/me');
                    setUser(userResponse.data.data);
                } catch (refreshError) {
                    // If refresh fails (e.g. banned/revoked), clear tokens without navigating
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    setUser(null);
                }
            } else {
                // No refresh token, just clear state without navigating
                localStorage.removeItem('accessToken');
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        // Step 1: Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Wait for Firebase auth state to stabilize before getting token
        await new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
                if (firebaseUser) {
                    unsubscribe();
                    resolve();
                }
            });
        });

        // Helper function to attempt backend login
        const attemptBackendLogin = async (retryCount = 0) => {
            try {
                // Get a fresh ID token
                const idToken = await userCredential.user.getIdToken(true);

                // Step 2: Backend Session Exchange
                const response = await api.post('/auth/firebase-login', { idToken });
                return response.data.data;
            } catch (error) {
                // If this is the first attempt and it failed, retry once after a short delay
                if (retryCount === 0 && error.response?.status === 401) {
                    console.log('First login attempt failed, retrying...');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    return attemptBackendLogin(1);
                }
                throw error;
            }
        };

        const { user, accessToken, refreshToken } = await attemptBackendLogin();

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(user);

        return user;
    };

    const register = async (name, email, password) => {
        // Step 1: Firebase Registration
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();

        // Step 2: Backend Creation (without logging in)
        await api.post('/auth/firebase-login', {
            idToken,
            name // Pass name to create profile
        });

        // Step 3: Sign out from Firebase - user needs to login manually
        await signOut(auth);

        // Don't store tokens or set user - let them login manually
        return { success: true };
    };

    const logout = async () => {
        try {
            await signOut(auth); // Sign out from Firebase
        } catch (error) {
            console.error('Firebase signout error:', error);
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        // Only navigate if not already on login page to prevent loops
        if (window.location.pathname !== '/login') {
            navigate('/login');
        }
    };

    const updateUser = (updates) => {
        setUser(prev => ({ ...prev, ...updates }));
    };

    const handleOAuthCallback = async (accessToken, refreshToken) => {
        // Store tokens first
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        try {
            // Fetch user data immediately
            const response = await api.get('/auth/me');
            setUser(response.data.data);
            return response.data.data;
        } catch (error) {
            console.error('Failed to fetch user after OAuth:', error);
            // Clear tokens if fetch fails
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return null;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            updateUser,
            refreshUser: checkAuth, // Expose checkAuth as refreshUser
            handleOAuthCallback,
            isAuthenticated: !!user,
            token: localStorage.getItem('accessToken') // Expose token for manual API calls
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
