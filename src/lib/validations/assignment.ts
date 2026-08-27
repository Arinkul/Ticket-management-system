import { z } from "zod";

export const assignmentFormSchema = z.object({
  promoterId: z.coerce.number().int().positive("Select a promoter"),
  ticketPrice: z.coerce.number().positive("Price must be greater than 0"),
  ticketQuantity: z.coerce.number().int().positive("Quantity must be at least 1"),
});

export type AssignmentFormInput = z.infer<typeof assignmentFormSchema>;
