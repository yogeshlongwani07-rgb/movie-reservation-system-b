const fs = require("fs");
const path = require("path");

const SCHEMA_PATH = path.join(__dirname, "schema.sql");

async function runMigrations(pool) {
  const sql = fs.readFileSync(SCHEMA_PATH, "utf8");

  const statements = sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await pool.query(statement);
  }

  console.log(`mysql-migrated: ${statements.length} statement(s) applied`);
}

module.exports = { runMigrations };
