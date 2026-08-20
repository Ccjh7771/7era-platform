"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireContentEditor } from "@/lib/admin/access";
import {
    getManagedCmsImagePath,
    removeCmsImage,
    uploadCmsImage,
} from "@/lib/admin/cms-logo-storage";
import { createAdminClient } from "@/lib/supabase/admin";

type PromotionInput = {
    slug: string;
    title: string;
    subtitle: string;
    description: string;
    category: string;
    status: "active" | "upcoming" | "ended";
    is_featured: boolean;
    sort_order: number;
};

const imageBucket = "promotion-images";
const storageHostname =
    "imkfmynzsnjckdzctwpp.supabase.co";
const allowedStatuses = new Set(["active", "upcoming", "ended"]);

function parsePromotionInput(
    formData: FormData,
): PromotionInput | null {
    const slug = String(formData.get("slug") ?? "")
        .trim()
        .toLowerCase();
    const title = String(formData.get("title") ?? "").trim();
    const subtitle = String(formData.get("subtitle") ?? "").trim();
    const description = String(
        formData.get("description") ?? "",
    ).trim();
    const category = String(formData.get("category") ?? "").trim();
    const status = String(formData.get("status") ?? "");
    const sortOrder = Number(formData.get("sortOrder"));

    if (
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
        slug.length > 100 ||
        title.length < 2 ||
        title.length > 100 ||
        subtitle.length > 140 ||
        description.length > 500 ||
        category.length < 1 ||
        category.length > 60 ||
        !allowedStatuses.has(status) ||
        !Number.isInteger(sortOrder) ||
        sortOrder < 0 ||
        sortOrder > 9999
    ) {
        return null;
    }

    return {
        slug,
        title,
        subtitle,
        description,
        category,
        status: status as PromotionInput["status"],
        is_featured: formData.get("isFeatured") === "on",
        sort_order: sortOrder,
    };
}

async function requirePromotionEditor() {
    await requireContentEditor("/admin/promotions?error=forbidden");
}

function refreshPromotionPages() {
    revalidatePath("/promotions");
    revalidatePath("/admin");
    revalidatePath("/admin/promotions");
}

function getDatabaseErrorCode(
    error: { code?: string } | null,
) {
    return error?.code === "23505" ? "duplicate" : "server";
}

export async function createPromotion(formData: FormData) {
    const input = parsePromotionInput(formData);

    if (!input) {
        redirect("/admin/promotions?error=invalid");
    }

    await requirePromotionEditor();
    const adminClient = createAdminClient();
    const imageResult = await uploadCmsImage({
        adminClient,
        bucket: imageBucket,
        folder: "promotions",
        formData,
        logLabel: "promotion",
        required: false,
    });

    if ("error" in imageResult) {
        redirect(`/admin/promotions?error=${imageResult.error}`);
    }

    const image = imageResult.upload;
    const { error } = await adminClient.from("promotions").insert({
        ...input,
        validity_label: "Available",
        href: "/#brands",
        is_disabled: false,
        image_path: image?.publicUrl ?? null,
        is_active: true,
    });

    if (error) {
        console.error("Unable to create promotion:", error.message);

        if (image) {
            await removeCmsImage({
                adminClient,
                bucket: imageBucket,
                logLabel: "promotion",
                objectPath: image.objectPath,
            });
        }

        redirect(
            `/admin/promotions?error=${getDatabaseErrorCode(error)}`,
        );
    }

    refreshPromotionPages();
    redirect("/admin/promotions?success=created");
}

export async function updatePromotion(formData: FormData) {
    const promotionId = Number(formData.get("promotionId"));
    const input = parsePromotionInput(formData);

    if (
        !Number.isSafeInteger(promotionId) ||
        promotionId <= 0 ||
        !input
    ) {
        redirect("/admin/promotions?error=invalid");
    }

    await requirePromotionEditor();
    const adminClient = createAdminClient();
    const { data: existingPromotion, error: existingPromotionError } =
        await adminClient
            .from("promotions")
            .select("id, image_path")
            .eq("id", promotionId)
            .maybeSingle();

    if (existingPromotionError || !existingPromotion) {
        redirect("/admin/promotions?error=server");
    }

    const imageResult = await uploadCmsImage({
        adminClient,
        bucket: imageBucket,
        folder: "promotions",
        formData,
        logLabel: "promotion",
        required: false,
    });

    if ("error" in imageResult) {
        redirect(`/admin/promotions?error=${imageResult.error}`);
    }

    const nextImage = imageResult.upload;
    const { data, error } = await adminClient
        .from("promotions")
        .update({
            ...input,
            validity_label: "Available",
            href: "/#brands",
            is_disabled: false,
            ...(nextImage ? { image_path: nextImage.publicUrl } : {}),
            updated_at: new Date().toISOString(),
        })
        .eq("id", promotionId)
        .select("id")
        .maybeSingle();

    if (error || !data) {
        console.error(
            "Unable to update promotion:",
            error?.message ?? "Promotion not found",
        );

        if (nextImage) {
            await removeCmsImage({
                adminClient,
                bucket: imageBucket,
                logLabel: "promotion",
                objectPath: nextImage.objectPath,
            });
        }

        redirect(
            `/admin/promotions?error=${getDatabaseErrorCode(error)}`,
        );
    }

    if (nextImage && existingPromotion.image_path) {
        const previousImagePath = getManagedCmsImagePath({
            bucket: imageBucket,
            imageUrl: existingPromotion.image_path,
            storageHostname,
        });

        if (previousImagePath) {
            await removeCmsImage({
                adminClient,
                bucket: imageBucket,
                logLabel: "promotion",
                objectPath: previousImagePath,
            });
        }
    }

    refreshPromotionPages();
    redirect("/admin/promotions?success=updated");
}

export async function setPromotionVisibility(formData: FormData) {
    const promotionId = Number(formData.get("promotionId"));
    const requestedVisibility = String(
        formData.get("requestedVisibility") ?? "",
    );

    if (
        !Number.isSafeInteger(promotionId) ||
        promotionId <= 0 ||
        !["visible", "hidden"].includes(requestedVisibility)
    ) {
        redirect("/admin/promotions?error=invalid");
    }

    await requirePromotionEditor();
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
        .from("promotions")
        .update({
            is_active: requestedVisibility === "visible",
            updated_at: new Date().toISOString(),
        })
        .eq("id", promotionId)
        .select("id")
        .maybeSingle();

    if (error || !data) {
        console.error(
            "Unable to update promotion visibility:",
            error?.message ?? "Promotion not found",
        );
        redirect("/admin/promotions?error=server");
    }

    refreshPromotionPages();
    redirect("/admin/promotions?success=visibility_updated");
}
