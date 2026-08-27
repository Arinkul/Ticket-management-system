export type Role = "admin" | "promoter";

export interface Admin {
  id: number;
  username: string;
}

export interface Promoter {
  id: number;
  loginId: string;
  name: string;
  phone: string | null;
  isActive: boolean;
}

export interface EventRecord {
  id: number;
  name: string;
  venue: string;
  eventDates: string[]; // ISO date strings, admin-defined sellable dates
  description: string | null;
  isActive: boolean;
}

export interface PromoterAssignment {
  id: number;
  eventId: number;
  promoterId: number;
  ticketPrice: number;
  ticketQuantity: number;
}

export interface TicketEntry {
  id: number;
  eventId: number;
  promoterId: number;
  selectedDate: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string | null;
  moneyReceived: boolean;
  createdAt: string;
}

// Generic shape returned by Server Actions so client forms can render errors consistently
export interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}
