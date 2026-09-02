import { z } from "zod";

export const PublicationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  authors: z.array(z.string()).min(1),
  year: z.number().int().min(2000).max(2100),
  journal: z.string().min(1),
  volume: z.string().optional(),
  issue: z.string().optional(),
  pages: z.string().optional(),
  doi: z.string().min(3),
  doiUrl: z.string().url(),
  abstract: z.string().min(10),
  keywords: z.array(z.string()).min(1),
  featured: z.boolean().default(false),
  openAccess: z.boolean().default(true),
  pdfUrl: z.string().optional(),
  arxivId: z.string().optional(),
  bibtex: z.string().min(10),
});

export type Publication = z.infer<typeof PublicationSchema>;
