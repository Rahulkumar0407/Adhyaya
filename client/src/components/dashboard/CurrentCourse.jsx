import { Link } from 'react-router-dom';
import { Play, Code2 } from 'lucide-react';

export default function CurrentCourse() {
    return (
        <div className="bg-gradient-to-br from-[#2a1f1a] to-[#1f1f1f] rounded-2xl p-6 border border-orange-500/20">
            <div className="flex items-start gap-6">
                {/* Course Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Code2 className="w-8 h-8 text-white" />
                </div>

                {/* Course Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-gray-700 text-gray-300 text-xs font-medium rounded-full">
                            ABHI CHAL RAHA HAI
                        </span>
                        <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full flex items-center gap-1">
                            🔥 Garma Garam
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">
                        Data Structures & Algorithms
                    </h3>
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                        <span>📖</span>
                        Lecture 4: Dynamic Programming ka Chakravyuh
                    </p>
                </div>

                {/* Progress */}
                <div className="text-right flex-shrink-0">
                    <div className="text-sm text-gray-400 mb-1">Kitna hua?</div>
                    <div className="text-4xl font-bold text-green-400 mb-3">65%</div>
                    {/* Progress Bar */}
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
                        <div className="h-full w-[65%] bg-gradient-to-r from-green-500 to-green-400 rounded-full"></div>
                    </div>
                    <Link
                        to="/course/dsa"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <Play className="w-4 h-4" />
                        Chalo Padhai Shuru Karein
                    </Link>
                </div>
            </div>
        </div>
    );
}
