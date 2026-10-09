"use client";

import { useActionState, useState } from "react";
import { Button, Field } from "@/components/ui";
import { PasswordInput } from "@/components/password-input";
import { deleteAccountAction, type AuthState } from "@/lib/actions/auth";

export function DeleteAccountForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(deleteAccountAction, undefined);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Tu contraseña" required hint="La pedimos para confirmar que eres tú.">
        <PasswordInput name="password" placeholder="••••••••" autoComplete="current-password" />
      </Field>

      <label className="flex items-start gap-2.5 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-danger"
        />
        <span>Entiendo que esta acción es definitiva y no se puede deshacer.</span>
      </label>

      {state?.error && (
        <p className="text-sm text-danger bg-danger/10 rounded-xl px-3 py-2">{state.error}</p>
      )}

      <Button variant="danger" size="lg" className="w-full" disabled={pending || !confirmed}>
        {pending ? "Eliminando…" : "Eliminar mi cuenta definitivamente"}
      </Button>
    </form>
  );
}
