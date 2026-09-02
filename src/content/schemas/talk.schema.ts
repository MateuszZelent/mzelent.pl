import { z } from "zod";

export const TalkSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  event: z.string().min(1),
  location: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(["Keynote", "Invited", "Contributed", "Seminar"]),
  abstract: z.string().optional(),
  slidesUrl: z.string().url().optional(),
});

export type Talk = z.infer<typeof TalkSchema>;
