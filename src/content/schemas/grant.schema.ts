import { z } from "zod";

export const GrantSchema = z.object({
  id: z.string().min(1),
  acronym: z.string().optional(),
  title: z.string().min(1),
  titlePl: z.string().optional(),
  funder: z.string().min(1),
  funderPl: z.string().optional(),
  program: z.string().min(1),
  programPl: z.string().optional(),
  grantNumber: z.string().min(1),
  role: z.string().min(1),
  rolePl: z.string().optional(),
  institutions: z.array(z.string()).min(1),
  institutionsPl: z.array(z.string()).optional(),
  startYear: z.number().int().min(2010),
  endYear: z.number().int().min(2010),
  status: z.enum(["Active", "Completed"]),
  description: z.string().min(10),
  descriptionPl: z.string().optional(),
  budget: z.string().optional(),
  officialUrl: z.string().url().optional(),
});

export type Grant = z.infer<typeof GrantSchema>;
