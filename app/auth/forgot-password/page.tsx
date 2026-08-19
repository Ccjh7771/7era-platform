"use client";

import Link from "next/link";
import {
  type FormEvent,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");
  const [submitting, setSubmitting] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");
    setSubmitting(true);

    const supabase = createClient();

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      );

    if (error) {
      setErrorMessage(
        "Unable to send the recovery email. Please try again later.",
      );
      setSubmitting(false);
      return;
    }

    setMessage(
      "If this email belongs to an administrator, a password recovery link has been sent.",
    );
    setSubmitting(false);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-16 text-white">
      <div
        className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-[150px]"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-400/30 bg-yellow-400/10 text-2xl font-black text-yellow-300">
            7
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.35em] text-yellow-300">
            Account Recovery
          </p>

          <h1 className="mt-3 text-3xl font-black">
            Reset your password
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Enter your administrator email to receive
            a secure recovery link.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        >
          <label
            htmlFor="recovery-email"
            className="text-sm font-semibold text-zinc-200"
          >
            Administrator email
          </label>

          <input
            id="recovery-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            autoComplete="email"
            required
            className="mt-3 h-14 w-full rounded-2xl border border-white/10 bg-black/50 px-5 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10"
            placeholder="admin@example.com"
          />

          {message && (
            <p
              className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm leading-6 text-emerald-200"
              role="status"
            >
              {message}
            </p>
          )}

          {errorMessage && (
            <p
              className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-200"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-7 flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 px-6 text-sm font-black text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Sending..."
              : "Send recovery email"}
          </button>
        </form>

        <div className="mt-7 text-center">
          <Link
            href="/auth/login"
            className="text-sm text-zinc-500 transition hover:text-yellow-300"
          >
            ← Return to admin login
          </Link>
        </div>
      </div>
    </main>
  );
}
