import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { MatchRoutes } from "./modules/matches/match.route";
import { AuthRoutes } from "./modules/auth/auth.route";
import { PredictionRoutes } from "./modules/predictions/prediction.route";
import { notFoundMiddleware } from "./middleware/notFound.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import { AdminRoutes } from "./modules/admin/admin.route";
import { LeaderboardRoutes } from "./modules/leaderboard/leaderboard.route";


export const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
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
