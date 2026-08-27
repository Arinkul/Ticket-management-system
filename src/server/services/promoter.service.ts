import { query } from "@/lib/db/pool";
import { hashPassword } from "@/lib/auth/password";
import { generatePromoterLoginId, generateTempPassword } from "@/lib/utils/id";
import type { Promoter } from "@/types";

interface PromoterRow {
  id: number;
  login_id: string;
  name: string;
  phone: string | null;
  is_active: boolean;
}

function mapPromoter(row: PromoterRow): Promoter {
  return {
    id: row.id,
    loginId: row.login_id,
    name: row.name,
    phone: row.phone,
    isActive: row.is_active,
  };
}

export async function listPromoters(): Promise<Promoter[]> {
  const rows = await query<PromoterRow>(
    "SELECT id, login_id, name, phone, is_active FROM promoters ORDER BY created_at DESC"
  );
  return rows.map(mapPromoter);
}

export async function getPromoterById(id: number): Promise<Promoter | null> {
  const rows = await query<PromoterRow>(
    "SELECT id, login_id, name, phone, is_active FROM promoters WHERE id = $1",
    [id]
  );
  return rows[0] ? mapPromoter(rows[0]) : null;
}

export interface NewPromoterCredentials {
  promoter: Promoter;
  tempPassword: string;
}

export async function createPromoter(input: {
  name: string;
  phone?: string | null;
}): Promise<NewPromoterCredentials> {
  // login_id collisions are extremely unlikely (6 chars, ~33^6 space) but retry just in case
  for (let attempt = 0; attempt < 5; attempt++) {
    const loginId = generatePromoterLoginId();
    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);
    try {
      const rows = await query<PromoterRow>(
        `INSERT INTO promoters (login_id, name, phone, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id, login_id, name, phone, is_active`,
        [loginId, input.name, input.phone ?? null, passwordHash]
      );
      return { promoter: mapPromoter(rows[0]), tempPassword };
    } catch (err: unknown) {
      const isUniqueViolation =
        err && typeof err === "object" && "code" in err && err.code === "23505";
      if (isUniqueViolation) continue;
      throw err;
    }
  }
  throw new Error("Could not generate a unique login ID. Please try again.");
}

export async function updatePromoter(
  id: number,
  input: { name: string; phone?: string | null }
): Promise<Promoter> {
  const rows = await query<PromoterRow>(
    `UPDATE promoters SET name = $1, phone = $2 WHERE id = $3
     RETURNING id, login_id, name, phone, is_active`,
    [input.name, input.phone ?? null, id]
  );
  return mapPromoter(rows[0]);
}

export async function setPromoterActive(id: number, isActive: boolean): Promise<void> {
  await query("UPDATE promoters SET is_active = $1 WHERE id = $2", [isActive, id]);
}

export async function resetPromoterPassword(id: number): Promise<string> {
  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  await query("UPDATE promoters SET password_hash = $1 WHERE id = $2", [passwordHash, id]);
  return tempPassword;
}
