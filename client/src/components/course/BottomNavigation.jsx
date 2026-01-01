import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function BottomNavigation({ courseId, previous, next }) {
    return (
        <div className="bg-white border-t border-gray-200 sticky bottom-0">
            <div className="max-w-4xl mx-auto px-8 py-6">
                <div className="flex items-center justify-between">
                    {/* Previous Button */}
                    <div className="flex-1">
                        {previous ? (
                            <Link
                                to={`/course/${courseId}/${previous.slug}`}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                                <div className="text-left">
                                    <div className="text-xs text-gray-500 mb-0.5">Previous</div>
                                    <div className="text-sm font-medium text-gray-900">{previous.title}</div>
                                </div>
                            </Link>
                        ) : (
                            <div className="px-6 py-3 text-gray-400 text-sm">No previous topic</div>
                        )}
                    </div>

                    {/* Next Button */}
                    <div className="flex-1 flex justify-end">
                        {next ? (
                            <Link
                                to={`/course/${courseId}/${next.slug}`}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors group"
                            >
                                <div className="text-right">
                                    <div className="text-xs text-blue-100 mb-0.5">Next</div>
                                    <div className="text-sm font-medium">{next.title}</div>
                                </div>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <div className="px-6 py-3 text-gray-400 text-sm">No next topic</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

