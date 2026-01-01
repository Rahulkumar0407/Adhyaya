import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eraser, Pen, Download, Send, RotateCcw } from 'lucide-react';

const WhiteboardModal = ({ isOpen, onClose, onSend }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#ffffff');
    const [lineWidth, setLineWidth] = useState(2);
    const [tool, setTool] = useState('pen'); // pen, eraser

    useEffect(() => {
        if (isOpen && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Set canvas size
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;

            // Set initial styles
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;

            // White background (or dark for dark mode) or transparent
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, [isOpen]);

    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.strokeStyle = tool === 'eraser' ? '#0f172a' : color;
            ctx.lineWidth = tool === 'eraser' ? 20 : lineWidth;
        }
    }, [color, lineWidth, tool]);

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const handleSend = () => {
        const canvas = canvasRef.current;
        const imageUrl = canvas.toDataURL('image/png');
        onSend(imageUrl);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            >
                <div className="bg-slate-900 w-full max-w-4xl h-[80vh] rounded-2xl border border-slate-700 flex flex-col overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="flex gap-2 bg-slate-700 p-1 rounded-lg">
                                <button
                                    onClick={() => setTool('pen')}
                                    className={`p-2 rounded ${tool === 'pen' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <Pen className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setTool('eraser')}
                                    className={`p-2 rounded ${tool === 'eraser' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <Eraser className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="h-8 w-px bg-slate-600" />

                            <div className="flex gap-2">
                                {['#ffffff', '#ef4444', '#22c55e', '#3b82f6', '#eab308'].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => {
                                            setColor(c);
                                            setTool('pen');
                                        }}
                                        className={`w-6 h-6 rounded-full border-2 ${color === c && tool === 'pen' ? 'border-white scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>

                            <div className="h-8 w-px bg-slate-600" />

                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={lineWidth}
                                onChange={(e) => setLineWidth(parseInt(e.target.value))}
                                className="w-24"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={clearCanvas}
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                                title="Clear"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleSend}
                                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
                            >
                                <Send className="w-4 h-4" />
                                Send
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 relative cursor-crosshair">
                        <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            className="absolute inset-0 w-full h-full"
                        />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default WhiteboardModal;
