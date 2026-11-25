"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Button, Field, Select } from "@/components/ui";
import { googleSignInAction } from "@/lib/actions/auth";
import { MUNICIPALITIES, PILOT_MUNICIPALITY, USER_TYPES } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

type GoogleIdApi = {
  initialize: (options: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: string }) => void;
  renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdApi } };
  }
}

/** Carga una sola vez el script de "Sign in with Google" (Google Identity Services). */
function loadGoogleScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector<HTMLScriptElement>("script[data-google-gsi]");
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("No se pudo cargar Google")));
    if (!existing) {
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.dataset.googleGsi = "1";
      document.head.appendChild(script);
    }
  });
}

/**
 * Botón "Continuar con Google". Si la cuenta es nueva, muestra un paso corto para elegir el tipo de
 * perfil y el municipio y aceptar los términos antes de crearla. Se oculta si no está configurado.
 */
export function GoogleSignIn({ next }: { next: string }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [credential, setCredential] = useState<string | null>(null);
  const [signup, setSignup] = useState<{ email: string; name: string } | null>(null);
  const [role, setRole] = useState<"CITIZEN" | "MERCHANT">("CITIZEN");
  const [municipality, setMunicipality] = useState(PILOT_MUNICIPALITY);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          ux_mode: "popup",
          callback: ({ credential: token }) => {
            setCredential(token);
            setError(null);
            start(async () => {
              const r = await googleSignInAction(token, null, next);
              if (r?.error) setError(r.error);
              if (r?.needsSignup) setSignup(r.needsSignup);
            });
          },
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          locale: "es",
          width: buttonRef.current.offsetWidth || 320,
        });
      })
      .catch(() => !cancelled && setError("No se pudo cargar el inicio de sesión con Google."));
    return () => {
      cancelled = true;
    };
  }, [next]);

  if (!CLIENT_ID) return null;

  function finishSignup() {
    if (!credential) return;
    if (!terms) {
      setError("Debes aceptar los términos y el tratamiento de datos para continuar.");
      return;
    }
    setError(null);
    start(async () => {
      const r = await googleSignInAction(credential, { role, municipality, acceptTerms: true }, next);
      if (r?.error) setError(r.error);
    });
  }

  return (
    <div className="space-y-3">
      <div ref={buttonRef} className={cn("w-full flex justify-center min-h-11", (signup || pending) && "hidden")} />
      {pending && !signup && <p className="text-center text-sm text-ink-soft">Conectando con Google…</p>}

      {signup && (
        <div className="rounded-2xl border border-line p-4 space-y-4">
          <div>
            <p className="font-bold text-ink">Completa tu registro</p>
            <p className="text-sm text-ink-soft">
              Crearemos tu cuenta con <b>{signup.email}</b>.
            </p>
          </div>
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
          <Field label="Municipio">
            <Select value={municipality} onChange={(e) => setMunicipality(e.target.value)}>
              {MUNICIPALITIES.map((m) => (
                <option key={m} value={m}>
                  {m}
                  {m === PILOT_MUNICIPALITY ? "" : " (próximamente)"}
                </option>
              ))}
            </Select>
          </Field>
          <label className="flex items-start gap-2.5 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-brand-strong"
            />
            <span>
              Acepto los{" "}
              <Link href="/terminos" className="font-semibold text-ink underline">términos y condiciones</Link>, las{" "}
              <Link href="/contenido" className="font-semibold text-ink underline">normas de la comunidad</Link> y la{" "}
              <Link href="/privacidad" className="font-semibold text-ink underline">política de privacidad</Link>, y
              autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012.
            </span>
          </label>
          <div className="flex gap-2">
            <Button type="button" size="lg" className="flex-1" disabled={pending} onClick={finishSignup}>
              {pending ? "Creando cuenta…" : "Crear cuenta"}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              disabled={pending}
              onClick={() => {
                setSignup(null);
                setCredential(null);
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-danger bg-danger/10 rounded-xl px-3 py-2">{error}</p>}
    </div>
  );
}
