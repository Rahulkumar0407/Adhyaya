import { BookOpen } from 'lucide-react';

const subjects = [
    { name: 'DSA (Algorithms)', progress: 100, color: 'bg-purple-500' },
    { name: 'DBMS (Database)', progress: 80, color: 'bg-orange-500' },
    { name: 'OS (Operating System)', progress: 50, color: 'bg-yellow-500' },
    { name: 'Computer Networks', progress: 10, color: 'bg-green-500' },
];

export default function SubjectProgress() {
    const overallProgress = Math.round(subjects.reduce((acc, s) => acc + s.progress, 0) / subjects.length);

    return (
        <div className="bg-[#1f1f1f] rounded-2xl p-6 border border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                    <div>
                        <h3 className="text-lg font-bold text-white">Subject Mein Pakad</h3>
                        <p className="text-sm text-gray-400">Bhai, sab subject barabar leke chalo!</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-white">{overallProgress}%</div>
                    <div className="text-sm text-gray-400">Overall</div>
                </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-4">
                {subjects.map((subject, index) => (
                    <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-300 flex items-center gap-2">
                                <span className={`w-2 h-2 ${subject.color} rounded-full`}></span>
                                {subject.name}
                            </span>
                            <span className="text-sm text-gray-400">{subject.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${subject.color} rounded-full transition-all duration-500`}
                                style={{ width: `${subject.progress}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
