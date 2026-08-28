"use server";

import { revalidatePath } from "next/cache";
import { entryFormSchema } from "@/lib/validations/entry";
import { requirePromoterSession } from "@/lib/auth/guards";
import { createEntry } from "@/server/services/entry.service";
import { getAssignmentForPromoter } from "@/server/services/assignment.service";
import { getEventById } from "@/server/services/event.service";
import type { ActionResult } from "@/types";

export async function createEntryAction(
  eventId: number,
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const session = await requirePromoterSession();

  const parsed = entryFormSchema.safeParse({
    selectedDate: formData.get("selectedDate"),
    buyerName: formData.get("buyerName"),
    buyerPhone: formData.get("buyerPhone"),
    buyerEmail: formData.get("buyerEmail") ?? "",
    moneyReceived: formData.get("moneyReceived"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const event = await getEventById(eventId);
  if (!event || !event.isActive) {
    return { success: false, error: "This event is not available." };
  }
  if (!event.eventDates.includes(parsed.data.selectedDate)) {
    return { success: false, error: "Selected date is not valid for this event." };
  }

  // Re-check assignment + remaining quantity server-side — never trust the
  // client's view of "tickets remaining", it can be stale.
  const assignment = await getAssignmentForPromoter(eventId, session.id);
  if (!assignment) {
    return { success: false, error: "You are not assigned to this event." };
  }
  if (assignment.ticketsSold >= assignment.ticketQuantity) {
    return { success: false, error: "You've sold all your allotted tickets for this event." };
  }

  await createEntry({
    eventId,
    promoterId: session.id,
    selectedDate: parsed.data.selectedDate,
    buyerName: parsed.data.buyerName,
    buyerPhone: parsed.data.buyerPhone,
    buyerEmail: parsed.data.buyerEmail || null,
    moneyReceived: true,
  });

  revalidatePath(`/promoter/events/${eventId}`);
  revalidatePath("/promoter");
  return { success: true };
}
