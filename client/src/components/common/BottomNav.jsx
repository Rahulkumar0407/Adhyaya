import { useLocation } from 'react-router-dom';
import PrefetchLink from './PrefetchLink';
import { Home, Map, User } from 'lucide-react';

export default function BottomNav() {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Map, label: 'Map', path: '/map' },
        { icon: User, label: 'Profile', path: '/dashboard' }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe md:hidden">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <PrefetchLink
                        key={item.label}
                        to={item.path}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive(item.path)
                            ? 'text-babua-primary'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <item.icon size={24} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </PrefetchLink>
                ))}
            </div>
        </div>
    );
}
