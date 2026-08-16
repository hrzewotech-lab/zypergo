const { Server } = require('socket.io');

let io;

exports.init = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Set to actual frontend domain in production
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Rider joins their own location room (or global riders room)
    socket.on('join_rider', (data) => {
      const { riderId, lat, lng } = data;
      // In a real app, verify riderId
      socket.join(`rider_${riderId}`);
      // Join a general room to receive broadcasted local bookings
      socket.join('available_riders');
      console.log(`[Socket] Rider ${riderId} joined active rooms.`);
    });

    // Client/Customer joins a room to track a specific booking
    socket.on('join_tracking', (data) => {
      const { trackingId } = data;
      socket.join(`track_${trackingId}`);
      console.log(`[Socket] User tracking booking: ${trackingId}`);
    });

    // Rider emits live location update
    socket.on('location_update', (data) => {
      const { riderId, trackingId, lat, lng } = data;
      // Broadcast to anyone in the tracking room
      io.to(`track_${trackingId}`).emit('rider_location', {
        riderId, lat, lng, timestamp: new Date()
      });
      // Optionally update rider's current location in DB here or via separate API
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};

exports.getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
