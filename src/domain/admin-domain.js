const AppError = require("../utils/appError");
const Admin = require("../models/admin");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AdminRepository = require("../repositories/admin.repository");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");
const Movie = require("../models/movie");

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
    const duplicateEmail = await AdminRepository.findByEmail(email);
    if (duplicateEmail) {
      throw new AppError("Email already exist", 409);
    }
    if (password.length < 6) {
      throw new AppError("Password length should be more than 6", 400);
    }
    const saltRounds = Number(process.env.SALT_ROUNDS);

    const hashPassword = await bcrypt.hash(password, saltRounds);
    const newAdmin = await AdminRepository.create({
      name,
      password: hashPassword,
      email,
      role,
    });
    const accessToken = generateAccessToken(newAdmin);
    const refreshToken = generateRefreshToken(newAdmin);
    newAdmin.refreshToken = refreshToken;
    await AdminRepository.save(newAdmin);
    return { accessToken, refreshToken };
  }
  async loginAdmin(email, password) {
    if (!email || !password) {
      throw new AppError("Missing required field", 400);
    }
    email = email.trim().toLowerCase();
    const admin = await AdminRepository.findByEmail(email);
    // const admin = await Admin.findOne({ email });
    if (!admin) {
      throw new AppError("Admin not found", 400);
    }
    const validatePassword = await bcrypt.compare(password, admin.password);
    if (!validatePassword) {
      throw new AppError("Invalid Credentials", 400);
    }
    const accessToken = generateAccessToken(admin);
    const refreshToken = generateRefreshToken(admin);
    admin.refreshToken = refreshToken;
    await AdminRepository.save(admin);
    // await admin.save();
    return { accessToken, refreshToken };
  }

  async deleteAdmin(id) {
    const admin = await AdminRepository.findByIdAndDelete(id);

    if (!admin) {
      throw new AppError("Admin not found", 404);
    }

    await AdminRepository.deleteAdminMovies(id);
  }

  async showAdminMovies(adminId) {
    const admin = await AdminRepository.findByIdWithMovies(adminId);
    if (!admin) {
      throw new AppError("Admin not Found", 404);
    }
    return admin;
  }
  async makeFreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new AppError("Refresh token Not Found", 400);
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const admin = await AdminRepository.findById(decoded._id);
    if (!admin) {
      throw new AppError("Admin not Found", 400);
    }
    if (admin.refreshToken !== refreshToken) {
      throw new AppError("Invalid refresh token", 405);
    }
    const accessToken = generateAccessToken(admin);
    return accessToken;
  }
}

module.exports = new AdminDomain();
