"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function PasswordRecoveryCallbackPage() {
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function establishRecoverySession() {
      const requestUrl = new URL(window.location.href);
      const code = requestUrl.searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          if (active) {
            setErrorMessage(
              "This recovery link is invalid or expired. Please request a new email.",
            );
          }
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (error || !data.session) {
        setErrorMessage(
          "This recovery link is invalid or expired. Please request a new email.",
        );
        return;
      }

      window.location.replace("/auth/update-password");
    }

    void establishRecoverySession();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-16 text-white">
      <div
        className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-[150px]"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-400/30 bg-yellow-400/10 text-2xl font-black text-yellow-300">
          7
        </div>

        <h1 className="mt-6 text-2xl font-black">Verifying recovery link</h1>

        {!errorMessage ? (
          <p className="mt-3 text-sm leading-6 text-zinc-400" role="status">
            Please wait while we securely prepare your password reset.
          </p>
        ) : (
          <div className="mt-6">
            <p
              className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-200"
              role="alert"
            >
              {errorMessage}
            </p>
            <Link
              href="/auth/forgot-password"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-yellow-300 px-6 text-sm font-black text-black transition hover:bg-yellow-200"
            >
              Request new email
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
