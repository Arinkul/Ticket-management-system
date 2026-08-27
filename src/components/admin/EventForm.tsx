"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import type { ActionResult, EventRecord } from "@/types";

interface EventFormProps {
  action: (state: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;
  defaultValues?: Pick<EventRecord, "name" | "venue" | "eventDates" | "description">;
  submitLabel?: string;
}

export function EventForm({ action, defaultValues, submitLabel = "Save event" }: EventFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [dates, setDates] = useState<string[]>(defaultValues?.eventDates ?? []);
  const [pendingDate, setPendingDate] = useState("");

  function addDate() {
    if (!pendingDate) return;
    if (!dates.includes(pendingDate)) {
      setDates([...dates, pendingDate].sort());
    }
    setPendingDate("");
  }

  function removeDate(d: string) {
    setDates(dates.filter((x) => x !== d));
  }

  return (
    <form action={formAction} className="space-y-5">
      {/* dates live in component state for a nicer UI, joined here so the
          server action can read them from plain FormData */}
      <input type="hidden" name="eventDates" value={dates.join(",")} />

      <div>
        <Label htmlFor="name">Event name</Label>
        <Input id="name" name="name" defaultValue={defaultValues?.name} required />
      </div>

      <div>
        <Label htmlFor="venue">Venue</Label>
        <Input id="venue" name="venue" defaultValue={defaultValues?.venue} required />
      </div>

      <div>
        <Label>Sellable dates</Label>
        <div className="flex gap-2">
          <Input
            type="date"
            value={pendingDate}
            onChange={(e) => setPendingDate(e.target.value)}
          />
          <Button type="button" variant="secondary" onClick={addDate}>
            Add date
          </Button>
        </div>
        {dates.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {dates.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200"
              >
                {d}
                <button
                  type="button"
                  onClick={() => removeDate(d)}
                  className="text-indigo-400 hover:text-indigo-700"
                  aria-label={`Remove ${d}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        {dates.length === 0 && (
          <p className="mt-1 text-xs text-slate-400">
            Add at least one date promoters can sell for.
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaultValues?.description ?? ""}
        />
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
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
