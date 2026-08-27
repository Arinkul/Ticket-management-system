"use client";

import { useTransition } from "react";

export function RemoveAssignmentButton({ onRemove }: { onRemove: () => Promise<void> }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Remove this promoter from the event? Their past ticket entries are kept.")) {
      return;
    }
    startTransition(() => onRemove());
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {isPending ? "Removing..." : "Remove"}
    </button>
  );
}
