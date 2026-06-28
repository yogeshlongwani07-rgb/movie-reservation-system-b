const mongoose = require("mongoose");

const URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/cinema";

async function connectToDb() {
  try {
    await mongoose.connect(URL);
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
}

module.exports = connectToDb;
