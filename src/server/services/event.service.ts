import { query } from "@/lib/db/pool";
import type { EventRecord } from "@/types";

interface EventRow {
  id: number;
  name: string;
  venue: string;
  event_dates: string[];
  description: string | null;
  is_active: boolean;
}

function mapEvent(row: EventRow): EventRecord {
  return {
    id: row.id,
    name: row.name,
    venue: row.venue,
    eventDates: row.event_dates,
    description: row.description,
    isActive: row.is_active,
  };
}

export async function listEvents(): Promise<EventRecord[]> {
  const rows = await query<EventRow>(
    "SELECT id, name, venue, event_dates, description, is_active FROM events ORDER BY created_at DESC"
  );
  return rows.map(mapEvent);
}

export async function getEventById(id: number): Promise<EventRecord | null> {
  const rows = await query<EventRow>(
    "SELECT id, name, venue, event_dates, description, is_active FROM events WHERE id = $1",
    [id]
  );
  return rows[0] ? mapEvent(rows[0]) : null;
}

export async function createEvent(input: {
  name: string;
  venue: string;
  eventDates: string[];
  description?: string | null;
  createdBy: number;
}): Promise<EventRecord> {
  const rows = await query<EventRow>(
    `INSERT INTO events (name, venue, event_dates, description, created_by)
     VALUES ($1, $2, $3::date[], $4, $5)
     RETURNING id, name, venue, event_dates, description, is_active`,
    [input.name, input.venue, input.eventDates, input.description ?? null, input.createdBy]
  );
  return mapEvent(rows[0]);
}

export async function updateEvent(
  id: number,
  input: { name: string; venue: string; eventDates: string[]; description?: string | null }
): Promise<EventRecord> {
  const rows = await query<EventRow>(
    `UPDATE events
     SET name = $1, venue = $2, event_dates = $3::date[], description = $4, updated_at = NOW()
     WHERE id = $5
     RETURNING id, name, venue, event_dates, description, is_active`,
    [input.name, input.venue, input.eventDates, input.description ?? null, id]
  );
  return mapEvent(rows[0]);
}

export async function setEventActive(id: number, isActive: boolean): Promise<void> {
  await query("UPDATE events SET is_active = $1, updated_at = NOW() WHERE id = $2", [
    isActive,
    id,
  ]);
}

export class EventHasEntriesError extends Error {}

export async function deleteEvent(id: number): Promise<void> {
  try {
    await query("DELETE FROM events WHERE id = $1", [id]);
  } catch (err: unknown) {
    // Postgres foreign_key_violation — ticket_entries.event_id is ON DELETE RESTRICT
    // on purpose, so sales history can never be silently destroyed.
    if (err && typeof err === "object" && "code" in err && err.code === "23503") {
      throw new EventHasEntriesError(
        "This event has ticket entries or assignments recorded against it and can't be deleted. Deactivate it instead."
      );
    }
    throw err;
  }
}
