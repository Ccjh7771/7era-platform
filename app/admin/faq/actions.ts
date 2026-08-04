"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type FAQCategory =
    | "download"
    | "promotion"
    | "account"
    | "technical"
    | "security";

type FAQInput = {
    slug: string;
    category: FAQCategory;
    question: string;
    answer: string;
    sort_order: number;
};

const editableRoles = new Set(["owner", "editor"]);
const allowedCategories = new Set([
    "download",
    "promotion",
    "account",
    "technical",
    "security",
]);

function parseFAQInput(formData: FormData): FAQInput | null {
    const slug = String(formData.get("slug") ?? "")
        .trim()
        .toLowerCase();
    const category = String(formData.get("category") ?? "");
    const question = String(formData.get("question") ?? "").trim();
    const answer = String(formData.get("answer") ?? "").trim();
    const sortOrder = Number(formData.get("sortOrder"));

    if (
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
        slug.length > 100 ||
        !allowedCategories.has(category) ||
        question.length < 5 ||
        question.length > 200 ||
        answer.length < 5 ||
        answer.length > 2000 ||
        !Number.isInteger(sortOrder) ||
        sortOrder < 0 ||
        sortOrder > 9999
    ) {
        return null;
    }

    return {
        slug,
        category: category as FAQCategory,
        question,
        answer,
        sort_order: sortOrder,
    };
}

async function requireFAQEditor() {
    const supabase = await createClient();
    const { data: claimsData, error: claimsError } =
        await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;

    if (claimsError || !userId) {
        redirect("/auth/login");
    }

    const { data: adminProfile, error: profileError } =
        await supabase
            .from("admin_profiles")
            .select("role, is_active")
            .eq("id", userId)
            .single();

    if (
        profileError ||
        !adminProfile ||
        !adminProfile.is_active ||
        !editableRoles.has(adminProfile.role)
    ) {
        redirect("/admin/faq?error=forbidden");
    }
}

function refreshFAQPages() {
    revalidatePath("/faq");
    revalidatePath("/admin");
    revalidatePath("/admin/faq");
}

function getDatabaseErrorCode(error: { code?: string } | null) {
    return error?.code === "23505" ? "duplicate" : "server";
}

export async function createFAQItem(formData: FormData) {
    const input = parseFAQInput(formData);

    if (!input) {
        redirect("/admin/faq?error=invalid");
    }

    await requireFAQEditor();
    const adminClient = createAdminClient();
    const { error } = await adminClient.from("faq_items").insert({
        ...input,
        is_active: true,
    });

    if (error) {
        console.error("Unable to create FAQ item:", error.message);
        redirect(`/admin/faq?error=${getDatabaseErrorCode(error)}`);
    }

    refreshFAQPages();
    redirect("/admin/faq?success=created");
}

export async function updateFAQItem(formData: FormData) {
    const faqId = Number(formData.get("faqId"));
    const input = parseFAQInput(formData);

    if (!Number.isSafeInteger(faqId) || faqId <= 0 || !input) {
        redirect("/admin/faq?error=invalid");
    }

    await requireFAQEditor();
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
        .from("faq_items")
        .update({
            ...input,
            updated_at: new Date().toISOString(),
        })
        .eq("id", faqId)
        .select("id")
        .maybeSingle();

    if (error || !data) {
        console.error(
            "Unable to update FAQ item:",
            error?.message ?? "FAQ item not found",
        );
        redirect(`/admin/faq?error=${getDatabaseErrorCode(error)}`);
    }

    refreshFAQPages();
    redirect("/admin/faq?success=updated");
}

export async function setFAQVisibility(formData: FormData) {
    const faqId = Number(formData.get("faqId"));
    const requestedVisibility = String(
        formData.get("requestedVisibility") ?? "",
    );

    if (
        !Number.isSafeInteger(faqId) ||
        faqId <= 0 ||
        !["visible", "hidden"].includes(requestedVisibility)
    ) {
        redirect("/admin/faq?error=invalid");
    }

    await requireFAQEditor();
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
        .from("faq_items")
        .update({
            is_active: requestedVisibility === "visible",
            updated_at: new Date().toISOString(),
        })
        .eq("id", faqId)
        .select("id")
        .maybeSingle();

    if (error || !data) {
        console.error(
            "Unable to update FAQ visibility:",
            error?.message ?? "FAQ item not found",
        );
        redirect("/admin/faq?error=server");
    }

    refreshFAQPages();
    redirect("/admin/faq?success=visibility_updated");
}
