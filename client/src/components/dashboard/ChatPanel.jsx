import { useState } from 'react';

export default function ChatPanel() {
    const [message, setMessage] = useState('');

    const mockPosts = [
        {
            id: 1,
            username: 'Raju_Coder',
            color: 'text-primary',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBP-2GM3mRJM1lNwlzvK8WH73lWMk3WoBN-Jo8Am1NeuHtFlspi3IgZIg650ZV8F6j7_7zAHBYqeDA2ZIRp9ey5UmmzRSezBdKzslUDockFQdCTClBI3tlZRrsEOXQL1LB6vbYIx0dM_WYN3QNOVASG9RMZSUfiidSk3fJlSPf4-SxyiW15vX-VJwDMPSpvqB4-s4IiSTpUh2SdmbCt7DfMze4BOGnhc5O3p4H50e_gO58DAVdMe7xE584LRjLZl9ExjrKTkkbhwI8',
            time: '2 min ago',
            message: '"Aaj 5 Pattern solve kiye, ekdum makhan! 🔥"',
            badges: [{ text: 'Solved 5 Easy', color: 'bg-green-500/20 text-green-400 border-green-500/30' }]
        },
        {
            id: 2,
            username: 'Neha_JS',
            color: 'text-jalebi-orange',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATAbKd4zCXqcwLezCiH2vzS9JK1RzFbcpg96BW9ZtjwWSD_wW9v6IQ00w12Jz28X2R3tQXzwmZAeQIcmU1-tupdD5ZDr3U5dz7DGHxVM5q-eJAS9Fo7KDB0XTcYhc3emSuJbqBcLDl2THlmuC4m9tomISE2-5hKmth300aa1dOZF4D5-5rCfmb4IyOac_BOiOnIJXzeg8-PfcW1rgxtf6XzQGL2gj9Zlcv31qbnR0_y8Pl2cBH0pwsEVm1HGo8lcYAhuH0ivZTR7A',
            time: '15 min ago',
            message: '"Recursion ne dimaag ka dahi kar diya bhai. Koi help karega Tree Jungle mein? 🌳"',
            badges: []
        },
        {
            id: 3,
            username: 'Amit_Bhai',
            color: 'text-gray-300',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRCcQ3RaGwYamPpXAdkwiNsqaTxoHK256853twVagwEWzIs16OaBRwRHHAm0bfhSy4prtPvwRf_LbrBLoKW7lsETbLx51zzKGVzyqTRXyv_g7p4MYx5nDkq557RYeKCi3Pomqr-Vy2nLVQAbmKOrDZJxqGkwNZk8Smctf5Pfdj6pZK9SY-wYbeULNVT1uAMPI7P2e-7o9QmCuKaPs24AZNIfh-Wemktj03nobzooaR9vqw7yzjR3oLw_bZMHsy11sBq8IVRe1shII',
            time: '1 hr ago',
            message: '"Array aur String toh ho gaya, ab Linked List ki baari. Wish me luck! 🤞"',
            badges: []
        }
    ];

    return (
        <aside className="w-full lg:w-80 flex flex-col gap-6">
            <div className="sticky top-24 glass-panel rounded-xl border border-white/10 flex flex-col h-[calc(100vh-8rem)]">
                {/* Header */}
                <div className="p-4 border-b border-white/10 bg-gradient-to-r from-jalebi-orange/20 to-transparent">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bebas text-xl text-white tracking-wide flex items-center gap-2">
                            <span className="material-symbols-outlined text-jalebi-orange">coffee</span>
                            Chai Tapri
                        </h3>
                        <div className="flex items-center gap-1">
                            <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-xs text-green-400 font-mono">24 Online</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 font-mono mt-1 opacity-80">Live Bakaiti & Proof of Work</p>
                </div>

                {/* Scrollable Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {mockPosts.map((post) => (
                        <div key={post.id} className="bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/20 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className="size-8 rounded-full bg-gray-700 bg-cover bg-center"
                                    style={{ backgroundImage: `url('${post.avatar}')` }}
                                />
                                <div>
                                    <p className={`text-sm font-bold ${post.color}`}>{post.username}</p>
                                    <p className="text-[10px] text-gray-500">{post.time}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-300 font-mono">{post.message}</p>
                            {post.badges.length > 0 && (
                                <div className="mt-2 flex gap-2">
                                    {post.badges.map((badge, idx) => (
                                        <span key={idx} className={`text-[10px] ${badge.color} px-2 py-0.5 rounded border`}>
                                            {badge.text}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* System Alert */}
                    <div className="bg-neon-blue/10 p-3 rounded-lg border border-neon-blue/30">
                        <div className="flex items-center gap-2 text-neon-blue mb-1">
                            <span className="material-symbols-outlined text-sm">campaign</span>
                            <span className="text-xs font-bold uppercase">Announcement</span>
                        </div>
                        <p className="text-xs text-gray-300">Sunday ko "Graph Gali" mein Contest hai. Tayyar rehna sab log!</p>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-3 border-t border-white/10 bg-black/40">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-white/10 border-none rounded-md text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-neon-blue p-2"
                            placeholder="Bol babua, ka haal ba?"
                        />
                        <button className="bg-primary/20 hover:bg-primary/40 text-primary p-2 rounded-md transition-colors flex items-center justify-center">
                            <span className="material-symbols-outlined text-lg">send</span>
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
