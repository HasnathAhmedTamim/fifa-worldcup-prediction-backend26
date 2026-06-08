import { pool } from "../config/db";

const checkDb = async () => {
  try {
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    const matchCount = await pool.query(`
      SELECT COUNT(*) FROM matches;
    `);

    console.log("Tables:");
    console.table(tables.rows);

    console.log("Total matches:", matchCount.rows[0].count);

    process.exit(0);
  } catch (error) {
    console.error("Database check failed:", error);
    process.exit(1);
  }
};

checkDb();
