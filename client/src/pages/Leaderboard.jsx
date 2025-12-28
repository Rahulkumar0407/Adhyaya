import { Link } from 'react-router-dom';

export default function Leaderboard() {
    return (
        <div className="bg-background-dark text-white font-mono min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary selection:text-black">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 z-0 opacity-10" style={{
                backgroundImage: `linear-gradient(rgba(0, 242, 255, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 242, 255, 0.05) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
            }}></div>

            {/* TopNavBar is provided by MainLayout - removed embedded header */}

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-12 relative z-10">
                {/* Page Heading */}
                <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-4 border-secondary pl-6 py-2">
                    <div>
                        <h2 className="font-bebas text-5xl md:text-7xl text-white tracking-wide uppercase leading-none mb-2">
                            YE RAHE <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">ASLI PAHALWAN</span>
                        </h2>
                        <p className="text-gray-400 font-mono text-sm md:text-base max-w-2xl">
              // Degree dikhana mana hai. Sirf code bolta hai. <br />
                            <span className="text-primary opacity-80">&gt; System.out.println("Proof of Work");</span>
                        </p>
                    </div>
                    <button className="bg-surface-light hover:bg-primary hover:text-black border border-primary text-primary font-bebas text-xl tracking-wider px-8 py-3 rounded-sm transition-all duration-300 hover:shadow-neon uppercase flex items-center gap-2 group">
                        <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">swords</span>
                        Challenge Karo
                    </button>
                </section>

                {/* The Podium (Stats) */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    {/* Rank 2 */}
                    <div className="relative group md:order-1 order-2">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                            <span className="material-symbols-outlined text-gray-400 text-4xl">looks_two</span>
                        </div>
                        <div className="bg-surface-dark border border-[#333] hover:border-gray-400 p-6 rounded-lg relative overflow-hidden transition-all duration-300 group-hover:-translate-y-2">
                            <div className="flex items-center gap-4 mb-4">
                                <img alt="Rank 2 User" className="size-16 rounded-full border-2 border-gray-400 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAduOJbaagm2lCoF-q8mm71zWqzRN-CDkpxrLGJ2-6t5uuZbe6bf-EN3ejrEheuW6DlAfclIrPToR97GxnAYls59Df2h9g5BfsZOx2VUb8XVSNlOv8ytX7-GdAsbseiosyDg-QaSaH3IuuA5WB2uJlrAJdnUI5h6ZX1hYRC6QQaRxFsMpk-e-2AlOvhvi15GeS7vrDzula9VvHhkzlpK2jTHcRx9T2-vphx0iHa4XbAf1cNd8XJ5th5a0OXjcvNzcraFgzeDonNMR4" />
                                <div>
                                    <h3 className="text-gray-400 font-bebas text-xl tracking-wider">Jugaadu Pro</h3>
                                    <p className="text-white font-mono font-bold text-lg">Mukesh 'Mangu'</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-end border-t border-[#333] pt-4 mt-2">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">Babua Rating</p>
                                    <p className="text-2xl font-bebas text-white">920</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase mb-1">Streak</p>
                                    <p className="text-xl font-mono text-gray-400">45 Days</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rank 1 */}
                    <div className="relative group md:order-2 order-1">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                            <span className="material-symbols-outlined text-secondary text-6xl drop-shadow-[0_0_10px_rgba(255,153,0,0.5)]">crown</span>
                        </div>
                        <div className="bg-[#1a1a1a] border-2 border-secondary shadow-neon-orange p-8 rounded-lg relative overflow-hidden transition-all duration-300 transform scale-105 z-10">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <span className="material-symbols-outlined text-9xl">emoji_events</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-4 mb-6 relative">
                                <div className="size-24 rounded-full p-1 border-2 border-dashed border-secondary">
                                    <img alt="Rank 1 User" className="size-full rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTrrX1Zl1a6xe_0SFwfZVaSbhVLAcDIZLyU4HSzhfNkM2w-lhCRJXtbxkMkv3wOv8l5WfxzTIafBJX-2gDtlXWvBA_dy7qtRLCnX8GEwNZ_xx0J51je0cxkDpiJ5lZFjWfArzscqv3cIq4IMUqWsqs5R3WIGGfJRKyUenpeJ8CIBRNhlK0ZZV02mcMgPFk5-Sej0f8tMj0iFFkH4Pl19sC68Z0hFb1UW2fJhvvupRGjdpIfNOD8_zJcmc3Ow9L5U4PsRR-X8A5Z_0" />
                                </div>
                                <div>
                                    <h3 className="text-secondary font-bebas text-2xl tracking-widest drop-shadow-md">Asli Engineer</h3>
                                    <p className="text-white font-mono font-bold text-2xl">Rakesh 'Rocky'</p>
                                    <p className="text-gray-400 text-xs mt-1 font-mono">Full Stack ka Baap</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-t border-secondary/30 pt-4">
                                <div className="text-center">
                                    <p className="text-xs text-secondary uppercase mb-1">Babua Rating</p>
                                    <p className="text-4xl font-bebas text-white">1050</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-secondary uppercase mb-1">Streak</p>
                                    <p className="text-3xl font-mono text-white">69 Days</p>
                                </div>
                            </div>
                            <div className="mt-4 bg-secondary/10 border border-secondary/20 rounded p-2 text-center">
                                <p className="text-secondary text-xs font-bold font-mono">&gt;&gt; CURRENTLY CODING</p>
                            </div>
                        </div>
                    </div>

                    {/* Rank 3 */}
                    <div className="relative group md:order-3 order-3">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                            <span className="material-symbols-outlined text-primary text-4xl">looks_3</span>
                        </div>
                        <div className="bg-surface-dark border border-[#333] hover:border-primary p-6 rounded-lg relative overflow-hidden transition-all duration-300 group-hover:-translate-y-2">
                            <div className="flex items-center gap-4 mb-4">
                                <img alt="Rank 3 User" className="size-16 rounded-full border-2 border-primary object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_v5pNE6pMKPJFbT7juNt1opTjjzTmwx02MZFUiG4ZDZgQeQPeaMnMfncFwHYmI7BTbfCkKXwXL9jyFSK-7123HyvUIrUbVvVs_aC386_8A_KlMZJ01qdvQCHqacIcqJniMeHGq72ddBlCFSUWGXg6G-9BcXJjpW1inawhxYgsa7bV9qL7yyQepWdoJk40bykQs40Lvm0yVCaQp9N_6iIWR8LAFLybGZbS82aTi5xkTuGKQFbCcHp943eDs_wr94CW8XUtZuCAWVQ" />
                                <div>
                                    <h3 className="text-primary font-bebas text-xl tracking-wider">Coding Chacha</h3>
                                    <p className="text-white font-mono font-bold text-lg">Suresh 'System'</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-end border-t border-[#333] pt-4 mt-2">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">Babua Rating</p>
                                    <p className="text-2xl font-bebas text-white">880</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase mb-1">Streak</p>
                                    <p className="text-xl font-mono text-primary">12 Days</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature Section: Active Engineer Profile Focus */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Details Card */}
                    <div className="bg-surface-dark border border-[#333] p-6 rounded-lg flex flex-col gap-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="flex flex-col gap-2 z-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-gray-400 font-mono text-xs uppercase tracking-widest">Selected Pahalwan</h3>
                                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold border border-primary/30 animate-pulse">LIVE</span>
                            </div>
                            <h2 className="text-3xl font-bebas tracking-wide text-white">Rakesh 'Rocky' Kumar</h2>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <span className="material-symbols-outlined text-base">location_on</span>
                                <span>Patna se direct live coding</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#0f1214] border border-[#2a2a2a] p-3 rounded flex flex-col gap-1">
                                <span className="material-symbols-outlined text-primary text-xl">code_blocks</span>
                                <span className="text-gray-500 text-xs uppercase">Patterns Solved</span>
                                <span className="text-white text-xl font-mono font-bold">420</span>
                            </div>
                            <div className="bg-[#0f1214] border border-[#2a2a2a] p-3 rounded flex flex-col gap-1">
                                <span className="material-symbols-outlined text-secondary text-xl">local_fire_department</span>
                                <span className="text-gray-500 text-xs uppercase">Current Streak</span>
                                <span className="text-white text-xl font-mono font-bold">Aag Laga Di</span>
                            </div>
                        </div>
                        <div className="mt-auto">
                            <p className="text-gray-400 text-sm italic border-l-2 border-primary pl-3">
                                "Bhai ne pichle 10 din se keyboard nahi chhoda. Asli tabahi macha raha hai."
                            </p>
                        </div>
                    </div>

                    {/* Heatmap Section */}
                    <div className="lg:col-span-2 bg-surface-dark border border-[#333] p-6 rounded-lg flex flex-col gap-4 overflow-x-auto">
                        <div className="flex items-center justify-between min-w-[600px]">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">calendar_month</span>
                                <h3 className="text-white font-bebas text-xl tracking-wider">CODING CONSISTENCY (MEHNAT HEATMAP)</h3>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                                <span>Less</span>
                                <div className="flex gap-1">
                                    <div className="size-3 bg-[#2a2a2a] rounded-sm"></div>
                                    <div className="size-3 bg-[#1e4a52] rounded-sm"></div>
                                    <div className="size-3 bg-[#187d8b] rounded-sm"></div>
                                    <div className="size-3 bg-primary rounded-sm"></div>
                                </div>
                                <span>More</span>
                            </div>
                        </div>
                        {/* Heatmap Grid - Simplified version for React */}
                        <div className="grid grid-cols-[auto_1fr] gap-4 min-w-[600px]">
                            {/* Days Labels */}
                            <div className="grid grid-rows-7 gap-1 text-[10px] text-gray-500 font-mono leading-[12px] pt-4">
                                <span>Mon</span>
                                <span></span>
                                <span>Wed</span>
                                <span></span>
                                <span>Fri</span>
                                <span></span>
                                <span>Sun</span>
                            </div>
                            {/* Squares Container */}
                            <div className="flex gap-1 overflow-hidden">
                                {/* Generating columns dynamically would be better, but implementing structure from HTML */}
                                {[...Array(14)].map((_, colIndex) => (
                                    <div key={colIndex} className="grid grid-rows-7 gap-1">
                                        {[...Array(7)].map((_, cellIndex) => {
                                            // Randomize slightly for "lived-in" look or use specific patterns
                                            const random = Math.random();
                                            let bgClass = "bg-[#2a2a2a]";
                                            if (random > 0.8) bgClass = "bg-primary/30";
                                            if (random > 0.9) bgClass = "bg-primary/80";
                                            if (colIndex === 4 || colIndex === 5) bgClass = Math.random() > 0.5 ? "bg-primary shadow-[0_0_5px_rgba(0,242,255,0.5)]" : bgClass;

                                            return (
                                                <div key={cellIndex} className={`size-3 rounded-sm ${bgClass}`}></div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Leaderboard Table */}
                <section className="bg-surface-dark border border-[#333] rounded-lg overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-[#333] flex justify-between items-center bg-[#1a1a1a]">
                        <h3 className="font-bebas text-2xl tracking-widest text-white">THE RANGBAAZ LIST</h3>
                        <div className="flex gap-2">
                            <button className="text-xs font-mono px-3 py-1 bg-[#333] hover:bg-[#444] rounded text-white transition-colors">This Week</button>
                            <button className="text-xs font-mono px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded transition-colors">All Time</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs text-gray-500 uppercase font-mono tracking-wider border-b border-[#333]">
                                    <th className="px-6 py-4 font-normal">Rank (#)</th>
                                    <th className="px-6 py-4 font-normal">Pahalwan (Name)</th>
                                    <th className="px-6 py-4 font-normal hidden md:table-cell">Hathiyar (Tech Stack)</th>
                                    <th className="px-6 py-4 font-normal text-right">Babua Rating</th>
                                    <th className="px-6 py-4 font-normal text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="font-mono text-sm">
                                {[
                                    { rank: '01', name: "Rakesh 'Rocky'", stack: 'MERN Stack', rating: '1050', change: '▲ 12%', color: 'text-secondary', img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzkTyxz587ow-24cSXSq7dEZhCi6Vkr-AA2Z9aKmOSzOPbvmOX3lP1PkTLdYc3Vo4pj0GcH8hL8bAtGv6iDz31-gCWiu4qLGruPeM-a42pe_EbCEfO0Q9V2P0p7Wbsy1CSfaezOajqCv_WfWGrc3u0QW7ssznxha6er5ive6ZL--dk4uFBcgiMHi5MzrLweXjzFK_Cs4Y9o3WyeAObic4gsri3WbIHb9lR2gh-x2sO7_Be53pgEzJdQcuJGvhJVMH6sGZ_7areLJg" },
                                    { rank: '02', name: "Mukesh 'Mangu'", stack: 'Python/Django', rating: '920', change: '▲ 5%', color: 'text-gray-400', img: "https://lh3.googleusercontent.com/aida-public/AB6AXuATFcS7ADe0Jp9X2zCEDpstjtnDozOGmTChSoZp4Mhea6kzC8NEnGfZK26-fHjlv8ZCf4xHOqfA8fzdF6zjW6z34vLFr1iL8NbXyo-Wcxe5eBwPsWgYwECzw-CyoWr4o-EYzncHyoX9fyslZY9kM4Ifi4KkIlz0q_xk0UvKO01jM0M8eXiUy0AFrhkQOEVWFLTkaYcJQiR1Gw7FD_fTh9Zq07rlW9nIeV9gMbgSZ2qxOGef_Cg-zxuVY1FHS2noN4LermcRLF9BaLM" },
                                    { rank: '03', name: "Suresh 'System'", stack: 'Java/Spring', rating: '880', change: '▼ 2%', color: 'text-primary', img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCW5T6JxT_IeC3J7jnbPi9iN2ASBHrmSYcp27Pd-2_8S9OEp32Edko4lnn1n4hTO-SxwHasGd8do0qU1SYL9s7OQU5TXXg1o_tTXlaiG6vhJ5D8eg_nUtSGJQF2qiTnXI_EeHjl78uhcBzJrH_c3WhPs1YGgvdV3jLYDswneNRFfUbs1LGQWG0bVUHb6fZUIJ3wv8VGGVMZsF7H_n3lprIsGsuZpLY_GKiqyNPgN7tbicTfxY2VnuPhkpEDGsOsQz86O4qTAl2GsS4" },
                                    { rank: '04', name: "Deepak 'Debugger'", stack: 'DevOps', rating: '750', change: '-', color: 'text-gray-500', isTextAvatar: true }
                                ].map((row, idx) => (
                                    <tr key={idx} className="border-b border-[#333] hover:bg-white/5 transition-colors group cursor-pointer relative">
                                        <td className={`absolute left-0 top-0 bottom-0 w-1 ${row.color === 'text-secondary' ? 'bg-secondary' : row.color === 'text-primary' ? 'bg-primary' : 'bg-gray-500'} opacity-0 group-hover:opacity-100 transition-opacity`}></td>
                                        <td className={`px-6 py-4 ${row.color} font-bold text-lg`}>{row.rank}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center text-xs font-bold text-gray-400">
                                                    {row.isTextAvatar ? 'DK' : <img alt="User" className="size-full object-cover" src={row.img} />}
                                                </div>
                                                <span className="text-white font-bold group-hover:text-primary transition-colors">{row.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="px-2 py-1 bg-[#2a2a2a] text-xs rounded border border-[#333]" style={{ color: row.stack.includes('MERN') ? '#00f2ff' : row.stack.includes('Java') ? '#fbbf24' : row.stack.includes('Python') ? '#60a5fa' : '#c084fc' }}>{row.stack}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-white font-bold text-lg">{row.rating}</span>
                                            <span className={`text-xs ml-1 ${row.change.includes('▲') ? 'text-green-500' : row.change.includes('▼') ? 'text-red-500' : 'text-gray-600'}`}>{row.change}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-xs text-gray-400 hover:text-white hover:underline">View Profile</button>
                                        </td>
                                    </tr>
                                ))}

                                {/* User's Row */}
                                <tr className="border-b border-[#333] bg-primary/5 hover:bg-primary/10 transition-colors group cursor-pointer relative">
                                    <td className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></td>
                                    <td className="px-6 py-4 text-white font-bold text-lg">15</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-gray-700 overflow-hidden border border-primary">
                                                <img alt="User" className="size-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEE5qSD7UEX0AjQT8wxo0b91X0fyIAMJwNLXDn4BUw4BvFm8gQGlVq6JUgQzgCspAxwegE03t3b9h_deV5XIX9UyXJhmgW4WiexqBN7YNaKANqzYs5zjuaMB6WlTCWN0xL017u_XJZ2rhhCtCdAWdy8aWYQqepAQ3r5HN6g6kiNI4C_qiAbu2L4K0rF0dhWvSOH16W0ox0IFfOJWtFFBb0plXzGXEfMTRp7oMREcDliSUjRoPZBG1_iA_g6pcy-Byv94CcQxpytD4" />
                                            </div>
                                            <span className="text-white font-bold">You (Babua)</span>
                                            <span className="bg-primary text-black text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Me</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <span className="px-2 py-1 bg-[#2a2a2a] text-green-400 text-xs rounded border border-[#333]">Frontend</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-white font-bold text-lg">420</span>
                                        <span className="text-green-500 text-xs ml-1">▲ 50%</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-xs text-primary hover:underline font-bold">Edit Profile</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="p-4 border-t border-[#333] flex justify-center">
                        <div className="flex gap-1">
                            <button className="size-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-[#333] rounded transition-colors">&lt;</button>
                            <button className="size-8 flex items-center justify-center bg-primary text-black font-bold rounded">1</button>
                            <button className="size-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#333] rounded transition-colors">2</button>
                            <button className="size-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#333] rounded transition-colors">3</button>
                            <span className="size-8 flex items-center justify-center text-gray-600">...</span>
                            <button className="size-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-[#333] rounded transition-colors">&gt;</button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-[#333] py-8 bg-[#0d0d0d] mt-8">
                <div className="max-w-[1400px] mx-auto px-4 text-center">
                    <p className="text-gray-600 font-mono text-sm">
                        Made with <span className="text-secondary">♥</span> and <span className="text-primary">litti chokha</span> in Bihar.
                    </p>
                    <p className="text-gray-700 text-xs mt-2">© 2024 Babua BPL Systems. All rights reserved by the gali ka don.</p>
                </div>
            </footer>
        </div>
    );
}
