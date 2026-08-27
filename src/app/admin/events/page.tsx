import Link from "next/link";
import { listEvents } from "@/server/services/event.service";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default async function EventsPage() {
  const events = await listEvents();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Events</h1>
          <p className="text-sm text-slate-500">{events.length} total</p>
        </div>
        <Link href="/admin/events/new">
          <Button>New event</Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-16 text-center text-slate-400">
          No events yet. Create your first one.
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Link key={event.id} href={`/admin/events/${event.id}`}>
              <Card className="flex items-center justify-between p-5 transition hover:border-indigo-300">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-medium text-slate-900">{event.name}</h2>
                    <Badge tone={event.isActive ? "success" : "neutral"}>
                      {event.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    {event.venue} · {event.eventDates.length} date
                    {event.eventDates.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
