"use client";

import { useActionState } from "react";
import { promoterLoginAction } from "@/server/actions/auth.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/shared/Logo";
import type { ActionResult } from "@/types";

const initialState: ActionResult | undefined = undefined;

export default function PromoterLoginPage() {
  const [state, formAction, pending] = useActionState(promoterLoginAction, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <Card className="p-8">
          <h1 className="mb-1 text-xl font-semibold text-slate-900">Promoter login</h1>
          <p className="mb-6 text-sm text-slate-500">
            Use the ID and password your admin shared with you.
          </p>

          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="loginId">Login ID</Label>
              <Input
                id="loginId"
                name="loginId"
                placeholder="e.g. PRM-7F3K2A"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            {state?.error && (
              <p className="text-sm text-red-600" role="alert">
                {state.error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Card>
        <p className="mt-4 text-center text-xs text-slate-400">
          Admin?{" "}
          <a href="/admin/login" className="underline">
            Log in here
          </a>
        </p>
      </div>
    </main>
  );
}
