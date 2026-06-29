var jwt = require("jsonwebtoken");
function generateAccessToken(obj) {
  const SecretKey = process.env.ACCESS_TOKEN_SECRET;
  return jwt.sign({ role: obj.role, _id: obj._id }, SecretKey, {
    expiresIn: "15m",
  });
}

function generateRefreshToken(obj) {
  const SecretKey = process.env.REFRESH_TOKEN_SECRET;
  return jwt.sign({ role: obj.role, _id: obj._id }, SecretKey, {
    expiresIn: "7d",
  });
}
module.exports = { generateAccessToken, generateRefreshToken };
