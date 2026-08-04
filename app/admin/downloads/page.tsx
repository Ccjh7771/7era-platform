import Image from "next/image";
import { requireAdmin } from "@/lib/admin/access";
import { createAdminClient } from "@/lib/supabase/admin";

import {
    createDownload,
    setDownloadStatus,
    updateDownload,
} from "./actions";
import { DownloadLogoUploadField } from "./DownloadLogoUploadField";

type AdminDownloadsPageProps = {
    searchParams: Promise<{
        error?: string | string[];
        success?: string | string[];
    }>;
};

type DownloadRow = {
    id: number;
    slug: string;
    title: string;
    description: string;
    logo_path: string;
    platform: "android" | "ios" | "windows";
    version: string;
    release_date: string;
    file_size: string;
    download_url: string;
    guide_url: string | null;
    is_latest: boolean;
    is_disabled: boolean;
    sort_order: number;
    is_active: boolean;
};

const errorMessages: Record<string, string> = {
    forbidden:
        "Your account has read-only access to download content.",
    invalid: "Check the download fields and try again.",
    duplicate: "A download with this slug already exists.",
    invalid_logo:
        "Choose a valid PNG, JPG or WebP image up to 2MB.",
    upload_failed:
        "The application logo could not be uploaded. Please try again.",
    server: "The download could not be saved. Please try again.",
};

const successMessages: Record<string, string> = {
    created: "Download created successfully.",
    updated: "Download details updated successfully.",
    status_updated: "Download visibility updated successfully.",
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

function DownloadFields({
    download,
    idPrefix,
}: {
    download?: DownloadRow;
    idPrefix: string;
}) {
    return (
        <div className="grid gap-5 sm:grid-cols-2">
            <div>
                <label
                    htmlFor={`${idPrefix}-title`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Application name
                </label>
                <input
                    id={`${idPrefix}-title`}
                    name="title"
                    type="text"
                    required
                    minLength={2}
                    maxLength={80}
                    defaultValue={download?.title}
                    placeholder="Mega888"
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
                    defaultValue={download?.slug}
                    placeholder="mega888-android"
                    className={inputClassName}
                />
            </div>

            <DownloadLogoUploadField
                currentLogoUrl={download?.logo_path}
                idPrefix={idPrefix}
                required={!download}
            />

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
                    defaultValue={download?.description}
                    placeholder="Short download description"
                    className={textareaClassName}
                />
            </div>

            <div>
                <label
                    htmlFor={`${idPrefix}-platform`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Platform
                </label>
                <select
                    id={`${idPrefix}-platform`}
                    name="platform"
                    required
                    defaultValue={download?.platform ?? "android"}
                    className={inputClassName}
                >
                    <option value="android">Android</option>
                    <option value="ios">iOS</option>
                    <option value="windows">Windows</option>
                </select>
            </div>

            <div>
                <label
                    htmlFor={`${idPrefix}-version`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Version
                </label>
                <input
                    id={`${idPrefix}-version`}
                    name="version"
                    type="text"
                    required
                    maxLength={40}
                    defaultValue={download?.version ?? "Latest"}
                    placeholder="1.0.0"
                    className={inputClassName}
                />
            </div>

            <div>
                <label
                    htmlFor={`${idPrefix}-release-date`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Updated date
                </label>
                <input
                    id={`${idPrefix}-release-date`}
                    name="releaseDate"
                    type="date"
                    required
                    defaultValue={
                        download?.release_date ??
                        new Date().toISOString().slice(0, 10)
                    }
                    className={inputClassName}
                />
            </div>

            <div>
                <label
                    htmlFor={`${idPrefix}-file-size`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    File size
                </label>
                <input
                    id={`${idPrefix}-file-size`}
                    name="fileSize"
                    type="text"
                    required
                    maxLength={40}
                    defaultValue={download?.file_size ?? "Check download"}
                    placeholder="85 MB"
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
                    defaultValue={download?.sort_order ?? 50}
                    className={inputClassName}
                />
            </div>

            <div className="sm:col-span-2">
                <label
                    htmlFor={`${idPrefix}-download-url`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Download URL
                </label>
                <input
                    id={`${idPrefix}-download-url`}
                    name="downloadUrl"
                    type="text"
                    required
                    defaultValue={download?.download_url ?? "#"}
                    placeholder="https://... or #"
                    className={inputClassName}
                />
            </div>

            <div className="sm:col-span-2">
                <label
                    htmlFor={`${idPrefix}-guide-url`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Installation guide URL
                </label>
                <input
                    id={`${idPrefix}-guide-url`}
                    name="guideUrl"
                    type="text"
                    defaultValue={
                        download?.guide_url ?? "#installation-guide"
                    }
                    placeholder="#installation-guide or https://..."
                    className={inputClassName}
                />
            </div>

            <div className="sm:col-span-2 flex flex-wrap gap-6 rounded-2xl border border-white/10 bg-black/30 p-4">
                <label className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
                    <input
                        name="isLatest"
                        type="checkbox"
                        defaultChecked={download?.is_latest ?? true}
                        className={checkboxClassName}
                    />
                    Show Latest badge
                </label>
                <label className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
                    <input
                        name="isDisabled"
                        type="checkbox"
                        defaultChecked={download?.is_disabled ?? false}
                        className={checkboxClassName}
                    />
                    Disable download button
                </label>
            </div>
        </div>
    );
}

export default async function AdminDownloadsPage({
    searchParams,
}: AdminDownloadsPageProps) {
    const params = await searchParams;
    const errorCode = getParameter(params.error);
    const successCode = getParameter(params.success);
    const currentAdmin = await requireAdmin();
    const canEdit = currentAdmin.role !== "viewer";
    const adminClient = createAdminClient();
    const { data: downloadData, error: downloadsError } =
        await adminClient
            .from("downloads")
            .select(
                "id, slug, title, description, logo_path, platform, version, release_date, file_size, download_url, guide_url, is_latest, is_disabled, sort_order, is_active",
            )
            .order("sort_order", { ascending: true })
            .order("id", { ascending: true });

    if (downloadsError) {
        console.error(
            "Unable to load downloads:",
            downloadsError.message,
        );
    }

    const downloads = (downloadData ?? []) as DownloadRow[];

    return (
        <section className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                        Content Management
                    </p>
                    <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                        Downloads
                    </h1>
                    <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
                        Manage applications shown in the public Download Center.
                    </p>
                </div>
                <div className="flex gap-3 text-sm">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-zinc-300">
                        {downloads.length} total
                    </span>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-emerald-300">
                        {downloads.filter((item) => item.is_active).length} active
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
                        Add a new download
                    </summary>
                    <form action={createDownload} className="mt-7">
                        <DownloadFields idPrefix="new-download" />
                        <button
                            type="submit"
                            className="mt-6 flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 px-6 text-sm font-black text-black transition hover:scale-[1.01]"
                        >
                            Create download
                        </button>
                    </form>
                </details>
            )}

            {downloadsError && (
                <p className="mt-10 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">
                    Unable to load downloads from the database.
                </p>
            )}

            <div className="mt-10 grid gap-6 xl:grid-cols-2">
                {downloads.map((download) => (
                    <article
                        key={download.id}
                        className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-8"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-5">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-2">
                                    <Image
                                        src={download.logo_path}
                                        alt={`${download.title} logo`}
                                        width={56}
                                        height={56}
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white">
                                        {download.title}
                                    </h2>
                                    <p className="mt-1 text-xs capitalize text-zinc-500">
                                        {download.platform} · {download.version} · Order {download.sort_order}
                                    </p>
                                </div>
                            </div>
                            <span
                                className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                                    download.is_active
                                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                        : "border-zinc-400/20 bg-zinc-400/10 text-zinc-400"
                                }`}
                            >
                                {download.is_active ? "Active" : "Hidden"}
                            </span>
                        </div>

                        <p className="mt-5 text-sm leading-7 text-zinc-400">
                            {download.description || "No description provided."}
                        </p>

                        {canEdit && (
                            <div className="mt-6 border-t border-white/10 pt-6">
                                <form action={setDownloadStatus}>
                                    <input
                                        type="hidden"
                                        name="downloadId"
                                        value={download.id}
                                    />
                                    <input
                                        type="hidden"
                                        name="requestedStatus"
                                        value={download.is_active ? "inactive" : "active"}
                                    />
                                    <button
                                        type="submit"
                                        className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-zinc-300 transition hover:border-yellow-400/30 hover:text-yellow-300"
                                    >
                                        {download.is_active
                                            ? "Hide from website"
                                            : "Show on website"}
                                    </button>
                                </form>

                                <details className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
                                    <summary className="cursor-pointer text-sm font-bold text-zinc-200">
                                        Edit download details
                                    </summary>
                                    <form action={updateDownload} className="mt-6">
                                        <input
                                            type="hidden"
                                            name="downloadId"
                                            value={download.id}
                                        />
                                        <DownloadFields
                                            download={download}
                                            idPrefix={`download-${download.id}`}
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
