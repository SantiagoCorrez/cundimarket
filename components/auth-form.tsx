"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { Button, Field, Input, Select } from "@/components/ui";
import { BrandMark } from "@/components/brand";
import { ComingSoonSheet } from "@/components/coming-soon-sheet";
import { PasswordInput } from "@/components/password-input";
import { GoogleSignIn } from "@/components/google-sign-in";
import { loginAction, registerAction, type AuthState } from "@/lib/actions/auth";
import { MUNICIPALITIES, PILOT_MUNICIPALITY, USER_TYPES } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const params = useSearchParams();
  const next = params.get("next") || "";
  const reason = params.get("reason");
  const initialRole = params.get("role") === "merchant" ? "MERCHANT" : "CITIZEN";
  const [role, setRole] = useState<"CITIZEN" | "MERCHANT">(initialRole);
  const [municipality, setMunicipality] = useState<string>(PILOT_MUNICIPALITY);
  const [soonFor, setSoonFor] = useState<string | null>(null);

  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, undefined);

  return (
    <main className="min-h-dvh mx-auto max-w-md flex flex-col px-6 py-10 bg-surface">
      <Link href="/home" className="flex items-center gap-2 mb-8">
        <BrandMark size={32} />
        <span className="font-extrabold">
          Cundi<span className="text-brand-strong">Market</span>
        </span>
      </Link>

      <h1 className="text-2xl font-extrabold text-ink">
        {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
      </h1>
      <p className="text-sm text-ink-soft mt-1">
        {mode === "login"
          ? "Bienvenido de vuelta a tu municipio."
          : "Únete a la comunidad de CundiMarket."}
      </p>

      {reason === "contact" && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-brand/10 px-3.5 py-3 text-sm text-ink">
          <Lock size={18} className="mt-0.5 shrink-0 text-brand-strong" />
          <p>
            Para llamar o escribir por WhatsApp necesitas una cuenta. Solo las personas registradas
            pueden contactar a los comercios y prestadores.
          </p>
        </div>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="role" value={role} />

        {mode === "register" && (
          <>
            <div className="grid grid-cols-2 gap-2 p-1 bg-bg rounded-2xl">
              {(["CITIZEN", "MERCHANT"] as const).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={cn(
                    "h-11 rounded-xl text-sm font-semibold transition",
                    role === r ? "bg-brand text-brand-ink shadow-card" : "text-ink-soft",
                  )}
                >
                  {USER_TYPES[r].emoji} {USER_TYPES[r].label}
                </button>
              ))}
            </div>
            <Field label="Nombre completo" required>
              <Input name="name" placeholder="Tu nombre" required />
            </Field>
          </>
        )}

        <Field label="Correo electrónico" required>
          <Input name="email" type="email" placeholder="correo@ejemplo.com" required />
        </Field>

        <Field label="Contraseña" required hint={mode === "register" ? "Mínimo 6 caracteres" : undefined}>
          <PasswordInput
            name="password"
            placeholder="••••••••"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={6}
          />
        </Field>

        {mode === "register" && (
          <>
            <Field label="Repetir contraseña" required>
              <PasswordInput name="confirmPassword" placeholder="••••••••" autoComplete="new-password" minLength={6} />
            </Field>
            <Field label="Teléfono / WhatsApp">
              <Input name="phone" type="tel" placeholder="3XX XXX XXXX" />
            </Field>
            <Field label="Municipio">
              <Select
                name="municipality"
                value={municipality}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === PILOT_MUNICIPALITY) setMunicipality(value);
                  else setSoonFor(value);
                }}
              >
                {MUNICIPALITIES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                    {m === PILOT_MUNICIPALITY ? "" : " (próximamente)"}
                  </option>
                ))}
              </Select>
            </Field>
          </>
        )}

        {mode === "register" && (
          <label className="flex items-start gap-2.5 text-sm text-ink-soft">
            <input
              type="checkbox"
              name="terms"
              required
              className="mt-0.5 h-5 w-5 shrink-0 accent-brand-strong"
            />
            <span>
              Acepto los{" "}
              <Link href="/terminos" className="font-semibold text-ink underline">
                términos y condiciones
              </Link>
              , las{" "}
              <Link href="/contenido" className="font-semibold text-ink underline">
                normas de la comunidad
              </Link>{" "}
              y la{" "}
              <Link href="/privacidad" className="font-semibold text-ink underline">
                política de privacidad
              </Link>
              , y autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012.
            </span>
          </label>
        )}

        {state?.error && (
          <p className="text-sm text-danger bg-danger/10 rounded-xl px-3 py-2">{state.error}</p>
        )}

        <Button size="lg" className="w-full" disabled={pending}>
          {pending ? "Procesando…" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs text-ink-faint">O</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <GoogleSignIn next={next} />

      <p className="text-center text-sm text-ink-soft mt-6">
        {mode === "login" ? (
          <>
            ¿No tienes cuenta?{" "}
            <Link href={`/register${next ? `?next=${next}` : ""}`} className="font-semibold text-ink underline">
              Crear cuenta
            </Link>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href={`/login${next ? `?next=${next}` : ""}`} className="font-semibold text-ink underline">
              Iniciar sesión
            </Link>
          </>
        )}
      </p>

      <ComingSoonSheet municipality={soonFor} onChooseAnother={() => setSoonFor(null)}>
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={() => {
            if (soonFor) setMunicipality(soonFor);
            setSoonFor(null);
          }}
        >
          Registrarme
        </Button>
      </ComingSoonSheet>
    </main>
  );
}
