const mysql = require("mysql2/promise");
const fs = require("fs");

let pool;

function createMysqlPool() {
  if (pool) return pool;

  const sslEnabled = process.env.MYSQL_SSL === "true";

  pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: sslEnabled
      ? {
          ca: fs.readFileSync(process.env.MYSQL_SSL_CA_PATH, "utf8"),
        }
      : undefined,
  });
  console.log("sql-connected");
  return pool;
}

module.exports = createMysqlPool;
