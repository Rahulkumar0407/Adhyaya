import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';

export default function MainLayout({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Paths where navbar should NOT be shown
    const hideNavbarPaths = ['/', '/login', '/register', '/auth-success'];

    // Also hide if path starts with /call/ (video call room usually full screen)
    const shouldHideNavbar = hideNavbarPaths.includes(location.pathname) || location.pathname.startsWith('/call/');

    // Always show navbar for mock-interview page (it serves as a landing page too)
    const alwaysShowNavbarPaths = ['/mock-interview'];
    const shouldForceShowNavbar = alwaysShowNavbarPaths.includes(location.pathname);

    const showNavbar = (user || shouldForceShowNavbar) && !loading && !shouldHideNavbar;

    return (
        <div className="min-h-screen bg-[#0b0f14]">
            {showNavbar && <Navbar />}
            {children}
        </div>
    );
}
