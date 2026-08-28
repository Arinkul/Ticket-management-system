import Link from "next/link";
import { logoutAction } from "@/server/actions/auth.actions";
import { Logo } from "@/components/shared/Logo";

export function AdminNav() {
  return (
    <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
      <div className="flex items-center gap-8">
        <Logo />
        <nav className="flex gap-5 text-sm font-medium text-slate-600">
          <Link href="/admin" className="hover:text-slate-900">
            Dashboard
          </Link>
          <Link href="/admin/events" className="hover:text-slate-900">
            Events
          </Link>
          <Link href="/admin/promoters" className="hover:text-slate-900">
            Promoters
          </Link>
          <Link href="/admin/analytics" className="hover:text-slate-900">
            Analytics
          </Link>
        </nav>
      </div>
      <form action={logoutAction}>
        <button type="submit" className="text-sm font-medium text-slate-500 hover:text-slate-900">
          Log out
        </button>
      </form>
    </div>
  );
}
