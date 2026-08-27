"use client";

import { useActionState } from "react";
import { createPromoterAction } from "@/server/actions/promoter.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card } from "@/components/ui/Card";

export function PromoterCreateForm() {
  const [state, formAction, pending] = useActionState(createPromoterAction, undefined);

  if (state?.success && state.data) {
    return (
      <Card className="p-6">
        <h2 className="mb-1 text-lg font-semibold text-emerald-700">Promoter created</h2>
        <p className="mb-4 text-sm text-slate-500">
          Share these credentials with the promoter now — the password won&apos;t be shown
          again.
        </p>
        <dl className="space-y-3 rounded-lg bg-slate-50 p-4">
          <div>
            <dt className="text-xs uppercase text-slate-400">Login ID</dt>
            <dd className="font-mono text-base text-slate-900">{state.data.loginId}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-400">Password</dt>
            <dd className="font-mono text-base text-slate-900">{state.data.tempPassword}</dd>
          </div>
        </dl>
        <a
          href="/admin/promoters"
          className="mt-6 inline-block text-sm font-medium text-indigo-600 underline"
        >
          Back to promoters
        </a>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form action={formAction} className="space-y-5">
        <div>
          <Label htmlFor="name">Promoter name</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" name="phone" type="tel" />
        </div>

        {state?.error && (
          <p className="text-sm text-red-600" role="alert">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create promoter"}
        </Button>
      </form>
    </Card>
  );
}
