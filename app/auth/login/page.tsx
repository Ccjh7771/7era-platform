import Link from "next/link";

import { loginAdmin } from "./actions";

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

const errorMessages: Record<string, string> = {
  invalid:
    "Invalid username or password. Please try again.",
  "rate-limit":
    "Too many failed attempts. Please wait 15 minutes before trying again.",
  unauthorized:
    "This account is not authorized to access the admin area.",
  recovery:
    "This recovery link is invalid or expired. Please request a new one.",
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = await searchParams;

  const errorCode = Array.isArray(params.error)
    ? params.error[0]
    : params.error;

  const errorMessage = errorCode
    ? errorMessages[errorCode] ??
      "Unable to sign in. Please try again."
    : "";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-16 text-white">
      <div
        className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-[150px]"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-400/30 bg-yellow-400/10 text-2xl font-black text-yellow-300 shadow-[0_0_40px_rgba(250,204,21,0.18)]">
            7
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.35em] text-yellow-300">
            Secure Administration
          </p>

          <h1 className="mt-3 text-3xl font-black">
            7ERA Admin Login
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Sign in using your authorized administrator
            username and password.
          </p>
        </div>

        <form
          action={loginAdmin}
          className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        >
          <div>
            <label
              htmlFor="admin-username"
              className="text-sm font-semibold text-zinc-200"
            >
              Username
            </label>

            <input
              id="admin-username"
              name="username"
              type="text"
              autoComplete="username"
              required
              minLength={3}
              maxLength={32}
              pattern="[a-zA-Z0-9._-]+"
              className="mt-3 h-14 w-full rounded-2xl border border-white/10 bg-black/50 px-5 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10"
              placeholder="Enter your username"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="admin-password"
              className="text-sm font-semibold text-zinc-200"
            >
              Password
            </label>

            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              maxLength={72}
              className="mt-3 h-14 w-full rounded-2xl border border-white/10 bg-black/50 px-5 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10"
              placeholder="Enter your password"
            />
          </div>

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
            className="mt-7 flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 px-6 text-sm font-black text-black shadow-[0_0_30px_rgba(250,204,21,0.22)] transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
          >
            Sign in securely
          </button>

          <div className="mt-5 text-center">
            <Link
              href="/auth/forgot-password"
              className="text-sm font-semibold text-yellow-300 transition hover:text-yellow-200"
            >
              Forgot password?
            </Link>
          </div>
        </form>

        <div className="mt-7 text-center">
          <Link
            href="/"
            className="text-sm text-zinc-500 transition hover:text-yellow-300"
          >
            ← Return to 7ERA Platform
          </Link>
        </div>
      </div>
    </main>
  );
}
