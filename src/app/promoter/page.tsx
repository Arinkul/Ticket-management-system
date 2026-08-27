import { getSession } from "@/lib/auth/session";
import { logoutAction } from "@/server/actions/auth.actions";
import { Button } from "@/components/ui/Button";

export default async function PromoterHomePage() {
  const session = await getSession();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome, {session?.name}
          </h1>
          <p className="text-sm text-slate-500">
            Your assigned events and ticket entry form arrive in Module 3.
          </p>
        </div>
        <form action={logoutAction}>
          <Button variant="secondary" type="submit">
            Log out
          </Button>
        </form>
      </div>
      <div className="rounded-xl border border-dashed border-slate-300 p-16 text-center text-slate-400">
        Your assigned events will appear here.
      </div>
    </main>
  );
}
