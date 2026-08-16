import { z } from "zod";

export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(200),
  type: z
    .enum([
      "name",
      "phone",
      "surveyId",
      "householdId",
      "ward",
      "street",
      "area",
      "houseNumber",
    ])
    .optional(),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(20),
});

export type SearchInput = z.infer<typeof searchSchema>;
