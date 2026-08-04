import { requireAdmin } from "@/lib/admin/access";
import { createAdminClient } from "@/lib/supabase/admin";

import {
    createFAQItem,
    setFAQVisibility,
    updateFAQItem,
} from "./actions";

type AdminFAQPageProps = {
    searchParams: Promise<{
        error?: string | string[];
        success?: string | string[];
    }>;
};

type FAQRow = {
    id: number;
    slug: string;
    category:
        | "download"
        | "promotion"
        | "account"
        | "technical"
        | "security";
    question: string;
    answer: string;
    sort_order: number;
    is_active: boolean;
};

const errorMessages: Record<string, string> = {
    forbidden: "Your account has read-only access to FAQ content.",
    invalid: "Check the FAQ fields and try again.",
    duplicate: "An FAQ item with this slug already exists.",
    server: "The FAQ item could not be saved. Please try again.",
};

const successMessages: Record<string, string> = {
    created: "FAQ item created successfully.",
    updated: "FAQ item updated successfully.",
    visibility_updated: "FAQ visibility updated successfully.",
};

const inputClassName =
    "mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10";
const textareaClassName =
    "mt-2 min-h-32 w-full resize-y rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10";

function getParameter(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

function FAQFields({
    item,
    idPrefix,
}: {
    item?: FAQRow;
    idPrefix: string;
}) {
    return (
        <div className="grid gap-5 sm:grid-cols-2">
            <div>
                <label
                    htmlFor={`${idPrefix}-slug`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Slug
                </label>
                <input
                    id={`${idPrefix}-slug`}
                    name="slug"
                    type="text"
                    required
                    maxLength={100}
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    defaultValue={item?.slug}
                    placeholder="account-login-help"
                    className={inputClassName}
                />
            </div>

            <div>
                <label
                    htmlFor={`${idPrefix}-category`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Category
                </label>
                <select
                    id={`${idPrefix}-category`}
                    name="category"
                    required
                    defaultValue={item?.category ?? "account"}
                    className={inputClassName}
                >
                    <option value="download">Download</option>
                    <option value="promotion">Promotion</option>
                    <option value="account">Account</option>
                    <option value="technical">Technical</option>
                    <option value="security">Security</option>
                </select>
            </div>

            <div className="sm:col-span-2">
                <label
                    htmlFor={`${idPrefix}-question`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Question
                </label>
                <input
                    id={`${idPrefix}-question`}
                    name="question"
                    type="text"
                    required
                    minLength={5}
                    maxLength={200}
                    defaultValue={item?.question}
                    placeholder="How can we help?"
                    className={inputClassName}
                />
            </div>

            <div className="sm:col-span-2">
                <label
                    htmlFor={`${idPrefix}-answer`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Answer
                </label>
                <textarea
                    id={`${idPrefix}-answer`}
                    name="answer"
                    required
                    minLength={5}
                    maxLength={2000}
                    defaultValue={item?.answer}
                    placeholder="Write a clear answer for website visitors."
                    className={textareaClassName}
                />
            </div>

            <div>
                <label
                    htmlFor={`${idPrefix}-sort-order`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Display order
                </label>
                <input
                    id={`${idPrefix}-sort-order`}
                    name="sortOrder"
                    type="number"
                    required
                    min="0"
                    max="9999"
                    step="1"
                    defaultValue={item?.sort_order ?? 50}
                    className={inputClassName}
                />
            </div>
        </div>
    );
}

export default async function AdminFAQPage({
    searchParams,
}: AdminFAQPageProps) {
    const params = await searchParams;
    const errorCode = getParameter(params.error);
    const successCode = getParameter(params.success);
    const currentAdmin = await requireAdmin();
    const canEdit = currentAdmin.role !== "viewer";
    const adminClient = createAdminClient();
    const { data: faqData, error: faqError } = await adminClient
        .from("faq_items")
        .select(
            "id, slug, category, question, answer, sort_order, is_active",
        )
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });
    const faqItems = (faqData ?? []) as FAQRow[];

    if (faqError) {
        console.error("Unable to load FAQ items:", faqError.message);
    }

    return (
        <section className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                        Content Management
                    </p>
                    <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                        FAQ
                    </h1>
                    <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
                        Manage questions and answers shown in the public Help Center.
                    </p>
                </div>
                <div className="flex gap-3 text-sm">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-zinc-300">
                        {faqItems.length} total
                    </span>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-emerald-300">
                        {faqItems.filter((item) => item.is_active).length} visible
                    </span>
                </div>
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
                    {errorMessages[errorCode] ?? "An unexpected error occurred."}
                </div>
            )}

            {!canEdit && !errorCode && (
                <div className="mt-8 rounded-2xl border border-blue-400/20 bg-blue-400/10 px-5 py-4 text-sm text-blue-200">
                    Viewer access is read-only. Ask the owner for an Editor account to change content.
                </div>
            )}

            {canEdit && (
                <details className="mt-10 rounded-[28px] border border-yellow-400/20 bg-yellow-400/[0.05] p-6 sm:p-8">
                    <summary className="cursor-pointer text-lg font-black text-yellow-200">
                        Add a new FAQ item
                    </summary>
                    <form action={createFAQItem} className="mt-7">
                        <FAQFields idPrefix="new-faq" />
                        <button
                            type="submit"
                            className="mt-6 flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 px-6 text-sm font-black text-black transition hover:scale-[1.01]"
                        >
                            Create FAQ item
                        </button>
                    </form>
                </details>
            )}

            {faqError && (
                <p className="mt-10 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">
                    Unable to load FAQ items from the database.
                </p>
            )}

            <div className="mt-10 grid gap-6 xl:grid-cols-2">
                {faqItems.map((item) => (
                    <article
                        key={item.id}
                        className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-8"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-5">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
                                    {item.category} · Order {item.sort_order}
                                </p>
                                <h2 className="mt-3 text-xl font-black leading-8 text-white">
                                    {item.question}
                                </h2>
                            </div>
                            <span
                                className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                                    item.is_active
                                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                        : "border-zinc-400/20 bg-zinc-400/10 text-zinc-400"
                                }`}
                            >
                                {item.is_active ? "Visible" : "Hidden"}
                            </span>
                        </div>

                        <p className="mt-5 whitespace-pre-line text-sm leading-7 text-zinc-400">
                            {item.answer}
                        </p>

                        {canEdit && (
                            <div className="mt-6 border-t border-white/10 pt-6">
                                <form action={setFAQVisibility}>
                                    <input type="hidden" name="faqId" value={item.id} />
                                    <input
                                        type="hidden"
                                        name="requestedVisibility"
                                        value={item.is_active ? "hidden" : "visible"}
                                    />
                                    <button
                                        type="submit"
                                        className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-zinc-300 transition hover:border-yellow-400/30 hover:text-yellow-300"
                                    >
                                        {item.is_active
                                            ? "Hide from website"
                                            : "Show on website"}
                                    </button>
                                </form>

                                <details className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
                                    <summary className="cursor-pointer text-sm font-bold text-zinc-200">
                                        Edit FAQ details
                                    </summary>
                                    <form action={updateFAQItem} className="mt-6">
                                        <input type="hidden" name="faqId" value={item.id} />
                                        <FAQFields
                                            item={item}
                                            idPrefix={`faq-${item.id}`}
                                        />
                                        <button
                                            type="submit"
                                            className="mt-6 flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-black text-black transition hover:bg-yellow-300"
                                        >
                                            Save changes
                                        </button>
                                    </form>
                                </details>
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </section>
    );
}
