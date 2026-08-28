const fs = require("fs");
const path = require("path");

const SCHEMA_PATH = path.join(__dirname, "schema.sql");

async function runMigrations(pool) {
  const sql = fs.readFileSync(SCHEMA_PATH, "utf8");

  const statements = sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const statement of statements) {
      await connection.query(statement);
    }
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  console.log(`✅ mysql-migrated: ${statements.length} statement(s) applied`);
}

module.exports = { runMigrations };
