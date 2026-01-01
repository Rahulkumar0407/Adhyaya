import { GooeyText } from './GooeyText';

export default function Loader() {
    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{
                background: 'linear-gradient(135deg, #1a1209 0%, #0f0f0f 50%, #1a0f0a 100%)',
            }}
        >
            {/* Logo */}
            <div className="mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <img src="/favicon.png" alt="Adhyaya Logo" className="w-10 h-10 object-contain" />
                </div>
            </div>

            {/* Gooey Text Animation */}
            <GooeyText
                texts={["Adhyaya", "Loading...", "DSA Seekho", "Placement Pao"]}
                morphTime={1.5}
                cooldownTime={0.5}
                className="h-20 w-full max-w-lg"
                textClassName="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"
            />

            {/* Subtitle */}
            <p className="mt-8 text-gray-500 text-sm animate-pulse">
                Thoda ruko, maza aayega...
            </p>

            {/* Loading bar */}
            <div className="mt-6 w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full animate-loading-bar"
                />
            </div>
        </div>
    );
}
