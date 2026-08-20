"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireContentEditor } from "@/lib/admin/access";
import {
    getManagedCmsLogoPath,
    removeCmsLogo,
    uploadCmsLogo,
} from "@/lib/admin/cms-logo-storage";
import { createAdminClient } from "@/lib/supabase/admin";

type GameInput = {
    slug: string;
    name: string;
    description: string;
    download_url: string;
    rating: number;
    sort_order: number;
};

const logoBucket = "game-logos";
const storageHostname =
    "imkfmynzsnjckdzctwpp.supabase.co";

function isValidLink(value: string) {
    if (value === "#") {
        return true;
    }

    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
    } catch {
        return false;
    }
}

function parseGameInput(formData: FormData): GameInput | null {
    const slug = String(formData.get("slug") ?? "")
        .trim()
        .toLowerCase();
    const name = String(formData.get("name") ?? "").trim();
    const description = String(
        formData.get("description") ?? "",
    ).trim();
    const downloadUrl = String(
        formData.get("downloadUrl") ?? "",
    ).trim();
    const rating = Number(formData.get("rating"));
    const sortOrder = Number(formData.get("sortOrder"));

    if (
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
        slug.length > 80 ||
        name.length < 2 ||
        name.length > 80 ||
        description.length > 300 ||
        !isValidLink(downloadUrl) ||
        !Number.isFinite(rating) ||
        rating < 1 ||
        rating > 5 ||
        !Number.isInteger(sortOrder) ||
        sortOrder < 0 ||
        sortOrder > 9999
    ) {
        return null;
    }

    return {
        slug,
        name,
        description,
        download_url: downloadUrl,
        rating,
        sort_order: sortOrder,
    };
}

async function uploadLogo(
    adminClient: ReturnType<typeof createAdminClient>,
    formData: FormData,
    required: boolean,
) {
    return uploadCmsLogo({
        adminClient,
        bucket: logoBucket,
        folder: "games",
        formData,
        logLabel: "game",
        required,
    });
}

function getManagedLogoPath(logoUrl: string) {
    return getManagedCmsLogoPath({
        bucket: logoBucket,
        logoUrl,
        storageHostname,
    });
}

async function removeLogo(
    adminClient: ReturnType<typeof createAdminClient>,
    objectPath: string,
) {
    await removeCmsLogo({
        adminClient,
        bucket: logoBucket,
        logLabel: "game",
        objectPath,
    });
}

async function requireGameEditor() {
    await requireContentEditor("/admin/games?error=forbidden");
}

function refreshGamePages() {
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/games");
}

function getDatabaseErrorCode(
    error: { code?: string } | null,
) {
    return error?.code === "23505" ? "duplicate" : "server";
}

export async function createGame(formData: FormData) {
    const input = parseGameInput(formData);

    if (!input) {
        redirect("/admin/games?error=invalid");
    }

    await requireGameEditor();
    const adminClient = createAdminClient();
    const logoResult = await uploadLogo(adminClient, formData, true);

    if ("error" in logoResult) {
        redirect(`/admin/games?error=${logoResult.error}`);
    }

    const logo = logoResult.upload;

    if (!logo) {
        redirect("/admin/games?error=invalid_logo");
    }

    const { error } = await adminClient.from("games").insert({
        ...input,
        logo_path: logo.publicUrl,
        is_active: true,
    });

    if (error) {
        console.error("Unable to create game:", error.message);
        await removeLogo(adminClient, logo.objectPath);
        redirect(
            `/admin/games?error=${getDatabaseErrorCode(error)}`,
        );
    }

    refreshGamePages();
    redirect("/admin/games?success=created");
}

export async function updateGame(formData: FormData) {
    const gameId = Number(formData.get("gameId"));
    const input = parseGameInput(formData);

    if (!Number.isSafeInteger(gameId) || gameId <= 0 || !input) {
        redirect("/admin/games?error=invalid");
    }

    await requireGameEditor();
    const adminClient = createAdminClient();
    const { data: existingGame, error: existingGameError } =
        await adminClient
            .from("games")
            .select("id, logo_path")
            .eq("id", gameId)
            .maybeSingle();

    if (existingGameError || !existingGame) {
        redirect("/admin/games?error=server");
    }

    const logoResult = await uploadLogo(adminClient, formData, false);

    if ("error" in logoResult) {
        redirect(`/admin/games?error=${logoResult.error}`);
    }

    const nextLogo = logoResult.upload;
    const { data, error } = await adminClient
        .from("games")
        .update({
            ...input,
            ...(nextLogo ? { logo_path: nextLogo.publicUrl } : {}),
            updated_at: new Date().toISOString(),
        })
        .eq("id", gameId)
        .select("id")
        .maybeSingle();

    if (error || !data) {
        console.error(
            "Unable to update game:",
            error?.message ?? "Game not found",
        );

        if (nextLogo) {
            await removeLogo(adminClient, nextLogo.objectPath);
        }

        redirect(
            `/admin/games?error=${getDatabaseErrorCode(error)}`,
        );
    }

    if (nextLogo) {
        const previousLogoPath = getManagedLogoPath(
            existingGame.logo_path,
        );

        if (previousLogoPath) {
            await removeLogo(adminClient, previousLogoPath);
        }
    }

    refreshGamePages();
    redirect("/admin/games?success=updated");
}

export async function setGameStatus(formData: FormData) {
    const gameId = Number(formData.get("gameId"));
    const requestedStatus = String(
        formData.get("requestedStatus") ?? "",
    );

    if (
        !Number.isSafeInteger(gameId) ||
        gameId <= 0 ||
        !["active", "inactive"].includes(requestedStatus)
    ) {
        redirect("/admin/games?error=invalid");
    }

    await requireGameEditor();
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
        .from("games")
        .update({
            is_active: requestedStatus === "active",
            updated_at: new Date().toISOString(),
        })
        .eq("id", gameId)
        .select("id")
        .maybeSingle();

    if (error || !data) {
        console.error(
            "Unable to update game status:",
            error?.message ?? "Game not found",
        );
        redirect("/admin/games?error=server");
    }

    refreshGamePages();
    redirect("/admin/games?success=status_updated");
}
