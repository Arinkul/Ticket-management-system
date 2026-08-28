import Link from "next/link";
import { listPromoters } from "@/server/services/promoter.service";
import { AdminNav } from "@/components/admin/AdminNav";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default async function PromotersPage() {
  const promoters = await listPromoters();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <AdminNav />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Promoters</h1>
          <p className="text-sm text-slate-500">{promoters.length} total</p>
        </div>
        <Link href="/admin/promoters/new">
          <Button>Add promoter</Button>
        </Link>
      </div>

      {promoters.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-16 text-center text-slate-400">
          No promoters yet.
        </div>
      ) : (
        <div className="space-y-3">
          {promoters.map((p) => (
            <Link key={p.id} href={`/admin/promoters/${p.id}`}>
              <Card className="flex items-center justify-between p-5 transition hover:border-indigo-300">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-medium text-slate-900">{p.name}</h2>
                    <Badge tone={p.isActive ? "success" : "neutral"}>
                      {p.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="font-mono text-sm text-slate-500">{p.loginId}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
