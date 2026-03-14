import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*", // Wide open for assignment purposes
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        socket.on('disconnect', () => {
             console.log(`[Socket] Client disconnected: ${socket.id}`);
        });

        // Simple auth simulation if clients send their user IDs
        socket.on('authenticate', (userId) => {
             socket.join(`user_${userId}`);
             console.log(`[Socket] ${socket.id} authenticated as user_${userId}`);
        });
    });

    console.log('[Socket] Initialized successfully');
    return io;
};

export const broadcastEvent = (eventData) => {
    if (!io) return;

    if (eventData.userId) {
         // Emit to specific user
         io.to(`user_${eventData.userId}`).emit('notification', eventData);
    } else {
         // Global broadcast
         io.emit('notification', eventData);
    }
}
