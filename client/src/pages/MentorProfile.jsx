import { useState, useEffect } from 'react';
import BookingModal from '../components/mentorship/BookingModal';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Star, BadgeCheck, Clock, Users, Video, Calendar,
    MessageCircle, Briefcase, MapPin, ExternalLink,
    ChevronRight, Zap, Phone, ArrowLeft, Wallet
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Review Card Component
const ReviewCard = ({ review }) => (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
        <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-semibold text-sm">
                {review.student?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">{review.student?.name || 'Anonymous'}</h4>
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-200'}`}
                            />
                        ))}
                    </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{review.content}</p>
                {review.tags && review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {review.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs rounded-full">
                                {tag.replace(/-/g, ' ')}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
);

// Work History Item
const WorkHistoryItem = ({ work, isLast }) => (
    <div className="flex gap-4">
        <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${work.isCurrent ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            {!isLast && <div className="w-0.5 h-full bg-gray-200 my-1" />}
        </div>
        <div className="pb-4">
            <h4 className="font-semibold text-gray-900">{work.role}</h4>
            <p className="text-gray-600">{work.company}</p>
            <p className="text-gray-400 text-sm">{work.duration}</p>
        </div>
    </div>
);

// Rating Breakdown
const RatingBreakdown = ({ rating, totalReviews }) => {
    const breakdown = [
        { stars: 5, percent: 70 },
        { stars: 4, percent: 20 },
        { stars: 3, percent: 7 },
        { stars: 2, percent: 2 },
        { stars: 1, percent: 1 }
    ];

    return (
        <div className="flex items-center gap-8">
            <div className="text-center">
                <div className="text-5xl font-bold text-gray-900">{rating?.toFixed(1) || '0.0'}</div>
                <div className="flex items-center justify-center gap-1 my-2">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-5 h-5 ${i < Math.round(rating || 0) ? 'text-amber-400 fill-current' : 'text-gray-200'}`}
                        />
                    ))}
                </div>
                <p className="text-gray-500 text-sm">{totalReviews || 0} reviews</p>
            </div>
            <div className="flex-1 space-y-2">
                {breakdown.map(({ stars, percent }) => (
                    <div key={stars} className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 w-3">{stars}</span>
                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-amber-400 rounded-full"
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                        <span className="text-sm text-gray-400 w-8">{percent}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MentorProfile = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const [mentor, setMentor] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [walletBalance, setWalletBalance] = useState(0);
    const [showBookingModal, setShowBookingModal] = useState(searchParams.get('action') === 'schedule');

    useEffect(() => {
        const fetchMentorData = async () => {
            setLoading(true);
            try {
                const [mentorRes, reviewsRes, walletRes] = await Promise.all([
                    api.get(`/mentors/${id}`),
                    api.get(`/mentors/${id}/reviews`),
                    user ? api.get('/wallet').catch(() => ({ data: { data: { balance: 0 } } })) : Promise.resolve({ data: { data: { balance: 0 } } })
                ]);

                if (mentorRes.data.success) {
                    setMentor(mentorRes.data.data);
                }
                if (reviewsRes.data.success) {
                    setReviews(reviewsRes.data.data);
                }
                setWalletBalance(walletRes.data.data?.balance || 0);
            } catch (error) {
                console.error('Error fetching mentor:', error);
                // Mock data for demo
                setMentor({
                    _id: id,
                    user: { name: 'Rahul Sharma', avatar: null, email: 'rahul@example.com' },
                    headline: 'SDE @ Google | DSA Expert',
                    bio: 'Passionate about teaching DSA and helping students crack tech interviews. I\'ve helped 100+ students get into top product companies including Google, Microsoft, Amazon, and Flipkart. My teaching approach focuses on building problem-solving intuition rather than just memorizing solutions.',
                    expertise: ['DSA', 'System Design', 'Python', 'Interview Prep', 'C++', 'Java'],
                    yearsOfExperience: 5,
                    currentCompany: 'Google',
                    currentRole: 'Software Engineer',
                    workHistory: [
                        { company: 'Google', role: 'Software Engineer', duration: '2022 - Present', isCurrent: true },
                        { company: 'Microsoft', role: 'SDE Intern', duration: '2021 - 2022', isCurrent: false },
                        { company: 'Amazon', role: 'SDE Intern', duration: '2020', isCurrent: false }
                    ],
                    ratePerMinute: 5,
                    minCallDuration: 5,
                    rating: 4.9,
                    totalReviews: 127,
                    totalSessions: 89,
                    totalMinutes: 4250,
                    isOnline: true,
                    isVerified: true,
                    instantCallEnabled: true,
                    scheduledCallEnabled: true,
                    verificationDocs: { linkedinUrl: 'https://linkedin.com/in/rahul' }
                });
                setReviews([
                    { _id: '1', student: { name: 'Ankit Verma' }, rating: 5, content: 'Amazing mentor! Helped me understand recursion in the best way possible. Highly recommend!', tags: ['helpful', 'clear-explanation'] },
                    { _id: '2', student: { name: 'Priya Patel' }, rating: 5, content: 'Got my dream job at Flipkart after his guidance. DSA concepts are now crystal clear.', tags: ['knowledgeable', 'patient', 'solved-my-doubt'] },
                    { _id: '3', student: { name: 'Rohit Singh' }, rating: 4, content: 'Very knowledgeable and patient. Worth every rupee spent.', tags: ['professional', 'good-examples'] }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchMentorData();
    }, [id, user]);

    const handleStartCall = async () => {
        if (!user) {
            window.location.href = '/login';
            return;
        }

        const minBalance = mentor.ratePerMinute * mentor.minCallDuration;
        if (walletBalance < minBalance) {
            alert(`Insufficient balance. Minimum required: ₹${minBalance}. Please add funds to your wallet.`);
            return;
        }

        try {
            const response = await api.post('/calls/initiate', {
                mentorId: mentor._id,
                callType: 'instant'
            });

            if (response.data.success) {
                window.location.href = `/call/${response.data.data.callId}`;
            }
        } catch (error) {
            console.error('Error initiating call:', error);
            alert(error.response?.data?.message || 'Error starting call');
        }
    };

    const handleBookingConfirm = async (bookingData) => {
        try {
            // Parse the date and time into a proper ISO string
            const [hours, minutes] = bookingData.time.match(/(\d+):(\d+)/).slice(1);
            const isPM = bookingData.time.includes('PM');
            let hour24 = parseInt(hours);
            if (isPM && hour24 !== 12) hour24 += 12;
            if (!isPM && hour24 === 12) hour24 = 0;

            const scheduledDate = new Date(bookingData.date);
            scheduledDate.setHours(hour24, parseInt(minutes), 0, 0);

            const response = await api.post('/calls/initiate', {
                mentorId: mentor._id,
                callType: 'scheduled',
                scheduledFor: scheduledDate.toISOString(),
                scheduledDuration: bookingData.duration,
                notes: bookingData.notes
            });

            if (response.data.success) {
                alert(`Session scheduled for ${bookingData.date} at ${bookingData.time}!`);
                setShowBookingModal(false);
            }
        } catch (error) {
            console.error('Booking failed:', error);
            alert(error.response?.data?.message || 'Failed to schedule session. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!mentor) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Mentor Not Found</h2>
                    <Link to="/mentors/list" className="text-orange-400 hover:text-orange-300 hover:underline transition-colors">
                        Browse all mentors
                    </Link>
                </div>
            </div>
        );
    }

    const userData = mentor.user || {};

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0a06 0%, #1a1008 50%, #0f0a06 100%)' }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <Link
                        to="/mentors/list"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Mentors
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-orange-950/40 to-transparent backdrop-blur rounded-2xl shadow-lg border border-orange-800/30 p-6"
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-4xl overflow-hidden shadow-lg shadow-orange-500/20">
                                        {userData.avatar ? (
                                            <img src={userData.avatar} alt={userData.name} className="w-full h-full object-cover" />
                                        ) : (
                                            userData.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'M'
                                        )}
                                    </div>
                                    {mentor.isOnline && (
                                        <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                            Online
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h1 className="text-2xl font-bold text-white">{userData.name}</h1>
                                                {mentor.isVerified && <BadgeCheck className="w-6 h-6 text-blue-500" />}
                                            </div>
                                            <p className="text-orange-100/60 mt-1">{mentor.headline}</p>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex flex-wrap gap-4 mt-4">
                                        <div className="flex items-center gap-2 text-orange-100/60">
                                            <Star className="w-5 h-5 text-amber-400 fill-current" />
                                            <span className="font-semibold text-white">{mentor.rating?.toFixed(1)}</span>
                                            <span>({mentor.totalReviews} reviews)</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-orange-100/60">
                                            <Users className="w-5 h-5" />
                                            <span>{mentor.totalSessions} sessions</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-orange-100/60">
                                            <Clock className="w-5 h-5" />
                                            <span>{Math.round((mentor.totalMinutes || 0) / 60)} hours taught</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-orange-100/60">
                                            <Briefcase className="w-5 h-5" />
                                            <span>{mentor.yearsOfExperience}+ years exp</span>
                                        </div>
                                    </div>

                                    {/* Expertise */}
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {mentor.expertise?.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* About */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-orange-950/40 to-transparent backdrop-blur rounded-2xl shadow-lg border border-orange-800/30 p-6"
                        >
                            <h2 className="text-xl font-bold text-white mb-4">About</h2>
                            <p className="text-orange-100/70 leading-relaxed">{mentor.bio}</p>
                        </motion.div>

                        {/* Work Experience */}
                        {mentor.workHistory && mentor.workHistory.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-br from-orange-950/40 to-transparent backdrop-blur rounded-2xl shadow-lg border border-orange-800/30 p-6"
                            >
                                <h2 className="text-xl font-bold text-white mb-4">Experience</h2>
                                <div className="space-y-0">
                                    {mentor.workHistory.map((work, idx) => (
                                        <WorkHistoryItem
                                            key={idx}
                                            work={work}
                                            isLast={idx === mentor.workHistory.length - 1}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Reviews */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-orange-950/40 to-transparent backdrop-blur rounded-2xl shadow-lg border border-orange-800/30 p-6"
                        >
                            <h2 className="text-xl font-bold text-white mb-6">Reviews</h2>
                            <RatingBreakdown rating={mentor.rating} totalReviews={mentor.totalReviews} />

                            <div className="mt-8 space-y-4">
                                {reviews.map((review) => (
                                    <ReviewCard key={review._id} review={review} />
                                ))}
                            </div>

                            {reviews.length === 0 && (
                                <p className="text-gray-500 text-center py-8">No reviews yet</p>
                            )}
                        </motion.div>
                    </div>

                    {/* Sidebar - Booking Card */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-orange-950/40 to-transparent backdrop-blur rounded-2xl shadow-lg border border-orange-800/30 p-6 sticky top-24"
                        >
                            {/* Pricing */}
                            <div className="text-center pb-6 border-b border-gray-100">
                                <div className="text-4xl font-bold text-white">
                                    ₹{mentor.ratePerMinute}
                                    <span className="text-lg font-normal text-orange-100/50">/min</span>
                                </div>
                                <p className="text-orange-100/60 mt-1">Min. {mentor.minCallDuration} mins</p>
                                <p className="text-sm text-orange-100/40 mt-2">
                                    Minimum cost: ₹{mentor.ratePerMinute * mentor.minCallDuration}
                                </p>
                            </div>

                            {/* Wallet Balance */}
                            {user && (
                                <div className="py-4 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-orange-100/60">
                                            <Wallet className="w-5 h-5" />
                                            <span>Wallet Balance</span>
                                        </div>
                                        <span className="font-semibold text-white">₹{walletBalance}</span>
                                    </div>
                                    {walletBalance < mentor.ratePerMinute * mentor.minCallDuration && (
                                        <Link
                                            to="/wallet"
                                            className="text-sm text-orange-400 hover:text-orange-300 hover:underline mt-2 inline-block transition-colors"
                                        >
                                            Add funds to start a call
                                        </Link>
                                    )}
                                </div>
                            )}

                            {/* CTAs */}
                            <div className="space-y-3 pt-6">
                                {mentor.isOnline && mentor.instantCallEnabled ? (
                                    <button
                                        onClick={handleStartCall}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
                                    >
                                        <Zap className="w-5 h-5" />
                                        Start Instant Call
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-400 font-semibold rounded-xl cursor-not-allowed"
                                    >
                                        <Phone className="w-5 h-5" />
                                        Currently Offline
                                    </button>
                                )}

                                {mentor.scheduledCallEnabled && (
                                    <button
                                        onClick={() => setShowBookingModal(true)}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-orange-500 text-orange-400 font-semibold rounded-xl hover:bg-orange-500/10 transition-all duration-300"
                                    >
                                        <Calendar className="w-5 h-5" />
                                        Schedule for Later
                                    </button>
                                )}

                                <button className="w-full flex items-center justify-center gap-2 px-6 py-4 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-all duration-300">
                                    <MessageCircle className="w-5 h-5" />
                                    Send Message
                                </button>
                            </div>

                            {/* LinkedIn */}
                            {mentor.verificationDocs?.linkedinUrl && (
                                <a
                                    href={mentor.verificationDocs.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 mt-4 text-gray-500 hover:text-gray-700 text-sm"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View LinkedIn Profile
                                </a>
                            )}

                            {/* Trust indicators */}
                            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                                <div className="flex items-center gap-3 text-gray-600 text-sm">
                                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <BadgeCheck className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <span>Verified mentor profile</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600 text-sm">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <span>Pay only for time used</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600 text-sm">
                                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                        <Star className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <span>Satisfaction guaranteed</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            <BookingModal
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                mentor={mentor}
                onConfirm={handleBookingConfirm}
            />
        </div>
    );
};

export default MentorProfile;
