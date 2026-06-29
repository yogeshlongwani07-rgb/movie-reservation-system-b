const AppError = require("../utils/appError");
const Admin = require("../models/admin");
const validator = require("validator");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

class AdminDomain {
  async createAdmin(name, password, email, role, passkey) {
    if (!role) {
      throw new AppError(
        "Unauthorized. Only administrators can create admin accounts",
        400,
      );
    }

    if (!passkey || passkey !== process.env.PASSKEY) {
      throw new AppError("Unauthorized. Invalid passkey", 403);
    }
    if (!name || !password || !email) {
      throw new AppError("Missing required field", 400);
    }
    email = email.trim().toLowerCase();
    if (!validator.isEmail(email)) {
      throw new AppError("Invalid email address", 400);
    }
    const duplicateEmail = await Admin.findOne({ email });
    if (duplicateEmail) {
      throw new AppError("Email already exist", 409);
    }
    if (password.length < 6) {
      throw new AppError("Password length should be more than 6", 400);
    }
    const saltRounds = Number(process.env.SALT_ROUNDS);

    const hashPassword = await bcrypt.hash(password, saltRounds);
    const newAdmin = await Admin.create({
      name,
      password: hashPassword,
      email,
      role,
    });
    const token = generateToken(newAdmin);
    return { token };
  }
}

module.exports = new AdminDomain();
