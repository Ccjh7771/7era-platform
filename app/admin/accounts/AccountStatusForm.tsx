import { setAdminAccountStatus } from "./actions";

type AccountStatusFormProps = {
    userId: string;
    isActive: boolean;
};

export function AccountStatusForm({
    userId,
    isActive,
}: AccountStatusFormProps) {
    return (
        <form
            action={setAdminAccountStatus}
            className="mt-4"
        >
            <input
                type="hidden"
                name="targetUserId"
                value={userId}
            />

            <input
                type="hidden"
                name="requestedStatus"
                value={
                    isActive
                        ? "suspended"
                        : "active"
                }
            />

            <button
                type="submit"
                className={`w-full rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    isActive
                        ? "border-red-400/20 bg-red-400/5 text-red-300 hover:border-red-400/40 hover:bg-red-400/10"
                        : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:border-emerald-400/40 hover:bg-emerald-400/20"
                }`}
            >
                {isActive
                    ? "Suspend Account"
                    : "Reactivate Account"}
            </button>
        </form>
    );
}