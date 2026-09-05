import { z } from "zod";

export const SoftwareSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().min(5),
  description: z.string().min(10),
  role: z.string().min(1),
  language: z.string().min(1),
  technologies: z.array(z.string()).min(1),
  repoUrl: z.string().url(),
  docsUrl: z.string().url().optional(),
  license: z.string().min(1),
  featured: z.boolean().default(false),
  highlights: z.array(z.string()).min(1),
  quickstart: z.string().optional(),
});

export type Software = z.infer<typeof SoftwareSchema>;
