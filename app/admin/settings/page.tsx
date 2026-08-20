import { redirect } from "next/navigation";

import { AdminSubmitButton } from "@/app/admin/_components/AdminSubmitButton";
import { requireOwner } from "@/lib/admin/access";
import { createAdminClient } from "@/lib/supabase/admin";

import { updateWebsiteSettings } from "./actions";
import { SiteLogoUploadField } from "./SiteLogoUploadField";

type AdminSettingsPageProps = {
    searchParams: Promise<{
        error?: string | string[];
        success?: string | string[];
    }>;
};

type WebsiteSettingsRow = {
    site_name: string;
    short_name: string;
    brand_label: string;
    tagline: string;
    logo_path: string | null;
    primary_cta_label: string;
    primary_cta_url: string;
    support_heading: string;
    support_description: string;
    whatsapp_url: string;
    complaint_phone: string;
    heylink_url: string;
    support_email: string;
    seo_title: string;
    seo_description: string;
    site_url: string;
    copyright_text: string;
};

const errorMessages: Record<string, string> = {
    invalid: "Check the settings fields and try again.",
    invalid_logo: "Choose a valid PNG, JPG or WebP image up to 2MB.",
    logo_too_large: "This website logo is larger than 2MB. Choose a smaller image.",
    upload_failed: "The website logo could not be uploaded. Please try again.",
    server: "Website settings could not be saved. Please try again.",
};

const inputClassName =
    "mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10";
const textareaClassName =
    "mt-2 min-h-28 w-full resize-y rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10";

function getParameter(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

function TextField({
    id,
    name,
    label,
    value,
    maxLength,
    placeholder,
    type = "text",
}: {
    id: string;
    name: string;
    label: string;
    value: string;
    maxLength: number;
    placeholder?: string;
    type?: "text" | "email" | "url" | "tel";
}) {
    return (
        <div>
            <label htmlFor={id} className="text-sm font-semibold text-zinc-200">
                {label}
            </label>
            <input
                id={id}
                name={name}
                type={type}
                required
                maxLength={maxLength}
                defaultValue={value}
                placeholder={placeholder}
                className={inputClassName}
            />
        </div>
    );
}

function TextAreaField({
    id,
    name,
    label,
    value,
    maxLength,
}: {
    id: string;
    name: string;
    label: string;
    value: string;
    maxLength: number;
}) {
    return (
        <div className="sm:col-span-2">
            <label htmlFor={id} className="text-sm font-semibold text-zinc-200">
                {label}
            </label>
            <textarea
                id={id}
                name={name}
                required
                maxLength={maxLength}
                defaultValue={value}
                className={textareaClassName}
            />
        </div>
    );
}

export default async function AdminSettingsPage({
    searchParams,
}: AdminSettingsPageProps) {
    const params = await searchParams;
    const errorCode = getParameter(params.error);
    const successCode = getParameter(params.success);
    await requireOwner();

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
        .from("website_settings")
        .select(
            "site_name, short_name, brand_label, tagline, logo_path, primary_cta_label, primary_cta_url, support_heading, support_description, whatsapp_url, complaint_phone, heylink_url, support_email, seo_title, seo_description, site_url, copyright_text",
        )
        .eq("id", 1)
        .single();

    if (error || !data) {
        console.error(
            "Unable to load website settings:",
            error?.message ?? "Settings row not found",
        );
        redirect("/admin?error=settings_unavailable");
    }

    const settings = data as WebsiteSettingsRow;

    return (
        <section className="mx-auto max-w-5xl">
            <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                    Owner Settings
                </p>
                <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                    Website Settings
                </h1>
                <p className="mt-4 max-w-3xl leading-7 text-zinc-400">
                    Manage the website identity, support channels, main call to action and search metadata from one place.
                </p>
            </div>

            {successCode === "updated" && (
                <div
                    className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-200"
                    role="status"
                >
                    Website settings updated successfully.
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

            <form action={updateWebsiteSettings} className="mt-10 space-y-8">
                <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
                    <h2 className="text-xl font-black text-white">Website identity</h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                        These values appear in the header, footer and browser metadata.
                    </p>
                    <div className="mt-7 grid gap-5 sm:grid-cols-2">
                        <TextField
                            id="site-name"
                            name="siteName"
                            label="Full website name"
                            value={settings.site_name}
                            maxLength={100}
                        />
                        <TextField
                            id="short-name"
                            name="shortName"
                            label="Short brand name"
                            value={settings.short_name}
                            maxLength={30}
                        />
                        <TextField
                            id="brand-label"
                            name="brandLabel"
                            label="Header label"
                            value={settings.brand_label}
                            maxLength={40}
                        />
                        <TextField
                            id="copyright-text"
                            name="copyrightText"
                            label="Copyright text"
                            value={settings.copyright_text}
                            maxLength={160}
                        />
                        <TextAreaField
                            id="tagline"
                            name="tagline"
                            label="Footer tagline"
                            value={settings.tagline}
                            maxLength={240}
                        />
                        <SiteLogoUploadField currentLogoUrl={settings.logo_path} />
                    </div>
                </section>

                <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
                    <h2 className="text-xl font-black text-white">Header action</h2>
                    <div className="mt-7 grid gap-5 sm:grid-cols-2">
                        <TextField
                            id="primary-cta-label"
                            name="primaryCtaLabel"
                            label="Button label"
                            value={settings.primary_cta_label}
                            maxLength={40}
                        />
                        <TextField
                            id="primary-cta-url"
                            name="primaryCtaUrl"
                            label="Button destination"
                            value={settings.primary_cta_url}
                            maxLength={500}
                            placeholder="/#contact or https://..."
                        />
                    </div>
                </section>

                <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
                    <h2 className="text-xl font-black text-white">Customer support</h2>
                    <div className="mt-7 grid gap-5 sm:grid-cols-2">
                        <TextField
                            id="support-heading"
                            name="supportHeading"
                            label="Contact section heading"
                            value={settings.support_heading}
                            maxLength={120}
                        />
                        <TextField
                            id="support-email"
                            name="supportEmail"
                            label="Support email"
                            value={settings.support_email}
                            maxLength={254}
                            type="email"
                        />
                        <TextAreaField
                            id="support-description"
                            name="supportDescription"
                            label="Contact section description"
                            value={settings.support_description}
                            maxLength={500}
                        />
                        <TextField
                            id="whatsapp-url"
                            name="whatsappUrl"
                            label="WhatsApp URL"
                            value={settings.whatsapp_url}
                            maxLength={500}
                            placeholder="https://wa.me/... or #"
                        />
                        <TextField
                            id="complaint-phone"
                            name="complaintPhone"
                            label="Complaint hotline number"
                            value={settings.complaint_phone}
                            maxLength={20}
                            type="tel"
                            placeholder="0122127277"
                        />
                        <TextField
                            id="heylink-url"
                            name="heylinkUrl"
                            label="HeyLink URL"
                            value={settings.heylink_url}
                            maxLength={500}
                            placeholder="https://heylink.me/... or #"
                        />
                    </div>
                </section>

                <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
                    <h2 className="text-xl font-black text-white">SEO and website URL</h2>
                    <div className="mt-7 grid gap-5 sm:grid-cols-2">
                        <TextField
                            id="seo-title"
                            name="seoTitle"
                            label="Default SEO title"
                            value={settings.seo_title}
                            maxLength={70}
                        />
                        <TextField
                            id="site-url"
                            name="siteUrl"
                            label="Canonical website URL"
                            value={settings.site_url}
                            maxLength={500}
                            type="url"
                        />
                        <TextAreaField
                            id="seo-description"
                            name="seoDescription"
                            label="Default SEO description"
                            value={settings.seo_description}
                            maxLength={180}
                        />
                    </div>
                </section>

                <div className="flex justify-end">
                    <AdminSubmitButton
                        pendingLabel="Saving…"
                        className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 px-8 text-sm font-black text-black transition hover:scale-[1.01]"
                    >
                        Save website settings
                    </AdminSubmitButton>
                </div>
            </form>
        </section>
    );
}
