import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

const BookingModal = ({ isOpen, onClose, mentor, onConfirm }) => {
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedDuration, setSelectedDuration] = useState(15);
    const [notes, setNotes] = useState('');

    // Duration options in minutes
    const durationOptions = [5, 10, 15, 30, 45, 60];

    // Generate next 7 days
    const dates = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1); // Start from tomorrow
        return {
            date: d,
            day: d.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNum: d.getDate(),
            fullDate: d.toISOString().split('T')[0]
        };
    });

    // Mock time slots (would naturally come from API based on availability)
    const timeSlots = [
        '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
    ];

    const handleConfirm = () => {
        if (!selectedDate || !selectedTime) return;

        onConfirm({
            date: selectedDate.fullDate,
            time: selectedTime,
            duration: selectedDuration,
            notes,
            mentorId: mentor._id
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-[#12121a] border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-[#0f0f15]">
                        <div>
                            <h3 className="text-xl font-bold text-white">Schedule Session</h3>
                            <p className="text-sm text-gray-500">with {mentor?.user?.name}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto custom-scrollbar">
                        {/* Step 1: Select Date */}
                        <div className="mb-8">
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
                                <Calendar className="w-4 h-4 text-orange-500" />
                                Select Date
                            </h4>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {dates.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedDate(item);
                                            setSelectedTime(null);
                                        }}
                                        className={`flex flex-col items-center justify-center min-w-[70px] p-3 rounded-xl border transition-all ${selectedDate?.fullDate === item.fullDate
                                            ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                                            : 'bg-[#1a1a24] border-gray-800 text-gray-400 hover:border-gray-600 hover:bg-[#20202b]'
                                            }`}
                                    >
                                        <span className="text-xs font-medium opacity-80">{item.day}</span>
                                        <span className="text-lg font-bold">{item.dayNum}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Step 2: Select Time */}
                        <div className={`mb-8 transition-opacity duration-300 ${!selectedDate ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
                                <Clock className="w-4 h-4 text-orange-500" />
                                Select Time (IST)
                            </h4>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {timeSlots.map((time, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedTime(time)}
                                        className={`px-3 py-2 text-sm rounded-lg border transition-all ${selectedTime === time
                                            ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                                            : 'bg-[#1a1a24] border-gray-800 text-gray-400 hover:border-gray-600'
                                            }`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className={`transition-opacity duration-300 ${!selectedTime ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                            <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                                Topic / Agenda
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="What you want to discuss..."
                                className="w-full bg-[#1a1a24] border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors resize-none h-24"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-800 bg-[#0f0f15]">
                        {/* Duration Selector */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                                Select Duration
                            </label>
                            <div className="flex gap-2">
                                {durationOptions.map((duration) => (
                                    <button
                                        key={duration}
                                        onClick={() => setSelectedDuration(duration)}
                                        className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-all ${selectedDuration === duration
                                            ? 'bg-orange-500/20 border-orange-500 text-orange-400 font-bold'
                                            : 'bg-[#1a1a24] border-gray-800 text-gray-400 hover:border-gray-600'
                                            }`}
                                    >
                                        {duration} mins
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-4 text-sm">
                            <span className="text-gray-400">Total Duration</span>
                            <span className="text-white font-medium">{selectedDuration} mins</span>
                        </div>
                        <div className="flex items-center justify-between mb-6 text-sm">
                            <span className="text-gray-400">Estimated Cost</span>
                            <span className="text-white font-bold text-lg">
                                ₹{(mentor?.ratePerMinute || 0) * selectedDuration}
                            </span>
                        </div>

                        <button
                            onClick={handleConfirm}
                            disabled={!selectedDate || !selectedTime}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${selectedDate && selectedTime
                                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.02]'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            Confirm Booking
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BookingModal;
