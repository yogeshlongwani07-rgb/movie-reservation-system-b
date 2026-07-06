let io;

function setSocketServer(socketServer) {
  io = socketServer;
}

function getSocketServer() {
  if (!io) {
    throw new Error("Socket.IO server has not been initialized");
  }
  return io;
}

function emitToShow(movieId, showId, eventName, payload) {
  if (!io) {
    return;
  }

  io.to(`show:${movieId}:${showId}`).emit(eventName, payload);
}

module.exports = {
  setSocketServer,
  getSocketServer,
  emitToShow,
};
