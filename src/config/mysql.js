const mysql = require("mysql2/promise");
const fs = require("fs");

let pool;

async function createMysqlPool() {
  if (pool) return pool;

  pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  return pool;
}

async function closeMysqlPool() {
  if (!pool) return;

  await pool.end();
  pool = undefined;
  console.log("MySQL pool closed");
}

module.exports = { createMysqlPool, closeMysqlPool };
