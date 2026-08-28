import { query } from "@/lib/db/pool";

export interface EventAnalytics {
  eventId: number;
  totalTicketsSold: number;
  totalRevenue: number;
  moneyReceivedCount: number;
  moneyPendingCount: number;
  byPromoter: {
    promoterId: number;
    promoterName: string;
    promoterLoginId: string;
    ticketQuantity: number;
    ticketsSold: number;
    revenue: number;
  }[];
  byDate: { date: string; ticketsSold: number }[];
}

export async function getEventAnalytics(eventId: number): Promise<EventAnalytics> {
  const byPromoterRows = await query<{
    promoter_id: number;
    promoter_name: string;
    promoter_login_id: string;
    ticket_quantity: number;
    ticket_price: string;
    tickets_sold: number;
  }>(
    `SELECT pa.promoter_id, p.name AS promoter_name, p.login_id AS promoter_login_id,
            pa.ticket_quantity, pa.ticket_price,
            COUNT(te.id)::int AS tickets_sold
     FROM promoter_assignments pa
     JOIN promoters p ON p.id = pa.promoter_id
     LEFT JOIN ticket_entries te
            ON te.event_id = pa.event_id AND te.promoter_id = pa.promoter_id
     WHERE pa.event_id = $1
     GROUP BY pa.promoter_id, p.name, p.login_id, pa.ticket_quantity, pa.ticket_price
     ORDER BY p.name`,
    [eventId]
  );

  const byDateRows = await query<{ selected_date: string; count: number }>(
    `SELECT selected_date, COUNT(*)::int AS count
     FROM ticket_entries WHERE event_id = $1
     GROUP BY selected_date ORDER BY selected_date`,
    [eventId]
  );

  const moneyRows = await query<{ money_received: boolean; count: number }>(
    `SELECT money_received, COUNT(*)::int AS count
     FROM ticket_entries WHERE event_id = $1
     GROUP BY money_received`,
    [eventId]
  );

  const byPromoter = byPromoterRows.map((r) => ({
    promoterId: r.promoter_id,
    promoterName: r.promoter_name,
    promoterLoginId: r.promoter_login_id,
    ticketQuantity: r.ticket_quantity,
    ticketsSold: Number(r.tickets_sold),
    revenue: Number(r.tickets_sold) * Number(r.ticket_price),
  }));

  return {
    eventId,
    totalTicketsSold: byPromoter.reduce((sum, p) => sum + p.ticketsSold, 0),
    totalRevenue: byPromoter.reduce((sum, p) => sum + p.revenue, 0),
    moneyReceivedCount: moneyRows.find((r) => r.money_received)?.count ?? 0,
    moneyPendingCount: moneyRows.find((r) => !r.money_received)?.count ?? 0,
    byPromoter,
    byDate: byDateRows.map((r) => ({ date: r.selected_date, ticketsSold: Number(r.count) })),
  };
}

export interface OverallAnalytics {
  totalEvents: number;
  activeEvents: number;
  totalPromoters: number;
  totalTicketsSold: number;
  totalRevenue: number;
  byEvent: { eventId: number; eventName: string; ticketsSold: number; revenue: number }[];
}

export async function getOverallAnalytics(): Promise<OverallAnalytics> {
  const eventCountRows = await query<{ total: number; active: number }>(
    `SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE is_active)::int AS active FROM events`
  );
  const promoterCountRows = await query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM promoters`
  );
  const byEventRows = await query<{
    event_id: number;
    name: string;
    tickets_sold: number;
    revenue: string;
  }>(
    `SELECT e.id AS event_id, e.name,
            COUNT(te.id)::int AS tickets_sold,
            COALESCE(SUM(pa.ticket_price), 0) AS revenue
     FROM events e
     LEFT JOIN ticket_entries te ON te.event_id = e.id
     LEFT JOIN promoter_assignments pa
            ON pa.event_id = te.event_id AND pa.promoter_id = te.promoter_id
     GROUP BY e.id, e.name
     ORDER BY e.created_at DESC`
  );

  const byEvent = byEventRows.map((r) => ({
    eventId: r.event_id,
    eventName: r.name,
    ticketsSold: Number(r.tickets_sold),
    revenue: Number(r.revenue),
  }));

  return {
    totalEvents: eventCountRows[0]?.total ?? 0,
    activeEvents: eventCountRows[0]?.active ?? 0,
    totalPromoters: promoterCountRows[0]?.count ?? 0,
    totalTicketsSold: byEvent.reduce((sum, e) => sum + e.ticketsSold, 0),
    totalRevenue: byEvent.reduce((sum, e) => sum + e.revenue, 0),
    byEvent,
  };
}
