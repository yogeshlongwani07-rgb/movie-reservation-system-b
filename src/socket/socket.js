const { Server } = require("socket.io");
const { setSocketServer } = require("../socket/socketManager");
const registerSeatSocket = require("../socket/seat.socket");

function initializeSocket(httpServer) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const io = new Server(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.ALLOWED_ORIGINS?.split(",") || frontendUrl
          : frontendUrl,
      credentials: true,
    },
  });

  setSocketServer(io);

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    registerSeatSocket(io, socket);
    socket.on("disconnect", (reason) => {
      console.log("Client disconnected:", socket.id, reason);
    });
  });

  return io;
}

module.exports = { initializeSocket };
