"use server";

import { revalidatePath } from "next/cache";
import { assignmentFormSchema } from "@/lib/validations/assignment";
import { requireAdminSession } from "@/lib/auth/guards";
import * as assignmentService from "@/server/services/assignment.service";
import type { ActionResult } from "@/types";

export async function upsertAssignmentAction(
  eventId: number,
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  await requireAdminSession();
  const parsed = assignmentFormSchema.safeParse({
    promoterId: formData.get("promoterId"),
    ticketPrice: formData.get("ticketPrice"),
    ticketQuantity: formData.get("ticketQuantity"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  await assignmentService.upsertAssignment({
    eventId,
    promoterId: parsed.data.promoterId,
    ticketPrice: parsed.data.ticketPrice,
    ticketQuantity: parsed.data.ticketQuantity,
  });

  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

export async function removeAssignmentAction(eventId: number, promoterId: number): Promise<void> {
  await requireAdminSession();
  await assignmentService.removeAssignment(eventId, promoterId);
  revalidatePath(`/admin/events/${eventId}`);
}
