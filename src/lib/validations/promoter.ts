import { z } from "zod";

export const promoterFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().max(20).optional().or(z.literal("")),
});

export type PromoterFormInput = z.infer<typeof promoterFormSchema>;
