import { PromoterCreateForm } from "@/components/admin/PromoterCreateForm";

export default function NewPromoterPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Add promoter</h1>
      <PromoterCreateForm />
    </main>
  );
}
