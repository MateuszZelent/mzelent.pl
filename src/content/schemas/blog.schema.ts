import { z } from "zod";

export const BlogCategorySchema = z.enum([
  "Laboratory",
  "Simulation",
  "Conference",
  "Theory",
  "Equipment",
  "Publication",
]);

export type BlogCategory = z.infer<typeof BlogCategorySchema>;

export const BlogPostSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(3),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: BlogCategorySchema,
  location: z.string().min(2),
  description: z.string().min(10),
  imageUrl: z.string().min(1),
  imageAlt: z.string().min(3),
  tags: z.array(z.string()).min(1),
  featured: z.boolean().default(false),
  technicalDetails: z
    .object({
      instrument: z.string().optional(),
      magnification: z.string().optional(),
      simulationEngine: z.string().optional(),
      magneticField: z.string().optional(),
      temperature: z.string().optional(),
    })
    .optional(),
});

export type BlogPost = z.infer<typeof BlogPostSchema>;
