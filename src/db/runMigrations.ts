import fs from "fs";
import path from "path";
import { pool } from "../config/db";

const runMigrations = async () => {
  try {
    const schemaPath = path.join(__dirname, "schema.sql");

    const schemaSQL = fs.readFileSync(schemaPath, "utf-8");

    console.log("Running database migration...");

    await pool.query(schemaSQL);

    console.log("Database tables created successfully");

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

runMigrations();
