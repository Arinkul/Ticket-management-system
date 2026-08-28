import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { logoutAction } from "@/server/actions/auth.actions";
import { listAssignedEventsForPromoter } from "@/server/services/assignment.service";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default async function PromoterHomePage() {
  const session = await getSession();
  const events = session ? await listAssignedEventsForPromoter(session.id) : [];

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome, {session?.name}
          </h1>
          <p className="text-sm text-slate-500">Your assigned events</p>
        </div>
        <form action={logoutAction}>
          <Button variant="secondary" type="submit">
            Log out
          </Button>
        </form>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-16 text-center text-slate-400">
          No assigned events yet. Check back once your admin sets one up.
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <Link key={e.eventId} href={`/promoter/events/${e.eventId}`}>
              <Card className="p-5 transition hover:border-indigo-300">
                <h2 className="font-medium text-slate-900">{e.eventName}</h2>
                <p className="text-sm text-slate-500">{e.venue}</p>
                <p className="mt-1 text-xs text-slate-400">
                  ${e.ticketPrice.toFixed(2)} per ticket · {e.ticketsSold}/{e.ticketQuantity} sold
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
