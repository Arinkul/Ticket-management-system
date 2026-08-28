import { query } from "@/lib/db/pool";
import type { TicketEntry } from "@/types";

interface EntryRow {
  id: number;
  event_id: number;
  promoter_id: number;
  selected_date: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string | null;
  money_received: boolean;
  created_at: string;
}

function mapEntry(row: EntryRow): TicketEntry {
  return {
    id: row.id,
    eventId: row.event_id,
    promoterId: row.promoter_id,
    selectedDate: row.selected_date,
    buyerName: row.buyer_name,
    buyerPhone: row.buyer_phone,
    buyerEmail: row.buyer_email,
    moneyReceived: row.money_received,
    createdAt: row.created_at,
  };
}

export async function createEntry(input: {
  eventId: number;
  promoterId: number;
  selectedDate: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string | null;
  moneyReceived: boolean;
}): Promise<TicketEntry> {
  const rows = await query<EntryRow>(
    `INSERT INTO ticket_entries
       (event_id, promoter_id, selected_date, buyer_name, buyer_phone, buyer_email, money_received)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, event_id, promoter_id, selected_date, buyer_name, buyer_phone, buyer_email, money_received, created_at`,
    [
      input.eventId,
      input.promoterId,
      input.selectedDate,
      input.buyerName,
      input.buyerPhone,
      input.buyerEmail ?? null,
      input.moneyReceived,
    ]
  );
  return mapEntry(rows[0]);
}

// Deliberately no deleteEntry / updateEntry export — promoters can never
// remove or alter a submitted entry, by design.

export async function listEntriesForPromoterEvent(
  promoterId: number,
  eventId: number
): Promise<TicketEntry[]> {
  const rows = await query<EntryRow>(
    `SELECT id, event_id, promoter_id, selected_date, buyer_name, buyer_phone, buyer_email, money_received, created_at
     FROM ticket_entries
     WHERE promoter_id = $1 AND event_id = $2
     ORDER BY created_at DESC`,
    [promoterId, eventId]
  );
  return rows.map(mapEntry);
}

export interface EntryWithPromoter extends TicketEntry {
  promoterName: string;
}

export async function listEntriesForEventWithPromoter(eventId: number): Promise<EntryWithPromoter[]> {
  const rows = await query<EntryRow & { promoter_name: string }>(
    `SELECT te.id, te.event_id, te.promoter_id, te.selected_date, te.buyer_name, te.buyer_phone,
            te.buyer_email, te.money_received, te.created_at,
            p.name AS promoter_name
     FROM ticket_entries te
     JOIN promoters p ON p.id = te.promoter_id
     WHERE te.event_id = $1
     ORDER BY te.created_at DESC`,
    [eventId]
  );
  return rows.map((row) => ({ ...mapEntry(row), promoterName: row.promoter_name }));
}
