import { query } from "@/lib/db/pool";
import type { PromoterAssignment } from "@/types";

interface AssignmentRow {
  id: number;
  event_id: number;
  promoter_id: number;
  ticket_price: string; // numeric columns come back as strings from node-postgres
  ticket_quantity: number;
}

function mapAssignment(row: AssignmentRow): PromoterAssignment {
  return {
    id: row.id,
    eventId: row.event_id,
    promoterId: row.promoter_id,
    ticketPrice: Number(row.ticket_price),
    ticketQuantity: row.ticket_quantity,
  };
}

export interface AssignmentWithPromoter extends PromoterAssignment {
  promoterName: string;
  promoterLoginId: string;
  ticketsSold: number;
}

export async function listAssignmentsForEvent(eventId: number): Promise<AssignmentWithPromoter[]> {
  const rows = await query<
    AssignmentRow & { promoter_name: string; promoter_login_id: string; tickets_sold: number }
  >(
    `SELECT pa.id, pa.event_id, pa.promoter_id, pa.ticket_price, pa.ticket_quantity,
            p.name AS promoter_name, p.login_id AS promoter_login_id,
            COUNT(te.id)::int AS tickets_sold
     FROM promoter_assignments pa
     JOIN promoters p ON p.id = pa.promoter_id
     LEFT JOIN ticket_entries te
            ON te.event_id = pa.event_id AND te.promoter_id = pa.promoter_id
     WHERE pa.event_id = $1
     GROUP BY pa.id, p.name, p.login_id
     ORDER BY p.name`,
    [eventId]
  );
  return rows.map((row) => ({
    ...mapAssignment(row),
    promoterName: row.promoter_name,
    promoterLoginId: row.promoter_login_id,
    ticketsSold: Number(row.tickets_sold),
  }));
}

export async function upsertAssignment(input: {
  eventId: number;
  promoterId: number;
  ticketPrice: number;
  ticketQuantity: number;
}): Promise<PromoterAssignment> {
  const rows = await query<AssignmentRow>(
    `INSERT INTO promoter_assignments (event_id, promoter_id, ticket_price, ticket_quantity)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (event_id, promoter_id)
     DO UPDATE SET ticket_price = EXCLUDED.ticket_price,
                    ticket_quantity = EXCLUDED.ticket_quantity,
                    updated_at = NOW()
     RETURNING id, event_id, promoter_id, ticket_price, ticket_quantity`,
    [input.eventId, input.promoterId, input.ticketPrice, input.ticketQuantity]
  );
  return mapAssignment(rows[0]);
}

export async function removeAssignment(eventId: number, promoterId: number): Promise<void> {
  await query("DELETE FROM promoter_assignments WHERE event_id = $1 AND promoter_id = $2", [
    eventId,
    promoterId,
  ]);
}
