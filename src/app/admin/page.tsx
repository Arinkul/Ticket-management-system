import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { logoutAction } from "@/server/actions/auth.actions";
import { listEvents } from "@/server/services/event.service";
import { listPromoters } from "@/server/services/promoter.service";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default async function AdminHomePage() {
  const session = await getSession();
  const [events, promoters] = await Promise.all([listEvents(), listPromoters()]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome, {session?.name}
          </h1>
          <p className="text-sm text-slate-500">
            Ticket sales analytics arrive in Module 3.
          </p>
        </div>
        <form action={logoutAction}>
          <Button variant="secondary" type="submit">
            Log out
          </Button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/events">
          <Card className="p-6 transition hover:border-indigo-300">
            <h2 className="text-lg font-semibold text-slate-900">Events</h2>
            <p className="mt-1 text-sm text-slate-500">
              {events.length} event{events.length !== 1 ? "s" : ""} · create, edit, and assign
              promoters
            </p>
          </Card>
        </Link>
        <Link href="/admin/promoters">
          <Card className="p-6 transition hover:border-indigo-300">
            <h2 className="text-lg font-semibold text-slate-900">Promoters</h2>
            <p className="mt-1 text-sm text-slate-500">
              {promoters.length} promoter{promoters.length !== 1 ? "s" : ""} · add, deactivate,
              reset passwords
            </p>
          </Card>
        </Link>
      </div>
    </main>
  );
}
