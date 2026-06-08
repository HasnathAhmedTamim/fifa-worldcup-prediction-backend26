import { pool } from "../config/db";

const resetDb = async () => {
  try {
    console.log("Resetting full database...");

    await pool.query(`
      DROP TABLE IF EXISTS missed_predictions CASCADE;
      DROP TABLE IF EXISTS predictions CASCADE;
      DROP TABLE IF EXISTS matches CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    console.log("Full database reset completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Database reset failed:", error);
    process.exit(1);
  }
};

resetDb();
