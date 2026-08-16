import { z } from "zod";

export const householdSchema = z.object({
  surveyId: z.string().optional(),
  houseNumber: z.string().min(1, "House number is required"),
  address: z.string().min(1, "Address is required").max(500),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[+]?[\d\s-()]{10,15}$/.test(val),
      "Invalid phone number"
    ),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  wardId: z.string().min(1, "Ward is required"),
  areaId: z.string().min(1, "Area is required"),
  streetId: z.string().min(1, "Street is required"),
  buildingId: z.string().optional().nullable(),
  surveyDate: z.string().optional(),
  surveyStatus: z
    .enum(["PENDING", "IN_PROGRESS", "COMPLETED", "VERIFIED"])
    .optional(),
});

export type HouseholdInput = z.infer<typeof householdSchema>;
