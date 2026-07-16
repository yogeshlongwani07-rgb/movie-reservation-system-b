require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const { startLockCleanupJob } = require("./src/jobs/lockCleanup.job");
const createMysqlPool = require("./src/config/mysql");
const { runMigrations } = require("./src/db/mysql/migrate");

const createApp = require("./src/app");
const connectToMongo = require("./src/config/mongo");
const { initializeSocket } = require("./src/socket/socket");

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
let cleanupJob;
async function startServer() {
  await connectToMongo();
  const mysqlPool = await createMysqlPool();
  await runMigrations(mysqlPool);

  const app = createApp();
  const port = process.env.PORT || 3000;
  server = http.createServer(app);
  initializeSocket(server);
  cleanupJob = startLockCleanupJob();
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

async function shutdownServer(signal) {
  console.log(`Received ${signal}. Shutting down server...`);
  if (cleanupJob) {
    clearInterval(cleanupJob);
  }
  if (server) {
    const forceShutdownTimeout = setTimeout(() => {
      console.error("Forcefully shutting down server after 3 seconds");
      process.exit(1);
    }, 3000);

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
