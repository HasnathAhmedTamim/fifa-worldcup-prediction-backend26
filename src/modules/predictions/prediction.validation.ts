import { z } from "zod";

export const submitPredictionSchema = z.object({
  match_id: z.number(),
  predicted_team_a_score: z.number().int().min(0),
  predicted_team_b_score: z.number().int().min(0),
  predicted_qualifier: z.string().optional(),
});
