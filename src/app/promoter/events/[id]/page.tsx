import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getEventById } from "@/server/services/event.service";
import { getAssignmentForPromoter } from "@/server/services/assignment.service";
import { listEntriesForPromoterEvent } from "@/server/services/entry.service";
import { createEntryAction } from "@/server/actions/entry.actions";
import { EntryForm } from "@/components/promoter/EntryForm";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function PromoterEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);
  const session = await getSession();
  if (!session) notFound();

  const event = await getEventById(eventId);
  if (!event || !event.isActive) notFound();

  const assignment = await getAssignmentForPromoter(eventId, session.id);
  if (!assignment) notFound(); // this promoter isn't assigned to this event

  const entries = await listEntriesForPromoterEvent(session.id, eventId);
  const remaining = assignment.ticketQuantity - assignment.ticketsSold;

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-6 py-10">
      <div>
        <a href="/promoter" className="text-sm text-indigo-600 hover:underline">
          ← Back to events
        </a>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{event.name}</h1>
        <p className="text-sm text-slate-500">{event.venue}</p>
        <p className="mt-1 text-sm text-slate-500">
          ${assignment.ticketPrice.toFixed(2)} per ticket · {remaining} of{" "}
          {assignment.ticketQuantity} remaining
        </p>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Log a ticket sale</h2>
        {remaining <= 0 ? (
          <p className="text-sm text-amber-700">
            You&apos;ve sold all your allotted tickets for this event.
          </p>
        ) : (
          <EntryForm eventId={eventId} eventDates={event.eventDates} action={createEntryAction} />
        )}
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Your entries ({entries.length})
        </h2>
        {entries.length === 0 ? (
          <p className="text-sm text-slate-400">No entries yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{e.buyerName}</p>
                  <p className="text-xs text-slate-500">
                    {e.buyerPhone} · {e.selectedDate}
                  </p>
                </div>
                <Badge tone={e.moneyReceived ? "success" : "warning"}>
                  {e.moneyReceived ? "Paid" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </main>
  );
}
