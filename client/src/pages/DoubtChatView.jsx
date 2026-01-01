import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Code, Image as ImageIcon, ArrowLeft, Star,
    CheckCircle2, Clock, Brain, Play, Pause, Mic, Square, Trash2, Pen
} from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import WhiteboardModal from '../components/common/WhiteboardModal';

const DoubtChatView = () => {
    const { doubtId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    const [doubt, setDoubt] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [showWhiteboard, setShowWhiteboard] = useState(false);

    // Voice Recording States
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    // Socket.io connection for real-time messaging
    useEffect(() => {
        const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');
        socketRef.current = io(socketUrl, {
            transports: ['websocket', 'polling']
        });

        // Join doubt room
        socketRef.current.emit('join:room', doubtId);

        // Listen for incoming messages
        socketRef.current.on('message:receive', (data) => {
            // Only add if not from self (to avoid duplicates)
            if (data.user?._id !== user?._id) {
                setMessages(prev => [...prev, {
                    _id: Date.now(),
                    content: data.message,
                    sender: data.user,
                    senderType: data.senderType || 'user',
                    messageType: data.messageType || 'text',
                    voiceNote: data.voiceNote,
                    whiteboard: data.whiteboard,
                    createdAt: data.timestamp || new Date()
                }]);
            }
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leave:room', doubtId);
                socketRef.current.disconnect();
            }
        };
    }, [doubtId, user?._id]);

    useEffect(() => {
        fetchDoubtDetails();
    }, [doubtId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchDoubtDetails = async () => {
        try {
            const response = await api.get(`/doubts/${doubtId}`);
            if (response.data.success) {
                setDoubt(response.data.data.doubt);
                setMessages(response.data.data.messages);
            }
        } catch (error) {
            console.error('Failed to fetch doubt:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || sending) return;

        const messageContent = newMessage;
        setNewMessage(''); // Clear immediately for better UX

        try {
            setSending(true);
            const response = await api.post(`/doubts/${doubtId}/message`, {
                content: messageContent,
                messageType: 'text'
            });

            if (response.data.success) {
                const savedMessage = response.data.data;
                setMessages(prev => [...prev, savedMessage]);

                // Emit to socket for real-time delivery to other participants
                if (socketRef.current) {
                    socketRef.current.emit('message:send', {
                        roomId: doubtId,
                        message: messageContent,
                        messageType: 'text',
                        user: {
                            _id: user._id,
                            name: user.name
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setNewMessage(messageContent); // Restore message on failure
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleResolve = async () => {
        try {
            await api.put(`/doubts/${doubtId}/resolve`);
            setShowResolveModal(true);
        } catch (error) {
            console.error('Failed to resolve doubt:', error);
        }
    };

    const handleSubmitRating = async () => {
        try {
            await api.put(`/doubts/${doubtId}/rate`, {
                rating,
                isHelpful: rating >= 4
            });
            navigate('/doubts');
        } catch (error) {
            console.error('Failed to submit rating:', error);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                // Determine if we should send or just stop
                // Logic moved to explicit send handler
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone');
        }
    };

    const stopAndSendRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Audio = reader.result;

                    try {
                        setSending(true);
                        // Send as voice message
                        const response = await api.post(`/doubts/${doubtId}/message`, {
                            messageType: 'voice',
                            voiceNote: {
                                url: base64Audio, // In real app, upload to S3 first
                                duration: recordingTime
                            }
                        });

                        if (response.data.success) {
                            setMessages(prev => [...prev, response.data.data]);
                            // Emit to socket for real-time delivery
                            if (socketRef.current) {
                                socketRef.current.emit('message:send', {
                                    roomId: doubtId,
                                    messageType: 'voice',
                                    voiceNote: { url: base64Audio, duration: recordingTime },
                                    user: { _id: user._id, name: user.name }
                                });
                            }
                        }
                    } catch (error) {
                        console.error('Failed to send voice note:', error);
                    } finally {
                        setSending(false);
                    }
                };

                // Stop tracks
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const handleSendWhiteboard = async (imageUrl) => {
        try {
            setSending(true);
            const response = await api.post(`/doubts/${doubtId}/message`, {
                messageType: 'whiteboard',
                whiteboard: {
                    imageUrl: imageUrl
                }
            });

            if (response.data.success) {
                setMessages(prev => [...prev, response.data.data]);
                // Emit to socket for real-time delivery
                if (socketRef.current) {
                    socketRef.current.emit('message:send', {
                        roomId: doubtId,
                        messageType: 'whiteboard',
                        whiteboard: { imageUrl },
                        user: { _id: user._id, name: user.name }
                    });
                }
            }
        } catch (error) {
            console.error('Failed to send whiteboard:', error);
            alert('Failed to send whiteboard');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <Brain className="w-16 h-16 text-cyan-400 animate-pulse" />
            </div>
        );
    }

    const isStudent = doubt?.student?._id === user?._id;
    const statusColors = {
        'pending': 'amber',
        'ai-reviewed': 'violet',
        'mentor-assigned': 'cyan',
        'answered': 'emerald',
        'resolved': 'green'
    };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col">
            {/* Header */}
            <div className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 p-4">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/doubts')}
                            className="text-slate-400 hover:text-white"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>

                        {doubt?.assignedMentor && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 flex items-center justify-center">
                                    <span className="text-white font-bold">
                                        {doubt.assignedMentor.name?.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{doubt.assignedMentor.name}</h3>
                                    {doubt.mentorMatchScore && (
                                        <p className="text-xs text-cyan-400">{doubt.mentorMatchScore}% Match</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-full bg-${statusColors[doubt?.status]}-500/20 border border-${statusColors[doubt?.status]}-500/50`}>
                            <span className={`text-xs font-bold text-${statusColors[doubt?.status]}-400`}>
                                {doubt?.status.toUpperCase().replace('-', ' ')}
                            </span>
                        </div>

                        {isStudent && doubt?.status === 'answered' && !doubt?.isResolved && (
                            <button
                                onClick={handleResolve}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-sm hover:shadow-lg transition-all"
                            >
                                <CheckCircle2 className="w-4 h-4 inline mr-2" />
                                Mark Resolved
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 container mx-auto overflow-y-auto p-4 space-y-4">
                {/* Doubt Details Card */}
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">{doubt?.title}</h2>
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <span>{doubt?.subject}</span>
                                <span>•</span>
                                <span>{doubt?.subTopic}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {new Date(doubt?.createdAt).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-white">₹{doubt?.totalPrice}</p>
                            <p className="text-xs text-slate-500">Payment pending</p>
                        </div>
                    </div>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{doubt?.description}</p>
                </div>

                {/* Messages Thread */}
                <AnimatePresence>
                    {messages.map((msg, idx) => {
                        const isOwnMessage = msg.sender?._id === user?._id;
                        const isAI = msg.senderType === 'ai';

                        return (
                            <motion.div
                                key={msg._id || idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[70%] ${isAI ? 'mx-auto' :
                                    isOwnMessage ? 'bg-gradient-to-r from-cyan-500 to-violet-500' :
                                        'bg-slate-800'
                                    } rounded-2xl p-4`}>
                                    {isAI && (
                                        <div className="flex items-center gap-2 mb-2 text-violet-400">
                                            <Brain className="w-4 h-4" />
                                            <span className="text-xs font-bold">AI HINT</span>
                                        </div>
                                    )}

                                    {!isOwnMessage && !isAI && (
                                        <p className="text-xs font-bold text-cyan-400 mb-1">
                                            {msg.sender?.name}
                                        </p>
                                    )}

                                    {msg.messageType === 'voice' && msg.voiceNote ? (
                                        <div className="flex items-center gap-3">
                                            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                                <Play className="w-5 h-5" />
                                            </button>
                                            <div className="flex-1">
                                                <div className="h-1 bg-white/20 rounded-full">
                                                    <div className="h-full w-0 bg-white rounded-full" />
                                                </div>
                                                <p className="text-xs text-slate-400 mt-1">{msg.voiceNote.duration}s</p>
                                            </div>
                                        </div>
                                    ) : msg.messageType === 'whiteboard' && msg.whiteboard ? (
                                        <div>
                                            <img
                                                src={msg.whiteboard.imageUrl}
                                                alt="Whiteboard"
                                                className="rounded-xl max-w-full mb-2"
                                            />
                                            <p className="text-xs text-slate-400">Hand-drawn explanation</p>
                                        </div>
                                    ) : (
                                        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isOwnMessage ? 'text-white' : 'text-slate-200'
                                            }`}>
                                            {msg.content}
                                        </p>
                                    )}

                                    <p className="text-xs text-slate-400 mt-2">
                                        {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            {!doubt?.isResolved && (
                <div className="bg-slate-900/80 backdrop-blur-xl border-t border-white/10 p-4">
                    <div className="container mx-auto">
                        {isRecording ? (
                            <div className="flex items-center gap-4 bg-slate-800 p-2 rounded-xl border border-slate-700 animate-pulse">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping ml-2" />
                                <span className="text-white font-mono font-bold flex-1">
                                    Recording {formatTime(recordingTime)}
                                </span>

                                <button
                                    onClick={cancelRecording}
                                    className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={stopAndSendRecording}
                                    className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-white hover:shadow-lg hover:scale-105 transition-all"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowWhiteboard(true)}
                                    className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-violet-400 hover:border-violet-500 transition-all"
                                    title="Draw on Whiteboard"
                                >
                                    <Pen className="w-6 h-6" />
                                </button>

                                <button
                                    onClick={startRecording}
                                    className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500 transition-all"
                                    title="Record Voice Note"
                                >
                                    <Mic className="w-6 h-6" />
                                </button>

                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder={isStudent && doubt?.followUpCount >= doubt?.followUpLimit
                                        ? `Follow-up limit reached (₹${doubt?.followUpCount === 2 ? '29' : '49'} for more)`
                                        : "Type your message..."}
                                    disabled={sending || (isStudent && doubt?.followUpCount >= doubt?.followUpLimit)}
                                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                                />

                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim() || sending}
                                    className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 flex items-center justify-center hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Whiteboard Modal */}
            <WhiteboardModal
                isOpen={showWhiteboard}
                onClose={() => setShowWhiteboard(false)}
                onSend={handleSendWhiteboard}
            />

            {/* Rating Modal */}
            {showResolveModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-slate-900 rounded-3xl p-8 max-w-md w-full"
                    >
                        <h3 className="text-2xl font-black text-white mb-4 text-center">Rate Your Experience</h3>
                        <p className="text-slate-400 text-center mb-6">How helpful was the mentor?</p>

                        <div className="flex justify-center gap-2 mb-8">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-12 h-12 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                                    />
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleSubmitRating}
                            disabled={rating === 0}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Submit Rating
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default DoubtChatView;
