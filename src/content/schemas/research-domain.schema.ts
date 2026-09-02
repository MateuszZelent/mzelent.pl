import { z } from "zod";

export const ResearchDomainSchema = z.object({
  id: z.string().min(1),
  index: z.string().regex(/^\d{2}$/),
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  tagline: z.string().min(5),
  description: z.string().min(10),
  keyConcepts: z.array(z.string()).min(1),
  equationsOrNotation: z.array(z.string()).optional(),
  colorAccent: z.enum(["cyan", "violet", "magenta", "warm"]),
});

export type ResearchDomain = z.infer<typeof ResearchDomainSchema>;
