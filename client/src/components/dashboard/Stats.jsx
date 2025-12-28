export default function Stats({ userData }) {
    // UX: Goal Gradient Effect - motivation increases near goal
    const dailyGoal = 3;
    const problemsSolvedToday = userData?.problemsSolvedToday || 1;
    const progressPercent = Math.min((problemsSolvedToday / dailyGoal) * 100, 100);

    // UX: Loss Aversion - people prefer to avoid losses
    const streakAtRisk = !userData?.solvedToday;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Streak Card - with Loss Aversion warning */}
            <div className={`glass-panel p-5 rounded-lg border-l-4 relative overflow-hidden group transition-all duration-300 ${streakAtRisk ? 'border-l-red-500 animate-pulse' : 'border-l-jalebi-orange'}`}>
                <div className="absolute -right-6 -top-6 text-white/5 transition-transform group-hover:scale-110 group-hover:rotate-12">
                    <span className="material-symbols-outlined text-9xl">local_fire_department</span>
                </div>
                <div className="relative z-10">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Streak Ki Aag</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-white">{userData?.streakCount || 12} Days</h3>
                        <span className={`text-sm font-bold animate-pulse ${streakAtRisk ? 'text-red-400' : 'text-jalebi-orange'}`}>
                            {streakAtRisk ? '⚠️ AT RISK!' : 'FIRE!'}
                        </span>
                    </div>
                    {/* UX: Loss Aversion - warning message */}
                    {streakAtRisk ? (
                        <p className="text-red-400 text-xs mt-2 flex items-center gap-1 font-bold">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            Solve 1 problem to save your streak!
                        </p>
                    ) : (
                        <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">trending_up</span> +1 Day today
                        </p>
                    )}
                </div>
            </div>

            {/* Points Card - with Social Proof */}
            <div className="glass-panel p-5 rounded-lg border-l-4 border-l-neon-blue relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 text-white/5 transition-transform group-hover:scale-110 group-hover:rotate-12">
                    <span className="material-symbols-outlined text-9xl">change_history</span>
                </div>
                <div className="relative z-10">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Samosa Points</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-white">{userData?.babuaCoins || 420}</h3>
                        <span className="text-neon-blue text-sm font-bold">XP</span>
                    </div>
                    {/* UX: Social Proof - show relative standing */}
                    <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">groups</span>
                        Top 25% of all Babuas!
                    </p>
                </div>
            </div>

            {/* Daily Goal Card - with Goal Gradient Effect */}
            <div className="glass-panel p-5 rounded-lg border-l-4 border-l-primary relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 text-white/5 transition-transform group-hover:scale-110 group-hover:rotate-12">
                    <span className="material-symbols-outlined text-9xl">target</span>
                </div>
                <div className="relative z-10">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Daily Goal</p>
                    {/* UX: Pseudo-Set Framing - show progress as X/Y */}
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-white">{problemsSolvedToday}/{dailyGoal}</h3>
                        <span className="text-primary text-sm font-bold">Problems</span>
                    </div>
                    {/* UX: Goal Gradient Effect - progress bar */}
                    <div className="mt-3">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${progressPercent >= 100 ? 'bg-green-500' : progressPercent >= 66 ? 'bg-primary' : 'bg-jalebi-orange'}`}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <p className={`text-xs mt-1 ${progressPercent >= 100 ? 'text-green-400' : 'text-gray-400'}`}>
                            {progressPercent >= 100 ? (
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">celebration</span>
                                    Goal completed! Keep the momentum!
                                </span>
                            ) : (
                                <span>{dailyGoal - problemsSolvedToday} more to hit your goal</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

