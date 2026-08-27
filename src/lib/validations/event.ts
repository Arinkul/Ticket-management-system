import { z } from "zod";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format");

export const eventFormSchema = z.object({
  name: z.string().min(1, "Event name is required").max(150),
  venue: z.string().min(1, "Venue is required").max(200),
  eventDates: z.array(dateString).min(1, "Add at least one date"),
  description: z.string().max(2000).optional().or(z.literal("")),
});

export type EventFormInput = z.infer<typeof eventFormSchema>;
