"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import type { ActionResult } from "@/types";

interface Props {
  eventId: number;
  eventDates: string[];
  action: (
    eventId: number,
    state: ActionResult | undefined,
    formData: FormData
  ) => Promise<ActionResult>;
}

export function EntryForm({ eventId, eventDates, action }: Props) {
  const boundAction = action.bind(null, eventId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);

  return (
    <form
      action={formAction}
      // Remounting on success clears every field so the promoter can log
      // the next sale immediately without manually clearing the form.
      key={state?.success ? `success-${Date.now()}` : "form"}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="selectedDate">Date</Label>
        <Select id="selectedDate" name="selectedDate" required defaultValue="">
          <option value="" disabled>
            Select a date
          </option>
          {eventDates.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="buyerName">Buyer name</Label>
        <Input id="buyerName" name="buyerName" required />
      </div>
      <div>
        <Label htmlFor="buyerPhone">Phone number</Label>
        <Input id="buyerPhone" name="buyerPhone" type="tel" required />
      </div>
      <div>
        <Label htmlFor="buyerEmail">Email (optional)</Label>
        <Input id="buyerEmail" name="buyerEmail" type="email" />
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3">
        <input
          id="moneyReceived"
          name="moneyReceived"
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <Label htmlFor="moneyReceived" className="mb-0">
          I have received the money for this ticket
        </Label>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-600" role="status">
          Entry logged.
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Submitting..." : "Submit entry"}
      </Button>
    </form>
  );
}
