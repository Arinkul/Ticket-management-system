import { notFound } from "next/navigation";
import { getEventById } from "@/server/services/event.service";
import { listAssignmentsForEvent } from "@/server/services/assignment.service";
import { listPromoters } from "@/server/services/promoter.service";
import { getEventAnalytics } from "@/server/services/dashboard.service";
import { listEntriesForEventWithPromoter } from "@/server/services/entry.service";
import {
  updateEventAction,
  toggleEventActiveAction,
  deleteEventAction,
} from "@/server/actions/event.actions";
import { upsertAssignmentAction, removeAssignmentAction } from "@/server/actions/assignment.actions";
import { EventForm } from "@/components/admin/EventForm";
import { AssignmentForm } from "@/components/admin/AssignmentForm";
import { RemoveAssignmentButton } from "@/components/admin/RemoveAssignmentButton";
import { ToggleActiveButton } from "@/components/admin/ToggleActiveButton";
import { DeleteEventForm } from "@/components/admin/DeleteEventForm";
import { AdminNav } from "@/components/admin/AdminNav";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);
  const event = await getEventById(eventId);
  if (!event) notFound();

  const [assignments, promoters, analytics, entries] = await Promise.all([
    listAssignmentsForEvent(eventId),
    listPromoters(),
    getEventAnalytics(eventId),
    listEntriesForEventWithPromoter(eventId),
  ]);

  const availablePromoters = promoters.filter((p) => p.isActive);

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      <AdminNav />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">{event.name}</h1>
          <Badge tone={event.isActive ? "success" : "neutral"}>
            {event.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <ToggleActiveButton
          isActive={event.isActive}
          onToggle={toggleEventActiveAction.bind(null, eventId, !event.isActive)}
        />
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Event details</h2>
        <EventForm
          action={updateEventAction.bind(null, eventId)}
          defaultValues={event}
          submitLabel="Save changes"
        />
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Promoters on this event</h2>

        {assignments.length > 0 && (
          <div className="mb-6 divide-y divide-slate-100">
            {assignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {a.promoterName}{" "}
                    <span className="text-slate-400">({a.promoterLoginId})</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    ${a.ticketPrice.toFixed(2)} · {a.ticketsSold}/{a.ticketQuantity} sold
                  </p>
                </div>
                <RemoveAssignmentButton
                  onRemove={removeAssignmentAction.bind(null, eventId, a.promoterId)}
                />
              </div>
            ))}
          </div>
        )}

        {availablePromoters.length === 0 ? (
          <p className="text-sm text-slate-400">
            No active promoters yet.{" "}
            <a href="/admin/promoters/new" className="underline">
              Add one
            </a>
            .
          </p>
        ) : (
          <AssignmentForm
            eventId={eventId}
            promoters={availablePromoters}
            action={upsertAssignmentAction}
          />
        )}
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Analytics</h2>
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Tickets sold</p>
            <p className="text-xl font-semibold text-slate-900">{analytics.totalTicketsSold}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Revenue</p>
            <p className="text-xl font-semibold text-slate-900">
              ${analytics.totalRevenue.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Paid</p>
            <p className="text-xl font-semibold text-emerald-700">
              {analytics.moneyReceivedCount}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Pending</p>
            <p className="text-xl font-semibold text-amber-700">{analytics.moneyPendingCount}</p>
          </div>
        </div>

        {analytics.byPromoter.length > 0 && (
          <table className="mb-6 w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                <th className="pb-2">Promoter</th>
                <th className="pb-2">Sold</th>
                <th className="pb-2">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.byPromoter.map((p) => (
                <tr key={p.promoterId}>
                  <td className="py-2">{p.promoterName}</td>
                  <td className="py-2">
                    {p.ticketsSold}/{p.ticketQuantity}
                  </td>
                  <td className="py-2">${p.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {entries.length > 0 && (
          <>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">
              Recent entries ({entries.length} total)
            </h3>
            <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
              {entries.slice(0, 30).map((e) => (
                <div key={e.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{e.buyerName}</p>
                    <p className="text-xs text-slate-500">
                      {e.promoterName} · {e.selectedDate} · {e.buyerPhone}
                    </p>
                  </div>
                  <Badge tone={e.moneyReceived ? "success" : "warning"}>
                    {e.moneyReceived ? "Paid" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="mb-2 text-lg font-semibold text-red-700">Danger zone</h2>
        <p className="mb-4 text-sm text-slate-500">
          Deleting only works if no ticket entries have been recorded for this event yet.
          Otherwise, deactivate it instead.
        </p>
        <DeleteEventForm action={deleteEventAction.bind(null, eventId)} />
      </Card>
    </main>
  );
}
