import { notFound } from "next/navigation";
import { getPromoterById } from "@/server/services/promoter.service";
import { updatePromoterAction, togglePromoterActiveAction } from "@/server/actions/promoter.actions";
import { PromoterEditForm } from "@/components/admin/PromoterEditForm";
import { ResetPasswordButton } from "@/components/admin/ResetPasswordButton";
import { ToggleActiveButton } from "@/components/admin/ToggleActiveButton";
import { AdminNav } from "@/components/admin/AdminNav";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function PromoterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const promoterId = Number(id);
  const promoter = await getPromoterById(promoterId);
  if (!promoter) notFound();

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-6 py-10">
      <AdminNav />
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">{promoter.name}</h1>
            <Badge tone={promoter.isActive ? "success" : "neutral"}>
              {promoter.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <ToggleActiveButton
            isActive={promoter.isActive}
            onToggle={togglePromoterActiveAction.bind(null, promoterId, !promoter.isActive)}
          />
        </div>
        <p className="mt-1 font-mono text-sm text-slate-500">Login ID: {promoter.loginId}</p>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Details</h2>
        <PromoterEditForm
          promoterId={promoterId}
          defaultValues={promoter}
          action={updatePromoterAction}
        />
      </Card>

      <Card className="p-6">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Password</h2>
        <p className="mb-4 text-sm text-slate-500">
          Promoters can&apos;t reset their own password. Generate a new one here if they&apos;ve
          forgotten it.
        </p>
        <ResetPasswordButton promoterId={promoterId} />
      </Card>
    </main>
  );
}
