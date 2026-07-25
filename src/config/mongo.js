const mongoose = require("mongoose");

const URL = process.env.MONGO_URL;

async function connectToMongo() {
  try {
    await mongoose.connect(URL);
    console.log("mongoDB-connected");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
}

module.exports = connectToMongo;
