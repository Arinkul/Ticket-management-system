"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import type { ActionResult } from "@/types";

export function DeleteEventForm({
  action,
}: {
  action: (state: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm("Delete this event permanently? This cannot be undone.")) {
      e.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit}>
      <Button type="submit" variant="danger" disabled={pending}>
        {pending ? "Deleting..." : "Delete event"}
      </Button>
      {state?.error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
