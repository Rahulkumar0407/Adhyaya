/**
 * Socket.io events and logic
 */
const socketService = (io) => {
    io.on('connection', (socket) => {
        console.log(`New connection: ${socket.id}`);

        // Join user room
        socket.on('join:user', (userId) => {
            socket.join(`user:${userId}`);
            console.log(`Socket ${socket.id} joined user:${userId}`);
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
