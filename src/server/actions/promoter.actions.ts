"use server";

import { revalidatePath } from "next/cache";
import { promoterFormSchema } from "@/lib/validations/promoter";
import { requireAdminSession } from "@/lib/auth/guards";
import * as promoterService from "@/server/services/promoter.service";
import type { ActionResult } from "@/types";

export async function createPromoterAction(
  _prevState: ActionResult<{ loginId: string; tempPassword: string }> | undefined,
  formData: FormData
): Promise<ActionResult<{ loginId: string; tempPassword: string }>> {
  await requireAdminSession();
  const parsed = promoterFormSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const { promoter, tempPassword } = await promoterService.createPromoter({
    name: parsed.data.name,
    phone: parsed.data.phone || null,
  });

  revalidatePath("/admin/promoters");
  return { success: true, data: { loginId: promoter.loginId, tempPassword } };
}

export async function updatePromoterAction(
  promoterId: number,
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  await requireAdminSession();
  const parsed = promoterFormSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  await promoterService.updatePromoter(promoterId, {
    name: parsed.data.name,
    phone: parsed.data.phone || null,
  });

  revalidatePath(`/admin/promoters/${promoterId}`);
  revalidatePath("/admin/promoters");
  return { success: true };
}

export async function togglePromoterActiveAction(
  promoterId: number,
  isActive: boolean
): Promise<void> {
  await requireAdminSession();
  await promoterService.setPromoterActive(promoterId, isActive);
  revalidatePath(`/admin/promoters/${promoterId}`);
  revalidatePath("/admin/promoters");
}

export async function resetPromoterPasswordAction(
  promoterId: number
): Promise<ActionResult<{ tempPassword: string }>> {
  await requireAdminSession();
  const tempPassword = await promoterService.resetPromoterPassword(promoterId);
  revalidatePath(`/admin/promoters/${promoterId}`);
  return { success: true, data: { tempPassword } };
}
