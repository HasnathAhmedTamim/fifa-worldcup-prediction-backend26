import express from "express";
import { MatchController } from "./match.controller";

const router = express.Router();

router.get("/", MatchController.getAllMatches);
router.get("/today", MatchController.getTodayMatches);
router.get("/by-date", MatchController.getMatchesByDate);
router.get("/:id", MatchController.getMatchById);

export const MatchRoutes = router;
