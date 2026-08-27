import { query } from "@/lib/db/pool";
import { verifyPassword } from "@/lib/auth/password";

interface AdminRow {
  id: number;
  username: string;
  password_hash: string;
}

interface PromoterRow {
  id: number;
  login_id: string;
  name: string;
  password_hash: string;
  is_active: boolean;
}

export async function authenticateAdmin(username: string, password: string) {
  const rows = await query<AdminRow>(
    "SELECT id, username, password_hash FROM admins WHERE username = $1",
    [username]
  );
  const admin = rows[0];
  if (!admin) return null;

  const ok = await verifyPassword(password, admin.password_hash);
  if (!ok) return null;

  return { id: admin.id, username: admin.username };
}

type PromoterAuthResult =
  | { id: number; loginId: string; name: string }
  | { deactivated: true }
  | null;

export async function authenticatePromoter(
  loginId: string,
  password: string
): Promise<PromoterAuthResult> {
  const rows = await query<PromoterRow>(
    "SELECT id, login_id, name, password_hash, is_active FROM promoters WHERE login_id = $1",
    [loginId]
  );
  const promoter = rows[0];
  if (!promoter) return null;
  if (!promoter.is_active) return { deactivated: true };

  const ok = await verifyPassword(password, promoter.password_hash);
  if (!ok) return null;

  return { id: promoter.id, loginId: promoter.login_id, name: promoter.name };
}
