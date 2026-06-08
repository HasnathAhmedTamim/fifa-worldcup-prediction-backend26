import { z } from "zod";

export const createMatchSchema = z.object({
  match_no: z.number().optional(),

  team_a: z.string().optional(),
  team_b: z.string().optional(),

  team_a_placeholder: z.string().optional(),
  team_b_placeholder: z.string().optional(),

  match_date: z.string(),
  match_time: z.string(),
  kickoff_at: z.string(),

  stage: z.enum(["group", "knockout"]),

  round_name: z.string().optional(),
  group_name: z.string().optional(),
  venue: z.string().optional(),

  status: z
    .enum(["pending", "upcoming", "live", "completed", "cancelled"])
    .optional(),
});

export const updateResultSchema = z.object({
  actual_team_a_score: z.number().int().min(0),
  actual_team_b_score: z.number().int().min(0),
  actual_qualifier: z.string().optional(),
});

export const confirmTeamsSchema = z.object({
  team_a: z.string().min(1),
  team_b: z.string().min(1),
});
