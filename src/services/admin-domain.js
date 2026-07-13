const AppError = require("../utils/appError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AdminRepository = require("../repositories/admin.repository");
const { issueSessionTokens } = require("../utils/issueSessionTokens");
const { generateAccessToken } = require("../utils/generateToken");
const { logout, refreshAccessToken } = require("../utils/authFlows");

class AdminDomain {
  async createAdmin(name, password, email, role, passkey) {
    if (!role) {
      throw new AppError(
        "Unauthorized. Only administrators can create admin accounts",
        400,
      );
    }
    if (passkey !== process.env.PASSKEY) {
      throw new AppError("Unauthorized. Invalid passkey", 403);
    }
    const duplicateEmail = await AdminRepository.findByEmail(email);
    if (duplicateEmail) {
      throw new AppError("Email already exist", 409);
    }
    const saltRounds = Number(process.env.SALT_ROUNDS);

    const hashPassword = await bcrypt.hash(password, saltRounds);
    const newAdmin = await AdminRepository.create({
      name,
      password: hashPassword,
      email,
      role,
    });
    return issueSessionTokens(newAdmin, AdminRepository);
  }
  async loginAdmin(email, password) {
    const admin = await AdminRepository.findByEmail(email);
    if (!admin) {
      throw new AppError("Admin not found", 400);
    }
    const validatePassword = await bcrypt.compare(password, admin.password);
    if (!validatePassword) {
      throw new AppError("Invalid Credentials", 400);
    }
    return issueSessionTokens(admin, AdminRepository);
  }

  async deleteAdmin(id, session) {
    const admin = await AdminRepository.findByIdAndDeleteWithSession(
      id,
      session,
    );

    if (!admin) {
      throw new AppError("Admin not found", 404);
    }

    await AdminRepository.deleteAdminMovieswithSession(id, session);
  }

  async getProfile(adminId) {
    const admin = await AdminRepository.findByIdSafe(adminId);
    if (!admin) {
      throw new AppError("Admin not Found", 404);
    }
    return admin;
  }
  async showAdminMovies(adminId) {
    const admin = await AdminRepository.findByIdWithMovies(adminId);
    if (!admin) {
      throw new AppError("Admin not Found", 404);
    }
    return admin;
  }
  async makeFreshAccessToken(refreshToken) {
    return refreshAccessToken(refreshToken, AdminRepository);
  }

  async logout(adminId) {
    return logout(adminId, AdminRepository);
  }
}

module.exports = new AdminDomain();
