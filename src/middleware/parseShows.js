const parseShows = (req, res, next) => {
  if (req.body.shows) {
    try {
      req.body.shows = JSON.parse(req.body.shows);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid shows JSON",
      });
    }
  }

  next();
};

module.exports = parseShows;
