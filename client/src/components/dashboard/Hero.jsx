import { useNavigate } from 'react-router-dom';

export default function Hero() {
    const navigate = useNavigate();

    // UX: Fresh Start Effect - Monday motivation
    const today = new Date();
    const isMonday = today.getDay() === 1;
    const isMorning = today.getHours() < 12;

    return (
        <div className="relative overflow-hidden rounded-xl border border-white/10 group">
            {/* Background with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDa7Rb5QpeXTJOODpkxM9xxlAF-YstpkJvO48jkVorhQ5XjKBZnmIBt2EJFyvd-MW7tFwbu00qP7isiHJMdNiugj9s39CuVoIpovcUtnBs84AS912Be8NyN7_fqNV3Tp8hbSuokWkZtuIgArHnkNT6wQ202Qr8O7Vi8aC6uKRCPcLyJmLrI_R4OuxkCxrKWYnVqGEjffsUo9h9X_alYxSYT5ysvevjcWnbIL3Fi-nhLBr80EvmR0I-TaX-Bzbciy553-RaCE97cA44')`
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-deep-space via-deep-space/90 to-transparent"></div>

            {/* Content */}
            <div className="relative z-10 p-8 md:p-12 flex flex-col gap-4 max-w-2xl">
                {/* UX: Fresh Start Effect - special messaging for Monday/morning */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/30 w-fit">
                    <span className="animate-pulse size-2 rounded-full bg-neon-blue"></span>
                    <span className="text-neon-blue text-xs font-bold uppercase tracking-wider">
                        {isMonday ? '🔥 New Week, Fresh Start!' : isMorning ? 'Good Morning, Babua!' : 'System Online'}
                    </span>
                </div>

                <h1 className="font-bebas text-5xl md:text-7xl leading-none text-white tracking-wide">
                    Babua, DSA se <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-primary">darr lagta hai?</span>
                </h1>

                <p className="font-mono text-gray-300 text-sm md:text-base border-l-2 border-jalebi-orange pl-4">
                    &gt; Chinta mat kar, hum hain na. Cyberpunk style coding roadmap for Bihari engineers.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    {/* UX: Spark Effect - emphasize small action */}
                    <button
                        onClick={() => navigate('/dsa')}
                        className="bg-primary hover:bg-neon-blue text-black font-bold py-3 px-8 rounded flex items-center justify-center gap-2 transition-all hover:shadow-neon transform hover:-translate-y-1"
                    >
                        <span className="material-symbols-outlined">play_arrow</span>
                        SHURU KARO
                    </button>

                    {/* UX: Feedforward - show what to expect */}
                    <button
                        onClick={() => navigate('/patterns')}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/20 font-bold py-3 px-6 rounded backdrop-blur-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        View Roadmap
                        <span className="text-xs text-gray-400 hidden sm:inline">~2 min</span>
                    </button>
                </div>

                {/* UX: Spark Effect - ultra-low commitment nudge */}
                <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary">bolt</span>
                    Just 1 problem = streak saved. Bas 5 minute ka kaam!
                </p>
            </div>
        </div>
    );
}

