import express from "express";
import cors from "cors";

import { MatchRoutes } from "./modules/matches/match.route";
import { AuthRoutes } from "./modules/auth/auth.route";
import { PredictionRoutes } from "./modules/predictions/prediction.route";
import { AdminRoutes } from "./modules/admin/admin.route";
import { LeaderboardRoutes } from "./modules/leaderboard/leaderboard.route";

import { notFoundMiddleware } from "./middleware/notFound.middleware";
import { errorMiddleware } from "./middleware/error.middleware";

export const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://client-kappa-eight-62.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "World Cup Prediction League API running",
  });
});

app.use("/api/auth", AuthRoutes);
app.use("/api/matches", MatchRoutes);
app.use("/api/predictions", PredictionRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/leaderboard", LeaderboardRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
