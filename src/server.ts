import { app } from "./app";
import { env } from "./config/env";
import { pool } from "./config/db";

const startServer = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("Database connected successfully");

    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
};

startServer();
