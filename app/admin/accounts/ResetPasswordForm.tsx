import { resetAdminPassword } from "./actions";

type ResetPasswordFormProps = {
    userId: string;
};

export function ResetPasswordForm({
    userId,
}: ResetPasswordFormProps) {
    return (
        <form
            action={resetAdminPassword}
            className="mt-5 border-t border-white/10 pt-5"
        >
            <input
                type="hidden"
                name="targetUserId"
                value={userId}
            />

            <label
                htmlFor={`reset-password-${userId}`}
                className="text-xs font-bold uppercase tracking-wider text-zinc-500"
            >
                New temporary password
            </label>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                    id={`reset-password-${userId}`}
                    name="temporaryPassword"
                    type="password"
                    required
                    minLength={12}
                    maxLength={72}
                    autoComplete="new-password"
                    placeholder="Create a strong temporary password"
                    className="h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-black/50 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/50"
                />

                <button
                    type="submit"
                    className="h-12 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-5 text-sm font-bold text-yellow-300 transition hover:border-yellow-400/40 hover:bg-yellow-400/20"
                >
                    Reset Password
                </button>
            </div>

            <p className="mt-2 text-xs leading-5 text-zinc-600">
                12–72 characters with uppercase,
                lowercase, a number and a symbol. The
                staff member will be required to change
                it after login.
            </p>
        </form>
    );
}
