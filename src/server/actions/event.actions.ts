"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eventFormSchema } from "@/lib/validations/event";
import { requireAdminSession } from "@/lib/auth/guards";
import * as eventService from "@/server/services/event.service";
import type { ActionResult } from "@/types";

function parseEventForm(formData: FormData) {
  const datesRaw = formData.get("eventDates");
  const eventDates =
    typeof datesRaw === "string"
      ? datesRaw.split(",").map((d) => d.trim()).filter(Boolean)
      : [];

  return eventFormSchema.safeParse({
    name: formData.get("name"),
    venue: formData.get("venue"),
    eventDates,
    description: formData.get("description") ?? "",
  });
}

export async function createEventAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireAdminSession();
  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const event = await eventService.createEvent({
    name: parsed.data.name,
    venue: parsed.data.venue,
    eventDates: parsed.data.eventDates,
    description: parsed.data.description || null,
    createdBy: session.id,
  });

  revalidatePath("/admin/events");
  redirect(`/admin/events/${event.id}`);
}

export async function updateEventAction(
  eventId: number,
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  await requireAdminSession();
  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  await eventService.updateEvent(eventId, {
    name: parsed.data.name,
    venue: parsed.data.venue,
    eventDates: parsed.data.eventDates,
    description: parsed.data.description || null,
  });

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
  return { success: true };
}

export async function toggleEventActiveAction(eventId: number, isActive: boolean): Promise<void> {
  await requireAdminSession();
  await eventService.setEventActive(eventId, isActive);
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
}

export async function deleteEventAction(
  eventId: number,
  _prevState: ActionResult | undefined,
  _formData: FormData
): Promise<ActionResult> {
  await requireAdminSession();
  try {
    await eventService.deleteEvent(eventId);
  } catch (err) {
    if (err instanceof eventService.EventHasEntriesError) {
      return { success: false, error: err.message };
    }
    throw err;
  }
  revalidatePath("/admin/events");
  redirect("/admin/events");
}
