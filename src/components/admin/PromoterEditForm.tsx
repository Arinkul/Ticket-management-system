"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import type { ActionResult, Promoter } from "@/types";

interface Props {
  promoterId: number;
  defaultValues: Pick<Promoter, "name" | "phone">;
  action: (
    promoterId: number,
    state: ActionResult | undefined,
    formData: FormData
  ) => Promise<ActionResult>;
}

export function PromoterEditForm({ promoterId, defaultValues, action }: Props) {
  const boundAction = action.bind(null, promoterId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={defaultValues.name} required />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" defaultValue={defaultValues.phone ?? ""} />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-600" role="status">
          Saved.
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
