import { z } from "zod";

export const GrantSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  funder: z.string().min(1),
  program: z.string().min(1),
  grantNumber: z.string().min(1),
  role: z.enum(["Principal Investigator", "Co-Investigator", "Key Researcher", "Postdoctoral Researcher"]),
  startYear: z.number().int().min(2010),
  endYear: z.number().int().min(2010),
  status: z.enum(["Active", "Completed"]),
  description: z.string().min(10),
  budget: z.string().optional(),
});

export type Grant = z.infer<typeof GrantSchema>;
