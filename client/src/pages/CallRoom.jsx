import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic, MicOff, Video, VideoOff, Phone, PhoneOff,
    MessageCircle, Star, Clock, AlertCircle, X,
    Maximize, Minimize, Settings
} from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// WebRTC configuration
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// Feedback Modal Component
const FeedbackModal = ({ isOpen, onClose, onSubmit, mentorName }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);

    const tags = [
        'helpful', 'knowledgeable', 'patient', 'clear-explanation',
        'good-examples', 'encouraging', 'professional', 'solved-my-doubt'
    ];

    const handleSubmit = () => {
        onSubmit({ rating, feedback, tags: selectedTags });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">How was your session?</h2>
                    <p className="text-gray-500 mt-1">Rate your experience with {mentorName}</p>
                </div>

                {/* Star Rating */}
                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="p-1 transition-transform hover:scale-110"
                        >
                            <Star
                                className={`w-10 h-10 ${star <= (hoveredRating || rating)
                                    ? 'text-amber-400 fill-current'
                                    : 'text-gray-200'
                                    }`}
                            />
                        </button>
                    ))}
                </div>

                {/* Quick Tags */}
                <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-3">What made this session great?</p>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTags(prev =>
                                    prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                                )}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedTags.includes(tag)
                                    ? 'bg-violet-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {tag.replace(/-/g, ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Feedback Text */}
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share more about your experience (optional)"
                    className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    rows={3}
                />

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={rating === 0}
                        className="flex-1 px-4 py-3 bg-violet-500 text-white font-medium rounded-xl hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Submit Review
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const CallRoom = () => {
    const { callId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Call state
    const [callData, setCallData] = useState(null);
    const [callStatus, setCallStatus] = useState('connecting'); // connecting, waiting, ongoing, ended
    const [duration, setDuration] = useState(0);
    const [cost, setCost] = useState(0);

    // Media state
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // UI state
    const [showFeedback, setShowFeedback] = useState(false);
    const [error, setError] = useState(null);

    // Refs
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const socketRef = useRef(null);
    const timerRef = useRef(null);

    // Initialize call
    useEffect(() => {
        const initCall = async () => {
            try {
                // Fetch call details
                const response = await api.get(`/calls/${callId}`);
                if (response.data.success) {
                    setCallData(response.data.data);
                }
            } catch (err) {
                console.error('Error fetching call:', err);
                // Mock data for demo
                setCallData({
                    _id: callId,
                    roomId: `call_${callId}`,
                    ratePerMinute: 5,
                    mentor: {
                        user: { name: 'Rahul Sharma' },
                        headline: 'SDE @ Google'
                    },
                    status: 'waiting'
                });
            }
        };

        initCall();
    }, [callId]);

    // Initialize WebRTC and Socket
    useEffect(() => {
        if (!callData?.roomId) return;

        const initWebRTC = async () => {
            try {
                // Get local media stream
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                localStreamRef.current = stream;

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // Initialize socket connection (remove /api if present for socket base)
                const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');
                const socket = io(socketUrl);
                socketRef.current = socket;

                // Join call room
                socket.emit('join-call', callData.roomId);

                // Socket event handlers
                socket.on('call-created', () => {
                    console.log('Call room created, waiting for other participant');
                    setCallStatus('waiting');
                });

                socket.on('call-joined', () => {
                    console.log('Joined call room');
                });

                socket.on('call-ready', () => {
                    console.log('Both participants ready, creating offer');
                    createOffer();
                });

                socket.on('call-offer', async ({ offer }) => {
                    console.log('Received offer');
                    await handleOffer(offer);
                });

                socket.on('call-answer', async ({ answer }) => {
                    console.log('Received answer');
                    await handleAnswer(answer);
                });

                socket.on('ice-candidate', async ({ candidate }) => {
                    if (peerConnectionRef.current && candidate) {
                        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                });

                socket.on('call-ended', () => {
                    endCall(false);
                });

                socket.on('call-full', () => {
                    setError('This call room is full');
                });

            } catch (err) {
                console.error('Error initializing WebRTC:', err);
                setError('Unable to access camera/microphone. Please check permissions.');
            }
        };

        initWebRTC();

        return () => {
            // Cleanup
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
            if (socketRef.current) {
                socketRef.current.emit('leave-call', callData?.roomId);
                socketRef.current.disconnect();
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [callData?.roomId]);

    // Create peer connection
    const createPeerConnection = () => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        // Add local stream tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        // Handle remote stream
        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
            setCallStatus('ongoing');
            startTimer();

            // Notify server that call started
            api.patch(`/calls/${callId}/start`).catch(console.error);
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('ice-candidate', {
                    roomId: callData.roomId,
                    candidate: event.candidate
                });
            }
        };

        pc.onconnectionstatechange = () => {
            console.log('Connection state:', pc.connectionState);
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                endCall(false);
            }
        };

        peerConnectionRef.current = pc;
        return pc;
    };

    // Create and send offer
    const createOffer = async () => {
        const pc = createPeerConnection();
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socketRef.current.emit('call-offer', {
            roomId: callData.roomId,
            offer: pc.localDescription
        });
    };

    // Handle incoming offer
    const handleOffer = async (offer) => {
        const pc = createPeerConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socketRef.current.emit('call-answer', {
            roomId: callData.roomId,
            answer: pc.localDescription
        });
    };

    // Handle incoming answer
    const handleAnswer = async (answer) => {
        if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
    };

    // Start call timer
    const startTimer = () => {
        if (timerRef.current) return;

        timerRef.current = setInterval(() => {
            setDuration(prev => {
                const newDuration = prev + 1;
                setCost(Math.ceil(newDuration / 60) * (callData?.ratePerMinute || 5));
                return newDuration;
            });
        }, 1000);
    };

    // Format duration
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Toggle mute
    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    // Toggle video
    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    // End call
    const endCall = async (showFeedbackModal = true) => {
        setCallStatus('ended');

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        try {
            await api.patch(`/calls/${callId}/end`);
        } catch (err) {
            console.error('Error ending call:', err);
        }

        if (showFeedbackModal) {
            setShowFeedback(true);
        }
    };

    // Submit feedback
    const handleFeedbackSubmit = async (feedbackData) => {
        try {
            await api.post(`/calls/${callId}/review`, feedbackData);
        } catch (err) {
            console.error('Error submitting feedback:', err);
        }
        navigate('/mentors/list');
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Join Call</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/mentors/list')}
                        className="px-6 py-3 bg-violet-500 text-white font-medium rounded-xl hover:bg-violet-600 transition-colors"
                    >
                        Back to Mentors
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Header */}
            <div className="bg-gray-800/50 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold">
                        {callData?.mentor?.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'M'}
                    </div>
                    <div>
                        <h2 className="text-white font-semibold">{callData?.mentor?.user?.name || 'Mentor'}</h2>
                        <p className="text-gray-400 text-sm">{callData?.mentor?.headline || ''}</p>
                    </div>
                </div>

                {/* Call info */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-white">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="font-mono text-lg">{formatDuration(duration)}</span>
                    </div>
                    <div className="bg-emerald-500/20 px-4 py-2 rounded-full">
                        <span className="text-emerald-400 font-semibold">₹{cost}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${callStatus === 'ongoing' ? 'bg-red-500/20 text-red-400' :
                        callStatus === 'waiting' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-gray-500/20 text-gray-400'
                        }`}>
                        {callStatus === 'ongoing' && (
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                                Live
                            </span>
                        )}
                        {callStatus === 'waiting' && 'Waiting...'}
                        {callStatus === 'connecting' && 'Connecting...'}
                        {callStatus === 'ended' && 'Call Ended'}
                    </div>
                </div>
            </div>

            {/* Video Area */}
            <div className="flex-1 relative">
                {/* Remote Video (Large) */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />

                {/* Waiting overlay */}
                {callStatus === 'waiting' && (
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-20 h-20 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <h3 className="text-white text-xl font-semibold">Waiting for mentor to join...</h3>
                            <p className="text-gray-400 mt-2">Your call will start automatically</p>
                        </div>
                    </div>
                )}

                {/* Local Video (Picture-in-Picture) */}
                <div className="absolute bottom-24 right-4 w-48 h-36 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                    {isVideoOff && (
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                            <VideoOff className="w-8 h-8 text-gray-500" />
                        </div>
                    )}
                </div>

                {/* Per-minute rate reminder */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
                    ₹{callData?.ratePerMinute || 5}/min
                </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800/80 backdrop-blur-sm px-4 py-6">
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={toggleMute}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                    >
                        {isMuted ? (
                            <MicOff className="w-6 h-6 text-white" />
                        ) : (
                            <Mic className="w-6 h-6 text-white" />
                        )}
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                    >
                        {isVideoOff ? (
                            <VideoOff className="w-6 h-6 text-white" />
                        ) : (
                            <Video className="w-6 h-6 text-white" />
                        )}
                    </button>

                    <button
                        onClick={() => endCall(true)}
                        className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                    >
                        <PhoneOff className="w-7 h-7 text-white" />
                    </button>

                    <button
                        onClick={toggleFullscreen}
                        className="w-14 h-14 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
                    >
                        {isFullscreen ? (
                            <Minimize className="w-6 h-6 text-white" />
                        ) : (
                            <Maximize className="w-6 h-6 text-white" />
                        )}
                    </button>
                </div>

                {/* Cost summary */}
                <div className="text-center mt-4">
                    <p className="text-gray-400 text-sm">
                        Duration: {formatDuration(duration)} • Estimated cost: ₹{cost}
                    </p>
                </div>
            </div>

            {/* Feedback Modal */}
            <AnimatePresence>
                {showFeedback && (
                    <FeedbackModal
                        isOpen={showFeedback}
                        onClose={() => navigate('/mentors/list')}
                        onSubmit={handleFeedbackSubmit}
                        mentorName={callData?.mentor?.user?.name || 'the mentor'}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default CallRoom;
