import Image from "next/image";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

import {
    createBrand,
    setBrandStatus,
    updateBrand,
} from "./actions";

type AdminBrandsPageProps = {
    searchParams: Promise<{
        error?: string | string[];
        success?: string | string[];
    }>;
};

type BrandRow = {
    id: number;
    name: string;
    description: string;
    rating: number | string;
    whatsapp_url: string;
    heylink_url: string;
    logo_path: string;
    sort_order: number;
    is_active: boolean;
};

const errorMessages: Record<string, string> = {
    forbidden:
        "Your account has read-only access to brand content.",
    invalid:
        "Check the brand fields and try again.",
    duplicate:
        "A brand with this name already exists.",
    server:
        "The brand could not be saved. Please try again.",
};

const successMessages: Record<string, string> = {
    created: "Brand created successfully.",
    updated: "Brand details updated successfully.",
    status_updated:
        "Brand visibility updated successfully.",
};

const inputClassName =
    "mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10";

const textareaClassName =
    "mt-2 min-h-24 w-full resize-y rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10";

function getParameter(
    value: string | string[] | undefined,
) {
    return Array.isArray(value)
        ? value[0]
        : value;
}

function BrandFields({
    brand,
    idPrefix,
}: {
    brand?: BrandRow;
    idPrefix: string;
}) {
    return (
        <div className="grid gap-5 sm:grid-cols-2">
            <div>
                <label
                    htmlFor={`${idPrefix}-name`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Brand name
                </label>

                <input
                    id={`${idPrefix}-name`}
                    name="name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={80}
                    defaultValue={brand?.name}
                    placeholder="7ERA Club"
                    className={inputClassName}
                />
            </div>

            <div>
                <label
                    htmlFor={`${idPrefix}-logo-path`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Logo path
                </label>

                <input
                    id={`${idPrefix}-logo-path`}
                    name="logoPath"
                    type="text"
                    required
                    maxLength={500}
                    pattern="/[^/].*"
                    defaultValue={brand?.logo_path}
                    placeholder="/brands/brand.png"
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
                    maxLength={300}
                    defaultValue={brand?.description}
                    placeholder="Short brand description"
                    className={textareaClassName}
                />
            </div>

            <div>
                <label
                    htmlFor={`${idPrefix}-rating`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Rating
                </label>

                <input
                    id={`${idPrefix}-rating`}
                    name="rating"
                    type="number"
                    required
                    min="1"
                    max="5"
                    step="0.1"
                    defaultValue={
                        brand
                            ? Number(brand.rating)
                            : 5
                    }
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
                    defaultValue={brand?.sort_order ?? 50}
                    className={inputClassName}
                />
            </div>

            <div>
                <label
                    htmlFor={`${idPrefix}-whatsapp`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    WhatsApp URL
                </label>

                <input
                    id={`${idPrefix}-whatsapp`}
                    name="whatsappUrl"
                    type="text"
                    required
                    defaultValue={brand?.whatsapp_url ?? "#"}
                    placeholder="https://wa.me/... or #"
                    className={inputClassName}
                />
            </div>

            <div>
                <label
                    htmlFor={`${idPrefix}-heylink`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    HeyLink URL
                </label>

                <input
                    id={`${idPrefix}-heylink`}
                    name="heylinkUrl"
                    type="text"
                    required
                    defaultValue={brand?.heylink_url ?? "#"}
                    placeholder="https://heylink.me/... or #"
                    className={inputClassName}
                />
            </div>
        </div>
    );
}

export default async function AdminBrandsPage({
    searchParams,
}: AdminBrandsPageProps) {
    const params = await searchParams;

    const errorCode = getParameter(params.error);
    const successCode = getParameter(params.success);

    const supabase = await createClient();

    const {
        data: claimsData,
        error: claimsError,
    } = await supabase.auth.getClaims();

    const userId = claimsData?.claims?.sub;

    if (claimsError || !userId) {
        redirect("/auth/login");
    }

    const {
        data: currentAdmin,
        error: adminError,
    } = await supabase
        .from("admin_profiles")
        .select("role, is_active")
        .eq("id", userId)
        .single();

    if (
        adminError ||
        !currentAdmin ||
        !currentAdmin.is_active
    ) {
        redirect("/auth/login?error=unauthorized");
    }

    const canEdit = [
        "owner",
        "editor",
    ].includes(currentAdmin.role);

    const adminClient = createAdminClient();

    const {
        data: brandData,
        error: brandsError,
    } = await adminClient
        .from("brands")
        .select(
            "id, name, description, rating, whatsapp_url, heylink_url, logo_path, sort_order, is_active",
        )
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });

    if (brandsError) {
        console.error(
            "Unable to load brands:",
            brandsError.message,
        );
    }

    const brands = (brandData ?? []) as BrandRow[];

    return (
        <section className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                        Content Management
                    </p>

                    <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                        Brands
                    </h1>

                    <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
                        Manage the brand cards shown on the
                        public 7ERA Platform homepage.
                    </p>
                </div>

                <div className="flex gap-3 text-sm">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-zinc-300">
                        {brands.length} total
                    </span>

                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-emerald-300">
                        {brands.filter((brand) => brand.is_active).length} active
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
                    Viewer access is read-only. Ask the owner
                    for an Editor account to change content.
                </div>
            )}

            {canEdit && (
                <details className="mt-10 rounded-[28px] border border-yellow-400/20 bg-yellow-400/[0.05] p-6 sm:p-8">
                    <summary className="cursor-pointer text-lg font-black text-yellow-200">
                        Add a new brand
                    </summary>

                    <form
                        action={createBrand}
                        className="mt-7"
                    >
                        <BrandFields idPrefix="new-brand" />

                        <button
                            type="submit"
                            className="mt-6 flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 px-6 text-sm font-black text-black transition hover:scale-[1.01]"
                        >
                            Create brand
                        </button>
                    </form>
                </details>
            )}

            {brandsError && (
                <p className="mt-10 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">
                    Unable to load brands from the database.
                </p>
            )}

            {!brandsError && brands.length === 0 && (
                <p className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.04] px-6 py-12 text-center text-zinc-500">
                    No brands have been created yet.
                </p>
            )}

            <div className="mt-10 grid gap-6 xl:grid-cols-2">
                {brands.map((brand) => (
                    <article
                        key={brand.id}
                        className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-8"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-5">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-2">
                                    <Image
                                        src={brand.logo_path}
                                        alt={`${brand.name} logo`}
                                        width={56}
                                        height={56}
                                        className="h-full w-full object-contain"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-xl font-black text-white">
                                        {brand.name}
                                    </h2>

                                    <p className="mt-1 text-xs text-zinc-500">
                                        Order {brand.sort_order} · Rating {Number(brand.rating).toFixed(1)}
                                    </p>
                                </div>
                            </div>

                            <span
                                className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                                    brand.is_active
                                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                        : "border-zinc-400/20 bg-zinc-400/10 text-zinc-400"
                                }`}
                            >
                                {brand.is_active
                                    ? "Active"
                                    : "Hidden"}
                            </span>
                        </div>

                        <p className="mt-5 text-sm leading-7 text-zinc-400">
                            {brand.description ||
                                "No description provided."}
                        </p>

                        {canEdit && (
                            <div className="mt-6 border-t border-white/10 pt-6">
                                <form action={setBrandStatus}>
                                    <input
                                        type="hidden"
                                        name="brandId"
                                        value={brand.id}
                                    />

                                    <input
                                        type="hidden"
                                        name="requestedStatus"
                                        value={
                                            brand.is_active
                                                ? "inactive"
                                                : "active"
                                        }
                                    />

                                    <button
                                        type="submit"
                                        className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-zinc-300 transition hover:border-yellow-400/30 hover:text-yellow-300"
                                    >
                                        {brand.is_active
                                            ? "Hide from website"
                                            : "Show on website"}
                                    </button>
                                </form>

                                <details className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
                                    <summary className="cursor-pointer text-sm font-bold text-zinc-200">
                                        Edit brand details
                                    </summary>

                                    <form
                                        action={updateBrand}
                                        className="mt-6"
                                    >
                                        <input
                                            type="hidden"
                                            name="brandId"
                                            value={brand.id}
                                        />

                                        <BrandFields
                                            brand={brand}
                                            idPrefix={`brand-${brand.id}`}
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
