const Admin = require("../models/admin");
const Movie = require("../models/movie");
const validator = require("validator");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

async function registerAdmin(req, res) {
  try {
    const { name, password, email, role, passkey } = req.body;

    if (!role)
      return res.status(403).json({
        success: false,
        message: "Unauthorized. Only administrators can create admin accounts.",
      });

    if (!passkey || passkey !== process.env.PASSKEY) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. Invalid passkey.",
      });
    }

    if (!name || !password || !email)
      return res
        .status(400)
        .json({ message: "Missing required field", success: false });

    email = email.trim().toLowerCase();

    if (!validator.isEmail(email))
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });

    const duplicateEmail = await Admin.findOne({ email });

    if (duplicateEmail)
      return res
        .status(409)
        .json({ message: "Email already exist", success: false });

    if (password.length < 6)
      return res.status(400).json({
        message: "Password length should be more than 6",
        success: false,
      });
    const saltRounds = Number(process.env.SALT_ROUNDS);

    const hashPassword = await bcrypt.hash(password, saltRounds);

    const newAdmin = await Admin.create({
      name,
      password: hashPassword,
      email,
      role,
    });
    const token = generateToken(newAdmin);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res
      .status(201)
      .json({ message: "Account Created", success: true, token: token });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      message: "Unexpected Error",
      success: false,
    });
  }
}

async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Missing required field", success: false });

    email = email.trim().toLowerCase();

    const admin = await Admin.findOne({ email });
    if (!admin)
      return res
        .status(400)
        .json({ message: "Admin not found", success: false });
    const validatePassword = await bcrypt.compare(password, admin.password);
    if (!validatePassword)
      return res
        .status(400)
        .json({ message: "Invalid Credentials", success: false });

    const token = generateToken(admin);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res
      .status(200)
      .json({ message: "Your are Login!", success: true, token: token });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      message: "Unexpected Error",
      success: false,
    });
  }
}

async function deleteAdmin(req, res) {
  try {
    let id = req.user._id;
    await Movie.deleteMany({
      createdBy: id,
    });
    const admin = await Admin.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Admin and all movies deleted",
    });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      message: "Unexpected Error",
      success: false,
    });
  }
}
async function checkListedMovies(req, res) {
  try {
    const adminId = req.user._id;
    const admin = await Admin.findById(adminId).populate("movies");
    if (!admin) {
      return res
        .status(404)
        .json({ message: "Admin not found", success: false });
    }
    res.status(200).json({ movies: admin.movies });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      message: "Unexpected Error",
      success: false,
    });
  }
}

module.exports = { registerAdmin, loginAdmin, deleteAdmin, checkListedMovies };
