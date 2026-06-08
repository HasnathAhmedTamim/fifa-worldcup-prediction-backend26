import fs from "fs";
import path from "path";
import { pool } from "../config/db";

const runSeed = async () => {
  try {
    const seedPath = path.join(__dirname, "world_cup_2026_matches_seed.sql");

    const seedSQL = fs.readFileSync(seedPath, "utf-8");

    console.log("Running fixture seed...");

    await pool.query(seedSQL);

    console.log("World Cup fixtures inserted successfully");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

runSeed();
