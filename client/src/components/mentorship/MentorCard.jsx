import { useState } from 'react';
import {
    Users, Star, Phone, Video, Clock,
    CheckCircle, Zap, TrendingUp, Calendar, ArrowRight, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Stock professional avatars for mentors without custom images
const STOCK_AVATARS = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
];

// Get consistent stock avatar based on mentor ID or name
const getStockAvatar = (id, name) => {
    const seed = id || name || 'default';
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    return STOCK_AVATARS[Math.abs(hash) % STOCK_AVATARS.length];
};

export default function MentorCard({ mentor, onInstantCall }) {
    const {
        user,
        headline,
        expertise = [],
        yearsOfExperience,
        ratePerMinute,
        rating,
        totalReviews,
        isOnline,
        isVerified
    } = mentor;

    const [isHovered, setIsHovered] = useState(false);

    // Default Avatar - use stock image if no custom avatar
    const avatarInitial = user?.name?.charAt(0) || 'M';
    const stockAvatar = getStockAvatar(mentor._id, user?.name);

    return (
        <div
            className="group relative bg-[#1a1a1a]/80 backdrop-blur-md border border-gray-800 rounded-2xl p-5 transition-all duration-300 hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] flex flex-col h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Header: Avatar + Status */}
            <div className="flex gap-4 mb-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden">
                        <img
                            src={user?.avatar || stockAvatar}
                            alt={user?.name || 'Mentor'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = stockAvatar;
                            }}
                        />
                    </div>
                    {isOnline ? (
                        <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 bg-[#1a1a1a] rounded-full border border-gray-800">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                        </div>
                    ) : (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-600 rounded-full border-2 border-[#1a1a1a]"></div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="font-bold text-white text-lg truncate group-hover:text-orange-400 transition-colors">
                            {user?.name}
                        </h3>
                        {isVerified && (
                            <Shield className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                        )}
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-1">{headline}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 font-medium">
                        {(user?.company || mentor.company) && (
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                                {user?.company || mentor.company}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            {yearsOfExperience} YOE
                        </span>
                    </div>
                </div>
            </div>

            {/* Expertise Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
                {expertise.slice(0, 3).map((tag, i) => (
                    <span
                        key={i}
                        className="px-2 py-1 text-xs font-medium text-gray-400 bg-gray-800/50 border border-gray-700/50 rounded-md group-hover:border-orange-500/20 group-hover:text-gray-300 transition-colors"
                    >
                        {tag}
                    </span>
                ))}
                {expertise.length > 3 && (
                    <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-900/50 rounded-md">
                        +{expertise.length - 3}
                    </span>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5 p-3 bg-black/20 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-white font-bold text-sm">{rating}</span>
                    <span className="text-xs text-gray-500">({totalReviews})</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                    <span className="text-white font-bold text-sm">₹{ratePerMinute}</span>
                    <span className="text-xs text-gray-500">/min</span>
                </div>
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-800 group-hover:border-orange-500/20 transition-colors">
                <button
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${isOnline
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:scale-105'
                        : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                        }`}
                    disabled={!isOnline}
                    onClick={() => isOnline && onInstantCall && onInstantCall(mentor)}
                >
                    <Zap className={`w-4 h-4 ${isOnline ? 'fill-current' : ''}`} />
                    {isOnline ? 'Instant Call' : 'Offline'}
                </button>

                <Link
                    to={`/mentor/${mentor._id}`}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white text-black font-bold text-sm hover:bg-gray-200 transition-all hover:scale-105"
                >
                    Schedule
                    <Calendar className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
