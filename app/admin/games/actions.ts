"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireContentEditor } from "@/lib/admin/access";
import { createAdminClient } from "@/lib/supabase/admin";

type GameInput = {
    slug: string;
    name: string;
    description: string;
    download_url: string;
    rating: number;
    sort_order: number;
};

type UploadedLogo = {
    objectPath: string;
    publicUrl: string;
};

const logoBucket = "game-logos";
const storageHostname =
    "imkfmynzsnjckdzctwpp.supabase.co";
const maximumLogoSize = 2 * 1024 * 1024;
const logoExtensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};

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

function hasValidFileSignature(
    bytes: Uint8Array,
    mimeType: string,
) {
    if (mimeType === "image/png") {
        const signature = [
            0x89,
            0x50,
            0x4e,
            0x47,
            0x0d,
            0x0a,
            0x1a,
            0x0a,
        ];

        return signature.every(
            (value, index) => bytes[index] === value,
        );
    }

    if (mimeType === "image/jpeg") {
        return (
            bytes[0] === 0xff &&
            bytes[1] === 0xd8 &&
            bytes[2] === 0xff
        );
    }

    if (mimeType === "image/webp") {
        return (
            String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
            String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
        );
    }

    return false;
}

async function uploadLogo(
    adminClient: ReturnType<typeof createAdminClient>,
    formData: FormData,
    required: boolean,
): Promise<
    | { error: "invalid_logo" | "upload_failed" }
    | { upload: UploadedLogo | null }
> {
    const logoFile = formData.get("logoFile");

    if (!(logoFile instanceof File) || logoFile.size === 0) {
        return required
            ? { error: "invalid_logo" }
            : { upload: null };
    }

    if (logoFile.size > maximumLogoSize) {
        return { error: "invalid_logo" };
    }

    const bytes = new Uint8Array(await logoFile.arrayBuffer());
    const detectedLogoType = Object.entries(logoExtensions).find(
        ([mimeType]) => hasValidFileSignature(bytes, mimeType),
    );

    if (!detectedLogoType) {
        return { error: "invalid_logo" };
    }

    const [mimeType, extension] = detectedLogoType;

    const objectPath = `games/${randomUUID()}.${extension}`;
    const { error } = await adminClient.storage
        .from(logoBucket)
        .upload(objectPath, bytes, {
            cacheControl: "31536000",
            contentType: mimeType,
            upsert: false,
        });

    if (error) {
        console.error("Unable to upload game logo:", error.message);
        return { error: "upload_failed" };
    }

    const { data } = adminClient.storage
        .from(logoBucket)
        .getPublicUrl(objectPath);

    return {
        upload: {
            objectPath,
            publicUrl: data.publicUrl,
        },
    };
}

function getManagedLogoPath(logoUrl: string) {
    try {
        const url = new URL(logoUrl);
        const marker =
            `/storage/v1/object/public/${logoBucket}/`;

        if (
            url.protocol !== "https:" ||
            url.hostname !== storageHostname ||
            !url.pathname.startsWith(marker)
        ) {
            return null;
        }

        return decodeURIComponent(url.pathname.slice(marker.length));
    } catch {
        return null;
    }
}

async function removeLogo(
    adminClient: ReturnType<typeof createAdminClient>,
    objectPath: string,
) {
    const { error } = await adminClient.storage
        .from(logoBucket)
        .remove([objectPath]);

    if (error) {
        console.error("Unable to remove game logo:", error.message);
    }
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
