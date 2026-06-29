var jwt = require("jsonwebtoken");
function generateToken(obj) {
  const SecretKey = process.env.SECRET_JWT;
  return jwt.sign({ role: obj.role, _id: obj._id }, SecretKey, {
    expiresIn: "7d",
  });
}

module.exports = generateToken;
