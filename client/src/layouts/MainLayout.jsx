import Navbar from '../components/common/Navbar';
import { useLocation } from 'react-router-dom';

export default function MainLayout({ children }) {
    const location = useLocation();

    // Define pages that DON'T need the standard navbar
    const hideNavbar = ['/', '/auth-success', '/login', '/register', '/dashboard', '/padhai-zone', '/profile', '/settings'].includes(location.pathname);

    return (
        <div className="min-h-screen bg-[#0b0f14]">
            {!hideNavbar && <Navbar />}
            <div className={!hideNavbar ? "pt-16 lg:pt-20" : ""}>
                {children}
            </div>
        </div>
    );
}
