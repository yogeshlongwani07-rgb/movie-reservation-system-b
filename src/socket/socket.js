const { Server } = require("socket.io");
const { setSocketServer } = require("../socket/socketManager");

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

    socket.on("disconnect", (socket) => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = { initializeSocket };
