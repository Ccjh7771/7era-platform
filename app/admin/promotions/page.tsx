import Image from "next/image";
import { requireAdmin } from "@/lib/admin/access";
import { createAdminClient } from "@/lib/supabase/admin";

import {
    createPromotion,
    setPromotionVisibility,
    updatePromotion,
} from "./actions";
import { PromotionImageUploadField } from "./PromotionImageUploadField";

type AdminPromotionsPageProps = {
    searchParams: Promise<{
        error?: string | string[];
        success?: string | string[];
    }>;
};

type PromotionRow = {
    id: number;
    slug: string;
    title: string;
    subtitle: string;
    description: string;
    category: string;
    validity_label: string;
    image_path: string | null;
    href: string;
    status: "active" | "upcoming" | "ended";
    is_featured: boolean;
    is_disabled: boolean;
    sort_order: number;
    is_active: boolean;
};

const errorMessages: Record<string, string> = {
    forbidden:
        "Your account has read-only access to promotion content.",
    invalid: "Check the promotion fields and try again.",
    duplicate: "A promotion with this slug already exists.",
    invalid_image:
        "Choose a valid PNG, JPG or WebP image up to 2MB.",
    upload_failed:
        "The promotion image could not be uploaded. Please try again.",
    server: "The promotion could not be saved. Please try again.",
};

const successMessages: Record<string, string> = {
    created: "Promotion created successfully.",
    updated: "Promotion details updated successfully.",
    visibility_updated:
        "Promotion visibility updated successfully.",
};

const inputClassName =
    "mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10";
const textareaClassName =
    "mt-2 min-h-24 w-full resize-y rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10";
const checkboxClassName =
    "h-4 w-4 rounded border-white/20 bg-black text-yellow-300 accent-yellow-300";

function getParameter(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

function PromotionFields({
    promotion,
    idPrefix,
}: {
    promotion?: PromotionRow;
    idPrefix: string;
}) {
    return (
        <div className="grid gap-5 sm:grid-cols-2">
            <div>
                <label
                    htmlFor={`${idPrefix}-title`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Promotion title
                </label>
                <input
                    id={`${idPrefix}-title`}
                    name="title"
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    defaultValue={promotion?.title}
                    placeholder="Welcome Reward"
                    className={inputClassName}
                />
            </div>

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
                    defaultValue={promotion?.slug}
                    placeholder="welcome-reward"
                    className={inputClassName}
                />
            </div>

            <PromotionImageUploadField
                currentImageUrl={promotion?.image_path}
                idPrefix={idPrefix}
            />

            <div className="sm:col-span-2">
                <label
                    htmlFor={`${idPrefix}-subtitle`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Subtitle
                </label>
                <input
                    id={`${idPrefix}-subtitle`}
                    name="subtitle"
                    type="text"
                    maxLength={140}
                    defaultValue={promotion?.subtitle}
                    placeholder="Exclusive New Member Package"
                    className={inputClassName}
                />
            </div>

            <div className="sm:col-span-2">
                <label
                    htmlFor={`${idPrefix}-description`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Description
                </label>
                <textarea
                    id={`${idPrefix}-description`}
                    name="description"
                    maxLength={500}
                    defaultValue={promotion?.description}
                    placeholder="Promotion details"
                    className={textareaClassName}
                />
            </div>

            <div>
                <label
                    htmlFor={`${idPrefix}-category`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Category
                </label>
                <input
                    id={`${idPrefix}-category`}
                    name="category"
                    type="text"
                    required
                    maxLength={60}
                    defaultValue={promotion?.category}
                    placeholder="New Member"
                    className={inputClassName}
                />
            </div>

            <div>
                <label
                    htmlFor={`${idPrefix}-status`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Campaign status
                </label>
                <select
                    id={`${idPrefix}-status`}
                    name="status"
                    required
                    defaultValue={promotion?.status ?? "active"}
                    className={inputClassName}
                >
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ended">Ended</option>
                </select>
            </div>

            <div>
                <label
                    htmlFor={`${idPrefix}-validity`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Validity label
                </label>
                <input
                    id={`${idPrefix}-validity`}
                    name="validityLabel"
                    type="text"
                    required
                    maxLength={100}
                    defaultValue={promotion?.validity_label}
                    placeholder="Limited-time campaign"
                    className={inputClassName}
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
                    defaultValue={promotion?.sort_order ?? 50}
                    className={inputClassName}
                />
            </div>

            <div className="sm:col-span-2">
                <label
                    htmlFor={`${idPrefix}-href`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Promotion link
                </label>
                <input
                    id={`${idPrefix}-href`}
                    name="href"
                    type="text"
                    required
                    defaultValue={promotion?.href ?? "#"}
                    placeholder="https://..., /page or #"
                    className={inputClassName}
                />
            </div>

            <div className="sm:col-span-2 flex flex-wrap gap-6 rounded-2xl border border-white/10 bg-black/30 p-4">
                <label className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
                    <input
                        name="isFeatured"
                        type="checkbox"
                        defaultChecked={promotion?.is_featured ?? false}
                        className={checkboxClassName}
                    />
                    Featured promotion
                </label>
                <label className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
                    <input
                        name="isDisabled"
                        type="checkbox"
                        defaultChecked={promotion?.is_disabled ?? false}
                        className={checkboxClassName}
                    />
                    Disable promotion button
                </label>
            </div>
        </div>
    );
}

export default async function AdminPromotionsPage({
    searchParams,
}: AdminPromotionsPageProps) {
    const params = await searchParams;
    const errorCode = getParameter(params.error);
    const successCode = getParameter(params.success);
    const currentAdmin = await requireAdmin();
    const canEdit = currentAdmin.role !== "viewer";
    const adminClient = createAdminClient();
    const { data: promotionData, error: promotionsError } =
        await adminClient
            .from("promotions")
            .select(
                "id, slug, title, subtitle, description, category, validity_label, image_path, href, status, is_featured, is_disabled, sort_order, is_active",
            )
            .order("sort_order", { ascending: true })
            .order("id", { ascending: true });

    if (promotionsError) {
        console.error(
            "Unable to load promotions:",
            promotionsError.message,
        );
    }

    const promotions = (promotionData ?? []) as PromotionRow[];

    return (
        <section className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                        Content Management
                    </p>
                    <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                        Promotions
                    </h1>
                    <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
                        Manage campaigns shown on the public Promotions page.
                    </p>
                </div>
                <div className="flex gap-3 text-sm">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-zinc-300">
                        {promotions.length} total
                    </span>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-emerald-300">
                        {promotions.filter((item) => item.is_active).length} visible
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
                    {errorMessages[errorCode] ??
                        "An unexpected error occurred."}
                </div>
            )}

            {!canEdit && !errorCode && (
                <div className="mt-8 rounded-2xl border border-blue-400/20 bg-blue-400/10 px-5 py-4 text-sm text-blue-200">
                    Viewer access is read-only. Ask the owner for an Editor
                    account to change content.
                </div>
            )}

            {canEdit && (
                <details className="mt-10 rounded-[28px] border border-yellow-400/20 bg-yellow-400/[0.05] p-6 sm:p-8">
                    <summary className="cursor-pointer text-lg font-black text-yellow-200">
                        Add a new promotion
                    </summary>
                    <form action={createPromotion} className="mt-7">
                        <PromotionFields idPrefix="new-promotion" />
                        <button
                            type="submit"
                            className="mt-6 flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 px-6 text-sm font-black text-black transition hover:scale-[1.01]"
                        >
                            Create promotion
                        </button>
                    </form>
                </details>
            )}

            {promotionsError && (
                <p className="mt-10 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">
                    Unable to load promotions from the database.
                </p>
            )}

            <div className="mt-10 grid gap-6 xl:grid-cols-2">
                {promotions.map((promotion) => (
                    <article
                        key={promotion.id}
                        className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-8"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-5">
                            <div className="flex items-center gap-4">
                                <div className="relative flex h-16 w-24 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                                    {promotion.image_path ? (
                                        <Image
                                            src={promotion.image_path}
                                            alt={`${promotion.title} image`}
                                            fill
                                            sizes="96px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="text-xl font-black text-yellow-300">
                                            7
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white">
                                        {promotion.title}
                                    </h2>
                                    <p className="mt-1 text-xs capitalize text-zinc-500">
                                        {promotion.category} · {promotion.status} · Order {promotion.sort_order}
                                    </p>
                                </div>
                            </div>
                            <span
                                className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                                    promotion.is_active
                                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                        : "border-zinc-400/20 bg-zinc-400/10 text-zinc-400"
                                }`}
                            >
                                {promotion.is_active ? "Visible" : "Hidden"}
                            </span>
                        </div>

                        <p className="mt-5 text-sm leading-7 text-zinc-400">
                            {promotion.description || "No description provided."}
                        </p>

                        {canEdit && (
                            <div className="mt-6 border-t border-white/10 pt-6">
                                <form action={setPromotionVisibility}>
                                    <input
                                        type="hidden"
                                        name="promotionId"
                                        value={promotion.id}
                                    />
                                    <input
                                        type="hidden"
                                        name="requestedVisibility"
                                        value={
                                            promotion.is_active
                                                ? "hidden"
                                                : "visible"
                                        }
                                    />
                                    <button
                                        type="submit"
                                        className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-zinc-300 transition hover:border-yellow-400/30 hover:text-yellow-300"
                                    >
                                        {promotion.is_active
                                            ? "Hide from website"
                                            : "Show on website"}
                                    </button>
                                </form>

                                <details className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
                                    <summary className="cursor-pointer text-sm font-bold text-zinc-200">
                                        Edit promotion details
                                    </summary>
                                    <form action={updatePromotion} className="mt-6">
                                        <input
                                            type="hidden"
                                            name="promotionId"
                                            value={promotion.id}
                                        />
                                        <PromotionFields
                                            promotion={promotion}
                                            idPrefix={`promotion-${promotion.id}`}
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
