function registerSeatSocket(io, socket) {
  socket.on("seat:join-show", ({ movieId, showId }) => {
    if (!movieId || !showId) {
      socket.emit("seat:error", {
        message: "movieId and showId are required",
      });
      return;
    }

    const roomName = `show:${movieId}:${showId}`;
    socket.join(roomName);

    socket.emit("seat:joined-show", {
      movieId,
      showId,
      room: roomName,
    });
  });

  socket.on("seat:leave-show", ({ movieId, showId }) => {
    if (!movieId || !showId) {
      return;
    }

    socket.leave(`show:${movieId}:${showId}`);
  });
}

module.exports = registerSeatSocket;
