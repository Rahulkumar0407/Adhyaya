import { useNavigate } from 'react-router-dom';

export default function Roadmap() {
    const navigate = useNavigate();

    return (
        <div className="glass-panel rounded-xl p-6 md:p-8 relative mt-6">
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-bebas text-2xl text-white tracking-wide flex items-center gap-2">
                    <span className="material-symbols-outlined text-jalebi-orange">train</span>
                    Coding Express Roadmap
                </h3>
                <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">Next Stop: Stack Chowk</span>
            </div>

            <div className="relative">
                {/* The Track Line */}
                <div className="absolute left-[27px] top-4 bottom-4 w-1 bg-gray-800 rounded-full"></div>
                <div className="absolute left-[27px] top-4 h-1/3 w-1 bg-gradient-to-b from-green-500 to-neon-blue shadow-[0_0_10px_rgba(0,242,255,0.5)] rounded-full"></div>

                {/* Stations */}
                <div className="space-y-8 relative">
                    {/* Station 1: Completed */}
                    <div className="flex gap-6 group">
                        <div className="relative z-10 flex-shrink-0">
                            <div className="size-14 rounded-full bg-surface-dark border-2 border-green-500 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                <span className="material-symbols-outlined text-green-500">check_circle</span>
                            </div>
                        </div>
                        <div className="flex-grow pt-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">Hello World Haalt</h4>
                                    <p className="text-sm text-gray-400">Basic Syntax & Loops</p>
                                </div>
                                <span className="px-2 py-1 rounded bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20">COMPLETED</span>
                            </div>
                        </div>
                    </div>

                    {/* Station 2: Active */}
                    <div className="flex gap-6 group">
                        <div className="relative z-10 flex-shrink-0">
                            <div className="size-14 rounded-full bg-surface-dark border-2 border-neon-blue flex items-center justify-center shadow-neon animate-pulse">
                                <span className="material-symbols-outlined text-neon-blue text-2xl">code</span>
                            </div>
                            {/* Ripple effect */}
                            <div className="absolute inset-0 rounded-full border border-neon-blue opacity-50 animate-ping"></div>
                        </div>
                        <div className="flex-grow pt-2">
                            <div className="glass-panel p-4 rounded-lg border border-neon-blue/30 group-hover:border-neon-blue/60 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-lg font-bold text-white neon-text">Linked List Nagar</h4>
                                    <span className="px-2 py-1 rounded bg-neon-blue/10 text-neon-blue text-xs font-bold border border-neon-blue/20">IN PROGRESS</span>
                                </div>
                                <p className="text-sm text-gray-300 mb-3">Master pointers and nodes before the train leaves.</p>
                                <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
                                    <div className="bg-neon-blue h-1.5 rounded-full w-[65%] shadow-[0_0_5px_rgba(0,242,255,1)]"></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>65% Covered</span>
                                    <span>2/3 Modules</span>
                                </div>
                                <div className="mt-3">
                                    <button
                                        onClick={() => navigate('/dsa')}
                                        className="text-xs bg-neon-blue text-black font-bold px-3 py-1.5 rounded hover:bg-white transition-colors"
                                    >
                                        Continue Journey
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Station 3: Locked */}
                    <div className="flex gap-6 opacity-60">
                        <div className="relative z-10 flex-shrink-0">
                            <div className="size-14 rounded-full bg-surface-dark border-2 border-gray-700 flex items-center justify-center">
                                <span className="material-symbols-outlined text-gray-500">lock</span>
                            </div>
                        </div>
                        <div className="flex-grow pt-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-400">Stack & Queue Chowk</h4>
                                    <p className="text-sm text-gray-600">LIFO & FIFO Logistics</p>
                                </div>
                                <span className="px-2 py-1 rounded bg-gray-800 text-gray-500 text-xs font-bold border border-gray-700">LOCKED</span>
                            </div>
                        </div>
                    </div>

                    {/* Station 4: Locked */}
                    <div className="flex gap-6 opacity-40">
                        <div className="relative z-10 flex-shrink-0">
                            <div className="size-14 rounded-full bg-surface-dark border-2 border-gray-800 flex items-center justify-center">
                                <span className="material-symbols-outlined text-gray-600">forest</span>
                            </div>
                        </div>
                        <div className="flex-grow pt-2">
                            <h4 className="text-lg font-bold text-gray-500">Tree Jungle</h4>
                            <p className="text-sm text-gray-700">Deep recursion territory</p>
                        </div>
                    </div>

                    {/* Station 5: Boss */}
                    <div className="flex gap-6 opacity-30">
                        <div className="relative z-10 flex-shrink-0">
                            <div className="size-14 rounded-full bg-surface-dark border-2 border-gray-800 flex items-center justify-center">
                                <span className="material-symbols-outlined text-gray-600">castle</span>
                            </div>
                        </div>
                        <div className="flex-grow pt-2">
                            <h4 className="text-lg font-bold text-gray-500">Dynamic Programming Darbaar</h4>
                            <p className="text-sm text-gray-700">The Final Boss</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
