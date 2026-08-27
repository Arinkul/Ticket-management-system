"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";

export function ToggleActiveButton({
  isActive,
  onToggle,
  activeLabel = "Deactivate",
  inactiveLabel = "Reactivate",
}: {
  isActive: boolean;
  onToggle: () => Promise<void>;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const message = isActive
      ? "Deactivate this? It's hidden from promoters and new sales, but history is kept."
      : "Reactivate this?";
    if (!confirm(message)) return;
    startTransition(() => onToggle());
  }

  return (
    <Button type="button" variant="secondary" onClick={handleClick} disabled={isPending}>
      {isPending ? "Working..." : isActive ? activeLabel : inactiveLabel}
    </Button>
  );
}
