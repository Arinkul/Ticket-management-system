"use server";

import { redirect } from "next/navigation";
import { adminLoginSchema, promoterLoginSchema } from "@/lib/validations/auth";
import { authenticateAdmin, authenticatePromoter } from "@/server/services/auth.service";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import type { ActionResult } from "@/types";

export async function adminLoginAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const parsed = adminLoginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { success: false, error: "Please fill in both fields." };
  }

  const admin = await authenticateAdmin(parsed.data.username, parsed.data.password);
  if (!admin) {
    return { success: false, error: "Invalid username or password." };
  }

  await setSessionCookie({ id: admin.id, role: "admin", name: admin.username });
  redirect("/admin");
}

export async function promoterLoginAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const parsed = promoterLoginSchema.safeParse({
    loginId: formData.get("loginId"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { success: false, error: "Please fill in both fields." };
  }

  const result = await authenticatePromoter(parsed.data.loginId, parsed.data.password);
  if (!result) {
    return { success: false, error: "Invalid login ID or password." };
  }
  if ("deactivated" in result) {
    return { success: false, error: "This account has been deactivated. Contact admin." };
  }

  await setSessionCookie({
    id: result.id,
    role: "promoter",
    name: result.name,
    loginId: result.loginId,
  });
  redirect("/promoter");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}
