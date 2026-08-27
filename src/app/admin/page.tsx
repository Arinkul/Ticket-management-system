import { getSession } from "@/lib/auth/session";
import { logoutAction } from "@/server/actions/auth.actions";
import { Button } from "@/components/ui/Button";

export default async function AdminHomePage() {
  const session = await getSession();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome, {session?.name}
          </h1>
          <p className="text-sm text-slate-500">
            Admin dashboard — event and promoter management arrives in Module 2.
          </p>
        </div>
        <form action={logoutAction}>
          <Button variant="secondary" type="submit">
            Log out
          </Button>
        </form>
      </div>
      <div className="rounded-xl border border-dashed border-slate-300 p-16 text-center text-slate-400">
        Event list, promoter assignments, and analytics will appear here.
      </div>
    </main>
  );
}
