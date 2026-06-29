var jwt = require("jsonwebtoken");

function isLoggedIn(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token)
      return res
        .status(400)
        .json({ message: "Please log in first", success: false });
    const SECRET_JWT = process.env.SECRET_JWT;
    const decode = jwt.verify(token, SECRET_JWT);
    req.user = decode;
    next();
  } catch (err) {
    console.log("error", err);
    res.status(400).json({ message: "Unexpected Error", success: false });
  }
}

function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
  if (req.user.role !== "admin")
    return res.status(403).json({
      message: "Only admin can add/update/delete movie listings",
      success: false,
    });

  next();
}

function isUser(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
  if (req.user.role !== "user")
    return res.status(403).json({
      message: "Only user can book Movies",
      success: false,
    });

  next();
}

module.exports = { isLoggedIn, isAdmin, isUser };
