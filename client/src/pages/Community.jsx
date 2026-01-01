import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Home, ClipboardCheck, Bell, MessageSquare, ThumbsUp, Send,
    Code2, Tag, MoreHorizontal, Image, Link2, Mic
} from 'lucide-react';

// Nav items - same as Dashboard
const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Mock Interview', href: '/mock-interview', icon: Mic },
    { name: 'Points Kaise?', href: '/how-to-earn', icon: ClipboardCheck },
    { name: 'Connect', href: '/mentors', icon: MessageSquare },
];

// Sample posts data
const samplePosts = [
    {
        id: 1,
        author: {
            name: 'Ravi Kumar',
            avatar: null,
            badge: 'Placement Warrior',
            badgeColor: 'text-orange-500',
        },
        time: '2 ghante pehle',
        title: 'Google ka Interview Experience - Lagg gayi bhai! 😅',
        content: 'Kal Google ka L3 interview tha. DSA ke questions toh standard the (Graph aur DP), par system design ne hila diya. Koi bata sakta hai ki "Scalable URL Shortener" mein database partitioning kaise handle karein? Maine Sharding bola par interviewer khush nahi dikha.',
        tags: [],
        gajab: 124,
        tippani: 42,
        hasLiked: false,
    },
    {
        id: 2,
        author: {
            name: 'Priya Singh',
            avatar: null,
            badge: 'DSA Beginner',
            badgeColor: 'text-cyan-500',
        },
        time: '5 min pehle',
        title: 'Knapsack problem mein confusion ba...',
        content: 'Bhai log, ye 0/1 Knapsack aur Fractional Knapsack mein major difference greedy approach ka hi hai na? Code likhte waqt main hamesha confuse ho jati hoon ki kab sort karna hai.',
        tags: ['Dynamic Programming'],
        gajab: 8,
        tippani: 3,
        hasLiked: false,
    },
    {
        id: 3,
        author: {
            name: 'Amit The Coder',
            avatar: null,
            badge: 'Back Bencher',
            badgeColor: 'text-gray-500',
        },
        time: '45 min pehle',
        title: 'Engineering karne aaye the, majdoor ban gaye',
        content: 'Assignment khatam nahi hote, aur idhar placement season aa gaya. Kiske kiske saath ye dukh dard hai? 😭 #EngineeringLife',
        tags: ['Bakaiti'],
        gajab: 256,
        tippani: 89,
        hasLiked: true,
    },
];

const filterTabs = [
    { id: 'all', label: '🔥 Sab Kuch (All)', active: true },
    { id: 'dsa', label: 'DSA Ke Sawal', icon: Code2 },
    { id: 'placement', label: 'Placement', icon: Home },
    { id: 'bakaiti', label: 'Bakaiti (Chat)', icon: MessageSquare },
];

export default function Community() {
    const { user } = useAuth();
    const [posts, setPosts] = useState(samplePosts);
    const [activeFilter, setActiveFilter] = useState('all');
    const [newPost, setNewPost] = useState('');

    const userName = user?.name?.split(' ')[0] || 'Babua';

    const handleLike = (postId) => {
        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    hasLiked: !post.hasLiked,
                    gajab: post.hasLiked ? post.gajab - 1 : post.gajab + 1
                };
            }
            return post;
        }));
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            {/* Top Navigation - Same as Dashboard */}
            <header className="bg-[#0a0a0a] border-b border-gray-800 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                <img src="/favicon.png" alt="Adhyaya Logo" className="w-8 h-8 object-contain" />
                            </div>
                            <div className="hidden md:block">
                                <div className="font-bold text-white">ADHYAYA</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest">Humara Platform</div>
                            </div>
                        </Link>
                    </div>

                    {/* Centered Nav Links with Border */}
                    <nav className="hidden md:flex items-center gap-1 px-2 py-1 bg-[#1a1a1a] border border-gray-700 rounded-full">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <item.icon className="w-4 h-4" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <button className="relative text-gray-400 hover:text-white p-2">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                        </button>
                        <Link to="/profile" className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <div className="text-white font-medium text-sm">{userName} Bhaiya</div>
                                <div className="text-green-500 text-xs flex items-center gap-1 justify-end">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    ONLINE
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                                {userName.charAt(0)}
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 max-w-3xl">
                {/* Page Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Community Chowk ☕</h1>
                    <p className="text-gray-500">Yahan khul ke boliye, engineering ka dukh aur sukh baatiye.</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {filterTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveFilter(tab.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeFilter === tab.id
                                ? 'bg-orange-500 text-black'
                                : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Post Composer */}
                <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-gray-800 mb-6">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {userName.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                                placeholder="Ka haal ba? Kuch gyan baatiye... (Start a discussion)"
                                className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none min-h-[60px]"
                                rows={2}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors">
                                <Image className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors">
                                <Code2 className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors">
                                <Link2 className="w-5 h-5" />
                            </button>
                        </div>
                        <button className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-black font-bold rounded-full hover:shadow-lg hover:shadow-orange-500/20 transition-all flex items-center gap-2">
                            Chipka Dein (Post)
                        </button>
                    </div>
                </div>

                {/* Posts Feed */}
                <div className="space-y-4">
                    {posts.map((post) => (
                        <div key={post.id} className="bg-[#1a1a1a] rounded-2xl p-5 border border-gray-800 hover:border-gray-700 transition-colors">
                            {/* Post Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-white font-bold">
                                        {post.author.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-medium">{post.author.name}</span>
                                            <span className="text-gray-600">•</span>
                                            <span className="text-gray-500 text-sm">{post.time}</span>
                                        </div>
                                        <span className={`text-xs ${post.author.badgeColor}`}>{post.author.badge}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {post.tags.map((tag) => (
                                        <span key={tag} className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                                            {tag}
                                        </span>
                                    ))}
                                    <button className="p-1 text-gray-500 hover:text-white">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Post Content */}
                            <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-4">{post.content}</p>

                            {/* Post Actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleLike(post.id)}
                                        className={`flex items-center gap-2 text-sm transition-colors ${post.hasLiked ? 'text-orange-500' : 'text-gray-500 hover:text-orange-500'
                                            }`}
                                    >
                                        <ThumbsUp className={`w-4 h-4 ${post.hasLiked ? 'fill-current' : ''}`} />
                                        {post.gajab} Gajab
                                    </button>
                                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
                                        <MessageSquare className="w-4 h-4" />
                                        {post.tippani} Tippani
                                    </button>
                                </div>
                                <button className="text-gray-500 hover:text-white">
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Back to Dashboard Floating Button */}
            <Link
                to="/dashboard"
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 hover:scale-110 transition-transform z-50"
            >
                <span className="text-2xl">🏠</span>
            </Link>
        </div>
    );
}
