import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { updateRequiredPassword } from "./actions";

type UpdatePasswordPageProps = {
    searchParams: Promise<{
        required?: string | string[];
        error?: string | string[];
    }>;
};

const errorMessages: Record<string, string> = {
    invalid:
        "Please check all password fields. The new passwords must match and contain at least one letter and one number.",
    update_failed:
    "Unable to update the password. Please try again.",
    profile_failed:
        "Your password changed, but the account status could not be updated. Please contact the account owner.",
};

function getParameter(
    value: string | string[] | undefined,
) {
    return Array.isArray(value)
        ? value[0]
        : value;
}

export default async function UpdatePasswordPage({
    searchParams,
}: UpdatePasswordPageProps) {
    const params = await searchParams;

    const errorCode = getParameter(
        params.error,
    );

    const passwordChangeRequired =
        getParameter(params.required) === "1";

    const supabase = await createClient();

    const {
        data: claimsData,
        error: claimsError,
    } = await supabase.auth.getClaims();

    if (
        claimsError ||
        !claimsData?.claims?.sub
    ) {
        redirect("/auth/login");
    }

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

                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-yellow-300">
                        Account Security
                    </p>

                    <h1 className="mt-3 text-3xl font-black">
                        Change your password
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {passwordChangeRequired
                            ? "You must create a new password before accessing the administration dashboard."
                            : "Update the password used to access your administrator account."}
                    </p>
                </div>

                <form
                    action={updateRequiredPassword}
                    className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8"
                >
                    

                    <div className="mt-6">
                        <label
                            htmlFor="new-password"
                            className="text-sm font-semibold text-zinc-200"
                        >
                            New password
                        </label>

                        <input
                            id="new-password"
                            name="newPassword"
                            type="password"
                            required
                            minLength={6}
                            maxLength={72}
                            autoComplete="new-password"
                            placeholder="Enter new password"
                            className="mt-3 h-14 w-full rounded-2xl border border-white/10 bg-black/50 px-5 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10"
                        />

                        <p className="mt-2 text-xs leading-5 text-zinc-600">
                            Minimum 6 characters with at
                            least one letter and one
                            number.
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="confirm-password"
                            className="text-sm font-semibold text-zinc-200"
                        >
                            Confirm new password
                        </label>

                        <input
                            id="confirm-password"
                            name="confirmPassword"
                            type="password"
                            required
                            minLength={6}
                            maxLength={72}
                            autoComplete="new-password"
                            placeholder="Enter new password again"
                            className="mt-3 h-14 w-full rounded-2xl border border-white/10 bg-black/50 px-5 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10"
                        />
                    </div>

                    {errorCode && (
                        <p
                            className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-200"
                            role="alert"
                        >
                            {errorMessages[errorCode] ??
                                "Unable to update your password."}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="mt-7 flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 px-6 text-sm font-black text-black shadow-[0_0_30px_rgba(250,204,21,0.22)] transition hover:scale-[1.01]"
                    >
                        Update password and continue
                    </button>
                </form>

                {!passwordChangeRequired && (
                    <div className="mt-7 text-center">
                        <Link
                            href="/admin"
                            className="text-sm text-zinc-500 transition hover:text-yellow-300"
                        >
                            ← Return to dashboard
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}