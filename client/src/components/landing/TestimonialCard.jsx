export default function TestimonialCard({ quote, author, role, index }) {
    const colors = [
        { bg: 'bg-blue-50', border: 'border-blue-100', avatar: 'from-blue-400 to-indigo-500' },
        { bg: 'bg-purple-50', border: 'border-purple-100', avatar: 'from-purple-400 to-pink-500' },
        { bg: 'bg-amber-50', border: 'border-amber-100', avatar: 'from-amber-400 to-orange-500' },
    ];

    const color = colors[index % colors.length];

    return (
        <div
            className={`
                relative ${color.bg} ${color.border} border-2
                rounded-2xl p-6 lg:p-8
                shadow-sm hover:shadow-lg
                transition-all duration-300
                transform hover:-translate-y-1
            `}
        >
            {/* Quote mark */}
            <div className="absolute -top-3 left-6 text-4xl text-slate-300 font-serif">"</div>

            {/* Quote text */}
            <p className="text-slate-600 italic text-base lg:text-lg leading-relaxed mb-6 pt-2">
                "{quote}"
            </p>

            {/* Author info */}
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${color.avatar} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                    {author.charAt(0)}
                </div>
                <div>
                    <p className="font-semibold text-slate-800">— {author}</p>
                    <p className="text-sm text-slate-500">{role}</p>
                </div>
            </div>

            {/* Decorative corner */}
            <div className="absolute bottom-3 right-3 text-2xl opacity-30">💬</div>
        </div>
    );
}
