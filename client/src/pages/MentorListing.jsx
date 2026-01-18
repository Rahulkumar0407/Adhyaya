import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    Search, Filter, Star, BadgeCheck, Phone, Calendar,
    ChevronDown, X, Sliders, Users, Clock, Zap, Lock
} from 'lucide-react';
import api from '../services/api';
import MentorCard from '../components/mentorship/MentorCard';

// Expertise options
const EXPERTISE_OPTIONS = [
    'DSA', 'System Design', 'Backend', 'Frontend',
    'React', 'Node.js', 'Python', 'Java', 'C++',
    'DBMS', 'OS', 'Computer Networks', 'OOPS',
    'Machine Learning', 'Data Science', 'DevOps',
    'Interview Prep', 'Resume Review', 'Career Guidance'
];



// Filter Sidebar Component
const FilterSidebar = ({ filters, setFilters, isOpen, onClose }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = () => {
        setFilters(localFilters);
        onClose();
    };

    const resetFilters = () => {
        const defaultFilters = {
            expertise: [],
            minRate: '',
            maxRate: '',
            minRating: '',
            isOnline: false
        };
        setLocalFilters(defaultFilters);
        setFilters(defaultFilters);
    };

    const toggleExpertise = (exp) => {
        setLocalFilters(prev => ({
            ...prev,
            expertise: prev.expertise.includes(exp)
                ? prev.expertise.filter(e => e !== exp)
                : [...prev.expertise, exp]
        }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        className="fixed lg:sticky top-0 left-0 h-screen lg:h-auto w-80 bg-gray-900/95 backdrop-blur-xl shadow-xl lg:shadow-none z-50 lg:z-auto overflow-y-auto border-r border-gray-800/50"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg text-white">Filters</h3>
                                <button
                                    onClick={onClose}
                                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Online Now Toggle */}
                            <div className="mb-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={localFilters.isOnline}
                                        onChange={(e) => setLocalFilters(prev => ({ ...prev, isOnline: e.target.checked }))}
                                        className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                                    />
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="font-medium text-orange-100/80">Online Now</span>
                                    </div>
                                </label>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-white mb-3">Price Range (₹/min)</h4>
                                <div className="flex gap-3">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={localFilters.minRate}
                                        onChange={(e) => setLocalFilters(prev => ({ ...prev, minRate: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={localFilters.maxRate}
                                        onChange={(e) => setLocalFilters(prev => ({ ...prev, maxRate: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Minimum Rating */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-white mb-3">Minimum Rating</h4>
                                <div className="flex gap-2">
                                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                                        <button
                                            key={rating}
                                            onClick={() => setLocalFilters(prev => ({
                                                ...prev,
                                                minRating: prev.minRating === String(rating) ? '' : String(rating)
                                            }))}
                                            className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${localFilters.minRating === String(rating)
                                                ? 'border-amber-400 bg-amber-50 text-amber-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <Star className="w-4 h-4 fill-current text-amber-400" />
                                            <span className="text-sm font-medium">{rating}+</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Expertise */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-white mb-3">Expertise</h4>
                                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                                    {EXPERTISE_OPTIONS.map((exp) => (
                                        <button
                                            key={exp}
                                            onClick={() => toggleExpertise(exp)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${localFilters.expertise.includes(exp)
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            {exp}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={resetFilters}
                                    className="flex-1 px-4 py-3 border border-gray-700 bg-gray-800 text-gray-300 font-medium rounded-xl hover:bg-gray-700 transition-colors"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={applyFilters}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-amber-700 transition-colors"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const MentorListing = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('rating');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        expertise: [],
        minRate: '',
        maxRate: '',
        minRating: '',
        isOnline: searchParams.get('online') === 'true'
    });
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [unlocking, setUnlocking] = useState(false);

    // Check if subscribed
    const isSubscribed = user?.role === 'admin' || user?.role === 'mentor' || user?.mentorCircleSubscription?.plan === 'premium';

    const handleUnlock = async () => {
        if (unlocking) return;
        setUnlocking(true);
        try {
            const response = await api.post('/wallet/unlock-feature', { feature: 'mentorCircle' });
            if (response.data.success) {
                toast.success('Member Circle Unlocked!');
                await refreshUser();
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Unlock failed';
            if (msg.includes('Insufficient balance')) {
                toast.error('Insufficient balance! Redirecting to add funds...', { duration: 3000 });
                setTimeout(() => navigate('/wallet'), 2000);
            } else {
                toast.error(msg);
            }
        } finally {
            setUnlocking(false);
        }
    };

    const handleInstantCall = (mentor) => {
        if (!mentor.isOnline) return;
        // Logic to start call
        console.log(`Starting call with ${mentor.user.name}`);
        // For now, simple alert or redirect could go here.
        // navigate(`/call/${mentor._id}`);
        window.location.href = `/call/${mentor._id}`;
    };

    // Fetch mentors
    useEffect(() => {
        const fetchMentors = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('page', pagination.page);
                params.append('limit', 12);
                params.append('sortBy', sortBy);
                params.append('sortOrder', sortOrder);

                if (filters.expertise.length > 0) {
                    params.append('expertise', filters.expertise.join(','));
                }
                if (filters.minRate) params.append('minRate', filters.minRate);
                if (filters.maxRate) params.append('maxRate', filters.maxRate);
                if (filters.minRating) params.append('minRating', filters.minRating);
                if (filters.isOnline) params.append('isOnline', 'true');

                const response = await api.get(`/mentors?${params.toString()}`);
                if (response.data.success) {
                    setMentors(response.data.data);
                    setPagination(response.data.pagination);
                }
            } catch (error) {
                console.error('Error fetching mentors:', error);
                // Use mock data for demo
                setMentors([
                    {
                        _id: '1',
                        user: { name: 'Rahul Sharma', avatar: null },
                        headline: 'SDE @ Google | DSA Expert',
                        expertise: ['DSA', 'System Design', 'Python', 'Interview Prep'],
                        yearsOfExperience: 5,
                        ratePerMinute: 85,
                        minCallDuration: 5,
                        rating: 4.9,
                        totalReviews: 127,
                        totalSessions: 89,
                        isOnline: true,
                        isVerified: true,
                        instantCallEnabled: true,
                        scheduledCallEnabled: true
                    },
                    {
                        _id: '2',
                        user: { name: 'Priya Singh', avatar: null },
                        headline: 'Backend Lead @ Flipkart',
                        expertise: ['Node.js', 'MongoDB', 'System Design', 'AWS'],
                        yearsOfExperience: 6,
                        ratePerMinute: 75,
                        minCallDuration: 10,
                        rating: 4.8,
                        totalReviews: 89,
                        totalSessions: 67,
                        isOnline: true,
                        isVerified: true,
                        instantCallEnabled: true,
                        scheduledCallEnabled: true
                    },
                    {
                        _id: '3',
                        user: { name: 'Amit Kumar', avatar: null },
                        headline: 'SDE-2 @ Microsoft',
                        expertise: ['DSA', 'C++', 'Interview Prep', 'OOPS'],
                        yearsOfExperience: 4,
                        ratePerMinute: 95,
                        minCallDuration: 5,
                        rating: 4.9,
                        totalReviews: 156,
                        totalSessions: 134,
                        isOnline: false,
                        isVerified: true,
                        instantCallEnabled: true,
                        scheduledCallEnabled: true
                    },
                    {
                        _id: '4',
                        user: { name: 'Sneha Patel', avatar: null },
                        headline: 'Full Stack Developer @ Razorpay',
                        expertise: ['React', 'Node.js', 'PostgreSQL', 'Frontend'],
                        yearsOfExperience: 3,
                        ratePerMinute: 60,
                        minCallDuration: 5,
                        rating: 4.7,
                        totalReviews: 64,
                        totalSessions: 52,
                        isOnline: true,
                        isVerified: true,
                        instantCallEnabled: true,
                        scheduledCallEnabled: true
                    },
                    {
                        _id: '5',
                        user: { name: 'Vikram Joshi', avatar: null },
                        headline: 'ML Engineer @ Amazon',
                        expertise: ['Machine Learning', 'Python', 'Data Science', 'DSA'],
                        yearsOfExperience: 5,
                        ratePerMinute: 90,
                        minCallDuration: 10,
                        rating: 4.8,
                        totalReviews: 78,
                        totalSessions: 45,
                        isOnline: false,
                        isVerified: true,
                        instantCallEnabled: false,
                        scheduledCallEnabled: true
                    },
                    {
                        _id: '6',
                        user: { name: 'Ananya Reddy', avatar: null },
                        headline: 'DevOps Engineer @ PayPal',
                        expertise: ['DevOps', 'AWS', 'Docker', 'Kubernetes'],
                        yearsOfExperience: 4,
                        ratePerMinute: 110,
                        minCallDuration: 10,
                        rating: 4.6,
                        totalReviews: 42,
                        totalSessions: 38,
                        isOnline: true,
                        isVerified: true,
                        instantCallEnabled: true,
                        scheduledCallEnabled: true
                    },
                    {
                        _id: '7',
                        user: { name: 'Arjun Mehta', avatar: null },
                        headline: 'Software Engineer @ Swiggy',
                        expertise: ['DSA', 'Java', 'Backend', 'Spring Boot'],
                        yearsOfExperience: 2,
                        ratePerMinute: 50,
                        minCallDuration: 5,
                        rating: 4.5,
                        totalReviews: 28,
                        totalSessions: 22,
                        isOnline: true,
                        isVerified: true,
                        instantCallEnabled: true,
                        scheduledCallEnabled: true
                    },
                    {
                        _id: '8',
                        user: { name: 'Neha Gupta', avatar: null },
                        headline: 'SDE-3 @ Uber',
                        expertise: ['System Design', 'Microservices', 'Go', 'DSA'],
                        yearsOfExperience: 7,
                        ratePerMinute: 150,
                        minCallDuration: 15,
                        rating: 4.9,
                        totalReviews: 203,
                        totalSessions: 178,
                        isOnline: false,
                        isVerified: true,
                        instantCallEnabled: true,
                        scheduledCallEnabled: true
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchMentors();
    }, [pagination.page, sortBy, sortOrder, filters]);

    // Filter mentors by search query
    const filteredMentors = mentors.filter(mentor => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            mentor.user?.name?.toLowerCase().includes(query) ||
            mentor.headline?.toLowerCase().includes(query) ||
            mentor.expertise?.some(exp => exp.toLowerCase().includes(query))
        );
    });

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0a06 0%, #1a1008 50%, #0f0a06 100%)' }}>
            {/* Header */}
            <div className="bg-gradient-to-br from-orange-950/40 to-transparent backdrop-blur border-b border-orange-800/30 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, skill, or expertise..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-orange-950/30 border-2 border-orange-900/30 rounded-xl text-white placeholder-orange-100/30 focus:outline-none focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/10 transition-all"
                            />
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <select
                                    value={`${sortBy}-${sortOrder}`}
                                    onChange={(e) => {
                                        const [sb, so] = e.target.value.split('-');
                                        setSortBy(sb);
                                        setSortOrder(so);
                                    }}
                                    className="appearance-none pl-4 pr-10 py-3 bg-orange-950/30 border-2 border-orange-900/30 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/10 cursor-pointer transition-all"
                                >
                                    <option value="rating-desc">Top Rated</option>
                                    <option value="ratePerMinute-asc">Price: Low to High</option>
                                    <option value="ratePerMinute-desc">Price: High to Low</option>
                                    <option value="totalSessions-desc">Most Sessions</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>

                            <button
                                onClick={() => setShowFilters(true)}
                                className="flex items-center gap-2 px-4 py-3 bg-orange-950/30 border-2 border-orange-900/30 rounded-xl text-orange-100/80 hover:bg-orange-900/40 transition-colors lg:hidden"
                            >
                                <Sliders className="w-5 h-5" />
                                Filters
                            </button>
                        </div>
                    </div>

                    {/* Active filters */}
                    {(filters.expertise.length > 0 || filters.isOnline || filters.minRate || filters.maxRate || filters.minRating) && (
                        <div className="flex flex-wrap items-center gap-2 mt-4">
                            <span className="text-orange-100/50 text-sm">Active:</span>
                            {filters.isOnline && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                    Online
                                    <button onClick={() => setFilters(prev => ({ ...prev, isOnline: false }))}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {filters.expertise.map(exp => (
                                <span key={exp} className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                                    {exp}
                                    <button onClick={() => setFilters(prev => ({
                                        ...prev,
                                        expertise: prev.expertise.filter(e => e !== exp)
                                    }))}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            {(filters.minRate || filters.maxRate) && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                    ₹{filters.minRate || '0'} - ₹{filters.maxRate || '100'}/min
                                    <button onClick={() => setFilters(prev => ({ ...prev, minRate: '', maxRate: '' }))}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {filters.minRating && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full">
                                    ≥ {filters.minRating}★
                                    <button onClick={() => setFilters(prev => ({ ...prev, minRating: '' }))}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Desktop Filters */}
                    <div className="hidden lg:block w-80 flex-shrink-0">
                        <div className="sticky top-24">
                            <FilterSidebar
                                filters={filters}
                                setFilters={setFilters}
                                isOpen={true}
                                onClose={() => { }}
                            />
                        </div>
                    </div>

                    {/* Mobile Filters */}
                    <FilterSidebar
                        filters={filters}
                        setFilters={setFilters}
                        isOpen={showFilters}
                        onClose={() => setShowFilters(false)}
                    />

                    {/* Main Content */}
                    <div className="flex-1 relative">
                        {/* Results count */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-white">
                                {loading ? 'Loading...' : `${filteredMentors.length} Mentors Available`}
                            </h1>
                            <p className="text-orange-100/50 mt-1">Find the perfect mentor for your learning journey</p>
                        </div>

                        {/* Grid */}
                        {loading ? (
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl p-6 animate-pulse">
                                        <div className="flex gap-4 mb-4">
                                            <div className="w-16 h-16 bg-gray-200 rounded-xl" />
                                            <div className="flex-1">
                                                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                                                <div className="h-4 bg-gray-200 rounded w-1/2" />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mb-4">
                                            <div className="h-6 bg-gray-200 rounded-full w-16" />
                                            <div className="h-6 bg-gray-200 rounded-full w-20" />
                                        </div>
                                        <div className="h-10 bg-gray-200 rounded-xl" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredMentors.length > 0 ? (
                            <motion.div
                                layout
                                className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
                            >
                                <AnimatePresence>
                                    {filteredMentors.map(mentor => (
                                        <MentorCard
                                            key={mentor._id}
                                            mentor={mentor}
                                            onInstantCall={handleInstantCall}
                                        />
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No mentors found</h3>
                                <p className="text-gray-500">Try adjusting your filters or search query</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {[...Array(pagination.pages)].map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setPagination(prev => ({ ...prev, page: idx + 1 }))}
                                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${pagination.page === idx + 1
                                            ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white'
                                            : 'bg-orange-950/30 text-orange-100/60 border border-orange-900/30 hover:bg-orange-900/40'
                                            }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorListing;
