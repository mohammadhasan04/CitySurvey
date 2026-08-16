import { z } from "zod";

export const memberSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(200, "Name too long"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  relationship: z.string().min(1, "Relationship is required"),
  maritalStatus: z
    .enum(["SINGLE", "MARRIED", "WIDOWED", "DIVORCED", "SEPARATED"])
    .default("SINGLE"),

  // Employment
  occupation: z.string().optional().nullable(),
  employmentStatus: z
    .enum([
      "EMPLOYED",
      "SELF_EMPLOYED",
      "UNEMPLOYED",
      "RETIRED",
      "STUDENT",
      "HOMEMAKER",
      "OTHER",
    ])
    .default("OTHER"),
  workPlace: z.string().optional().nullable(),
  incomeRange: z
    .enum([
      "PREFER_NOT_TO_DISCLOSE",
      "NO_INCOME",
      "BELOW_1_LAKH",
      "ONE_TO_THREE_LAKH",
      "THREE_TO_FIVE_LAKH",
      "FIVE_TO_TEN_LAKH",
      "TEN_TO_TWENTY_LAKH",
      "ABOVE_TWENTY_LAKH",
    ])
    .optional()
    .nullable(),

  // Education
  educationStatus: z.string().optional().nullable(),
  isStudent: z.boolean().default(false),
  schoolCollegeName: z.string().optional().nullable(),
  currentClass: z.string().optional().nullable(),

  // Living Status
  livingHere: z.boolean().default(true),
  livingAbroad: z.boolean().default(false),
  country: z.string().optional().nullable(),

  // Contact
  phone: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^[+]?[\d\s-()]{10,15}$/.test(val),
      "Invalid phone number"
    ),
  email: z
    .string()
    .email("Invalid email")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type MemberInput = z.infer<typeof memberSchema>;
