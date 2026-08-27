"use client";

import { useState, useTransition } from "react";
import { resetPromoterPasswordAction } from "@/server/actions/promoter.actions";
import { Button } from "@/components/ui/Button";

export function ResetPasswordButton({ promoterId }: { promoterId: number }) {
  const [isPending, startTransition] = useTransition();
  const [newPassword, setNewPassword] = useState<string | null>(null);

  function handleClick() {
    if (
      !confirm(
        "Reset this promoter's password? Their old password will stop working immediately."
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await resetPromoterPasswordAction(promoterId);
      if (result.success && result.data) {
        setNewPassword(result.data.tempPassword);
      }
    });
  }

  return (
    <div>
      <Button type="button" variant="secondary" onClick={handleClick} disabled={isPending}>
        {isPending ? "Resetting..." : "Reset password"}
      </Button>
      {newPassword && (
        <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm">
          New password: <span className="font-mono font-semibold">{newPassword}</span> — share
          this with the promoter now.
        </p>
      )}
    </div>
  );
}
