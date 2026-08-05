import { requireOwner } from "@/lib/admin/access";
import { createAdminClient } from "@/lib/supabase/admin";

import { createAdminAccount } from "./actions";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { AccountStatusForm } from "./AccountStatusForm";

type AdminAccountsPageProps = {
    searchParams: Promise<{
        error?: string | string[];
        success?: string | string[];
    }>;
};

const errorMessages: Record<string, string> = {
    invalid_reset:
        "Enter a temporary password with 12–72 characters, including uppercase, lowercase, number and symbol.",
    reset_not_allowed:
        "This account password cannot be reset from here.",
    reset_failed:
        "Unable to reset the staff password. Please try again.",
    invalid:
        "Please check all fields. The temporary password must meet every security requirement.",
    username_exists:
        "This username is already being used.",
    server:
        "Unable to check the username. Please try again.",
    create_failed:
        "Unable to create the account. Please try again.",
    profile_failed:
        "The account profile could not be updated.",
    invalid_status:
        "The requested account status is invalid.",
    status_not_allowed:
        "Owner accounts cannot be suspended from this page.",
    status_failed:
        "Unable to update the account status. Please try again.",
};

const successMessages: Record<string, string> = {
    created:
        "Administrator account created successfully. The staff member must change the temporary password after signing in.",
    password_reset:
        "Staff password reset successfully. The staff member must change it after their next login.",
    status_updated:
        "Administrator account status updated successfully.",
};


function getParameter(
    value: string | string[] | undefined,
) {
    return Array.isArray(value)
        ? value[0]
        : value;
}

function formatLastLogin(
    value: string | null,
) {
    if (!value) {
        return "Never";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Unknown";
    }

    return new Intl.DateTimeFormat("en-MY", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kuala_Lumpur",
    }).format(date);
}

export default async function AdminAccountsPage({
    searchParams,
}: AdminAccountsPageProps) {
    const params = await searchParams;

    const errorCode = getParameter(
        params.error,
    );

    const successCode = getParameter(
        params.success,
    );

    await requireOwner();

    const adminClient = createAdminClient();

    const {
        data: accountData,
        error: accountsError,
    } = await adminClient
        .from("admin_profiles")
        .select(
            "id, username, full_name, role, is_active, must_change_password, last_login_at",
        )
        .order("full_name", {
            ascending: true,
        });

    if (accountsError) {
        console.error(
            "Unable to load admin accounts:",
            accountsError.message,
        );
    }

    const accounts = accountData ?? [];

    return (
        <section className="mx-auto max-w-6xl">
            <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                    Owner Control
                </p>

                <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                    Administrator Accounts
                </h1>

                <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
                    Create and review the accounts that
                    can access the 7ERA administration
                    dashboard.
                </p>
            </div>

            {successCode && successMessages[successCode] && (
                <div
                    className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-200"
                    role="status"
                >
                    {successMessages[successCode]}
                </div>
            )}

            {errorCode && (
                <div
                    className="mt-8 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200"
                    role="alert"
                >
                    {errorMessages[errorCode] ??
                        "An unexpected error occurred."}
                </div>
            )}

            <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
                    <h2 className="text-xl font-black text-white">
                        Create account
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                        Give the staff member their
                        username and temporary password
                        privately.
                    </p>

                    <form
                        action={createAdminAccount}
                        className="mt-7 space-y-6"
                    >
                        <div>
                            <label
                                htmlFor="account-full-name"
                                className="text-sm font-semibold text-zinc-200"
                            >
                                Full name
                            </label>

                            <input
                                id="account-full-name"
                                name="fullName"
                                type="text"
                                required
                                minLength={2}
                                maxLength={80}
                                autoComplete="off"
                                placeholder="Staff full name"
                                className="mt-3 h-14 w-full rounded-2xl border border-white/10 bg-black/50 px-5 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="account-username"
                                className="text-sm font-semibold text-zinc-200"
                            >
                                Username
                            </label>

                            <input
                                id="account-username"
                                name="username"
                                type="text"
                                required
                                minLength={3}
                                maxLength={32}
                                pattern="[A-Za-z0-9][A-Za-z0-9._-]{2,31}"
                                autoComplete="off"
                                placeholder="staff.username"
                                className="mt-3 h-14 w-full rounded-2xl border border-white/10 bg-black/50 px-5 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10"
                            />

                            <p className="mt-2 text-xs leading-5 text-zinc-600">
                                Use letters, numbers,
                                dots, underscores or
                                hyphens.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="account-role"
                                className="text-sm font-semibold text-zinc-200"
                            >
                                Account role
                            </label>

                            <select
                                id="account-role"
                                name="role"
                                required
                                defaultValue="editor"
                                className="mt-3 h-14 w-full rounded-2xl border border-white/10 bg-black/50 px-5 text-white outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10"
                            >
                                <option value="owner">
                                    Owner (full access)
                                </option>

                                <option value="editor">
                                    Editor
                                </option>

                                <option value="viewer">
                                    Viewer
                                </option>
                            </select>

                            <p className="mt-2 text-xs leading-5 text-zinc-600">
                                Owners have full access,
                                including staff accounts and
                                settings. Editors manage
                                operations and content.
                                Viewers receive read-only
                                access.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="account-temporary-password"
                                className="text-sm font-semibold text-zinc-200"
                            >
                                Temporary password
                            </label>

                            <input
                                id="account-temporary-password"
                                name="temporaryPassword"
                                type="password"
                                required
                                minLength={12}
                                maxLength={72}
                                autoComplete="new-password"
                                placeholder="Create a temporary password"
                                className="mt-3 h-14 w-full rounded-2xl border border-white/10 bg-black/50 px-5 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10"
                            />

                            <p className="mt-2 text-xs leading-5 text-zinc-600">
                                12–72 characters with
                                uppercase, lowercase, a
                                number and a symbol.
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 px-6 text-sm font-black text-black shadow-[0_0_30px_rgba(250,204,21,0.2)] transition hover:scale-[1.01]"
                        >
                            Create administrator
                        </button>
                    </form>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-black text-white">
                                Existing accounts
                            </h2>

                            <p className="mt-2 text-sm text-zinc-500">
                                {accounts.length} account
                                {accounts.length === 1
                                    ? ""
                                    : "s"}
                            </p>
                        </div>
                    </div>

                    {accountsError && (
                        <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                            Unable to load administrator
                            accounts.
                        </p>
                    )}

                    {!accountsError &&
                        accounts.length === 0 && (
                            <p className="mt-6 rounded-2xl border border-white/10 px-4 py-8 text-center text-sm text-zinc-500">
                                No administrator accounts
                                found.
                            </p>
                        )}

                    <div className="mt-6 space-y-4">
                        {accounts.map((account) => (
                            <article
                                key={account.id}
                                className="rounded-2xl border border-white/10 bg-black/30 p-5"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-white">
                                            {account.full_name}
                                        </h3>

                                        <p className="mt-1 text-sm text-zinc-500">
                                            @{account.username}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-yellow-300">
                                            {account.role}
                                        </span>

                                        <span
                                            className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${account.is_active
                                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                                : "border-red-400/20 bg-red-400/10 text-red-300"
                                                }`}
                                        >
                                            {account.is_active
                                                ? "Active"
                                                : "Suspended"}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-3 border-t border-white/10 pt-4 text-xs text-zinc-500 sm:grid-cols-2">
                                    {account.role !== "owner" && (
                                        <>
                                            <ResetPasswordForm
                                                userId={account.id}
                                            />

                                            <AccountStatusForm
                                                userId={account.id}
                                                isActive={account.is_active}
                                            />
                                        </>
                                    )}
                                    <p>
                                        Last login:{" "}
                                        <span className="text-zinc-300">
                                            {formatLastLogin(
                                                account.last_login_at,
                                            )}
                                        </span>
                                    </p>

                                    <p>
                                        Password:{" "}
                                        <span className="text-zinc-300">
                                            {account.must_change_password
                                                ? "Change required"
                                                : "Current"}
                                        </span>
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
