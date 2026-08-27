"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import type { ActionResult, Promoter } from "@/types";

interface Props {
  eventId: number;
  promoters: Promoter[];
  action: (
    eventId: number,
    state: ActionResult | undefined,
    formData: FormData
  ) => Promise<ActionResult>;
}

export function AssignmentForm({ eventId, promoters, action }: Props) {
  const boundAction = action.bind(null, eventId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-4 sm:items-end">
      <div className="sm:col-span-2">
        <Label htmlFor="promoterId">Promoter</Label>
        <Select id="promoterId" name="promoterId" required defaultValue="">
          <option value="" disabled>
            Select a promoter
          </option>
          {promoters.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.loginId})
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="ticketPrice">Price</Label>
        <Input id="ticketPrice" name="ticketPrice" type="number" min="0" step="0.01" required />
      </div>
      <div>
        <Label htmlFor="ticketQuantity">Quantity</Label>
        <Input id="ticketQuantity" name="ticketQuantity" type="number" min="1" step="1" required />
      </div>
      <div className="sm:col-span-4">
        {state?.error && (
          <p className="mb-2 text-sm text-red-600" role="alert">
            {state.error}
          </p>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Add / update assignment"}
        </Button>
      </div>
    </form>
  );
}
