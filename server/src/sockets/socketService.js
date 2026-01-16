/**
 * Socket.io events and logic
 */
const socketService = (io) => {
    io.on('connection', (socket) => {
        console.log(`New connection: ${socket.id}`);

        // Auto-join user room if authenticated
        if (socket.user && socket.user.id) {
            socket.join(`user:${socket.user.id}`);
            console.log(`Socket ${socket.id} auto-joined user:${socket.user.id}`);
        }

        // Join user room (manual fallback)
        socket.on('join:user', (userId) => {
            socket.join(`user:${userId}`);
            console.log(`Socket ${socket.id} manually joined user:${userId}`);
        });

        // Join course/pod room for real-time doubts
        socket.on('join:room', (roomId) => {
            socket.join(`room:${roomId}`);
            console.log(`Socket ${socket.id} joined room:${roomId}`);
        });

        // Real-time chat/doubt
        socket.on('message:send', (data) => {
            const { roomId, message, user } = data;
            io.to(`room:${roomId}`).emit('message:receive', {
                message,
                user,
                timestamp: new Date()
            });
        });

        socket.on('disconnect', () => {
            console.log(`Disconnected: ${socket.id}`);
        });
    });
};

export default socketService;
