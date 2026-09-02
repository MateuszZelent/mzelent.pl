import { z } from "zod";

export const ProfileSchema = z.object({
  name: z.string().min(1),
  titles: z.array(z.string()).min(1),
  primaryRole: z.string().min(1),
  affiliation: z.object({
    institution: z.string().min(1),
    faculty: z.string().min(1),
    department: z.string().min(1),
    city: z.string().min(1),
    country: z.string().min(1),
    website: z.string().url().optional(),
  }),
  bio: z.string().min(10),
  shortBio: z.string().min(10),
  researchInterests: z.array(z.string()).min(1),
  identifiers: z.object({
    orcid: z.string().regex(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/),
    researcherId: z.string().optional(),
    scopusAuthorId: z.string().optional(),
    googleScholar: z.string().url().optional(),
    github: z.string().url().optional(),
  }),
  contact: z.object({
    email: z.string().email(),
    office: z.string().optional(),
  }),
});

export type Profile = z.infer<typeof ProfileSchema>;
