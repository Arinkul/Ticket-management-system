import Link from "next/link";
import { getOverallAnalytics } from "@/server/services/dashboard.service";
import { AdminNav } from "@/components/admin/AdminNav";
import { Card } from "@/components/ui/Card";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </Card>
  );
}

export default async function AnalyticsPage() {
  const stats = await getOverallAnalytics();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <AdminNav />
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Analytics</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Events" value={`${stats.activeEvents}/${stats.totalEvents}`} />
        <StatCard label="Promoters" value={stats.totalPromoters} />
        <StatCard label="Tickets sold" value={stats.totalTicketsSold} />
        <StatCard label="Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} />
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">By event</h2>
        {stats.byEvent.length === 0 ? (
          <p className="text-sm text-slate-400">No events yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                <th className="pb-2">Event</th>
                <th className="pb-2">Tickets sold</th>
                <th className="pb-2">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.byEvent.map((e) => (
                <tr key={e.eventId}>
                  <td className="py-2">
                    <Link
                      href={`/admin/events/${e.eventId}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {e.eventName}
                    </Link>
                  </td>
                  <td className="py-2">{e.ticketsSold}</td>
                  <td className="py-2">${e.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </main>
  );
}
