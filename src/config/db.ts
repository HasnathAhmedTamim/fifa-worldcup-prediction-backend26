import { Pool } from "pg";
import { env } from "./env";

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is missing in .env file");
}

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});
