let io;

function setSocketServer(socketServer) {
  io = socketServer;
}

function emitToShow(movieId, showId, eventName, payload) {
  if (!io) {
    return;
  }

  io.to(`show:${movieId}:${showId}`).emit(eventName, payload);
}

module.exports = {
  setSocketServer,
  emitToShow,
};
