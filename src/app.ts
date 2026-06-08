import express from "express";
import cors from "cors";

export const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", process.env.CLIENT_URL || ""],
    credentials: true,
  }),
);

app.use(express.json());

// your routes here
// app.use("/api/auth", authRoutes);
// app.use("/api/matches", matchRoutes);
// app.use("/api/predictions", predictionRoutes);
// app.use("/api/leaderboard", leaderboardRoutes);
// app.use("/api/admin", adminRoutes);
