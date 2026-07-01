require("dotenv").config();
const mongoose = require("mongoose");

const createApp = require("./src/app");
const connectToDb = require("./src/config/connect");

const requiredEnvVars = [
  "MONGO_URL",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
  "SALT_ROUNDS",
  "PASSKEY",
];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`${varName} not found`);
  }
}
let server;
async function startServer() {
  await connectToDb();

  const app = createApp();
  const port = process.env.PORT || 3000;

  server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

async function shutdownServer(signal) {
  console.log(`Received ${signal}. Shutting down server...`);

  if (server) {
    const forceShutdownTimeout = setTimeout(() => {
      console.error("Forcefully shutting down server after 10 seconds");
      process.exit(1);
    }, 10000);

    server.close(async () => {
      try {
        clearTimeout(forceShutdownTimeout);

        console.log("server closed");
        await mongoose.connection.close();
        console.log("MongoDB connection closed");
        process.exit(0);
      } catch (err) {
        console.error("Error during shutdown:", err);
        process.exit(1);
      }
    });
  }
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error(err);
    process.exit(1);
  });

  process.on("SIGINT", () => shutdownServer("SIGINT"));
}

module.exports = { startServer };
