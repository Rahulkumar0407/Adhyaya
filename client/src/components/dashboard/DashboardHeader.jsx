import { useAuth } from '../../context/AuthContext';
import { Bell, Zap } from 'lucide-react';

export default function DashboardHeader() {
    const { user } = useAuth();

    // Extract first name from user's name or email
    const getDisplayName = () => {
        if (user?.name) {
            return user.name.split(' ')[0];
        }
        if (user?.email) {
            // Get name from email (before @)
            return user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1);
        }
        return 'Babua';
    };

    return (
        <header className="flex items-center justify-between mb-8">
            {/* Greeting */}
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                    <span className="text-3xl">🙏</span>
                    Pranam, {getDisplayName()} Babua!
                </h1>
                <p className="text-gray-400 mt-1 flex items-center gap-2">
                    Ka haal ba? Aaj kuch bada ukhada jaye!
                    <span className="text-xl">💪</span>
                </p>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <button className="relative p-3 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full"></span>
                </button>

                {/* Challenge Button */}
                <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all">
                    <Zap className="w-5 h-5" />
                    Aaj Ka Challenge
                </button>
            </div>
        </header>
    );
}
