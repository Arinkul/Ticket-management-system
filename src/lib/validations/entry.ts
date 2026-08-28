import { z } from "zod";

export const entryFormSchema = z.object({
  selectedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Select a date"),
  buyerName: z.string().min(1, "Name is required").max(150),
  buyerPhone: z.string().min(1, "Phone number is required").max(20),
  buyerEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  // Checkboxes only appear in FormData when checked ("on"); this makes
  // confirming payment a required step before a sale can be logged.
  moneyReceived: z.literal("on", {
    errorMap: () => ({ message: "Confirm you've received the money before submitting." }),
  }),
});

export type EntryFormInput = z.infer<typeof entryFormSchema>;
