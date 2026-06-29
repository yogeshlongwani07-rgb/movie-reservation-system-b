const mongoose = require("mongoose");

const URL = process.env.MONGO_URL;

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
