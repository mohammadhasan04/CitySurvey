import { z } from "zod";

export const wardSchema = z.object({
  wardNumber: z.number().int().positive("Ward number must be positive"),
  name: z.string().min(1, "Ward name is required").max(200),
  description: z.string().optional(),
});

export const areaSchema = z.object({
  name: z.string().min(1, "Area name is required").max(200),
  wardId: z.string().min(1, "Ward is required"),
  description: z.string().optional(),
});

export const streetSchema = z.object({
  name: z.string().min(1, "Street name is required").max(200),
  areaId: z.string().min(1, "Area is required"),
  description: z.string().optional(),
});

export const buildingSchema = z.object({
  name: z.string().min(1, "Building name is required").max(200),
  houseNumber: z.string().min(1, "House number is required"),
  streetId: z.string().min(1, "Street is required"),
  description: z.string().optional(),
});

export type WardInput = z.infer<typeof wardSchema>;
export type AreaInput = z.infer<typeof areaSchema>;
export type StreetInput = z.infer<typeof streetSchema>;
export type BuildingInput = z.infer<typeof buildingSchema>;
