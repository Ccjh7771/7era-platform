import Image from "next/image";
import { requireAdmin } from "@/lib/admin/access";
import { createAdminClient } from "@/lib/supabase/admin";

import {
    createGame,
    setGameStatus,
    updateGame,
} from "./actions";
import { GameLogoUploadField } from "./GameLogoUploadField";

type AdminGamesPageProps = {
    searchParams: Promise<{
        error?: string | string[];
        success?: string | string[];
    }>;
};

type GameRow = {
    id: number;
    slug: string;
    name: string;
    description: string;
    rating: number | string;
    download_url: string;
    logo_path: string;
    sort_order: number;
    is_active: boolean;
};

const errorMessages: Record<string, string> = {
    forbidden: "Your account has read-only access to game content.",
    invalid: "Check the game fields and try again.",
    duplicate: "A game with this name or slug already exists.",
    invalid_logo:
        "Choose a valid PNG, JPG or WebP image up to 2MB.",
    upload_failed:
        "The game logo could not be uploaded. Please try again.",
    server: "The game could not be saved. Please try again.",
};

const successMessages: Record<string, string> = {
    created: "Game created successfully.",
    updated: "Game details updated successfully.",
    status_updated: "Game visibility updated successfully.",
};

const inputClassName =
    "mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10";
const textareaClassName =
    "mt-2 min-h-24 w-full resize-y rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10";

function getParameter(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

function GameFields({
    game,
    idPrefix,
}: {
    game?: GameRow;
    idPrefix: string;
}) {
    return (
        <div className="grid gap-5 sm:grid-cols-2">
            <div>
                <label
                    htmlFor={`${idPrefix}-name`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Game name
                </label>
                <input
                    id={`${idPrefix}-name`}
                    name="name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={80}
                    defaultValue={game?.name}
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
                    maxLength={80}
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    defaultValue={game?.slug}
                    placeholder="mega888"
                    className={inputClassName}
                />
                <p className="mt-2 text-xs text-zinc-600">
                    Lowercase letters, numbers and hyphens only.
                </p>
            </div>

            <GameLogoUploadField
                currentLogoUrl={game?.logo_path}
                idPrefix={idPrefix}
                required={!game}
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
                    defaultValue={game?.description}
                    placeholder="Short game description"
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
                    defaultValue={game ? Number(game.rating) : 5}
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
                    defaultValue={game?.sort_order ?? 50}
                    className={inputClassName}
                />
            </div>

            <div className="sm:col-span-2">
                <label
                    htmlFor={`${idPrefix}-download`}
                    className="text-sm font-semibold text-zinc-200"
                >
                    Download URL
                </label>
                <input
                    id={`${idPrefix}-download`}
                    name="downloadUrl"
                    type="text"
                    required
                    defaultValue={game?.download_url ?? "#"}
                    placeholder="https://... or #"
                    className={inputClassName}
                />
            </div>
        </div>
    );
}

export default async function AdminGamesPage({
    searchParams,
}: AdminGamesPageProps) {
    const params = await searchParams;
    const errorCode = getParameter(params.error);
    const successCode = getParameter(params.success);
    const currentAdmin = await requireAdmin();
    const canEdit = currentAdmin.role !== "viewer";
    const adminClient = createAdminClient();
    const { data: gameData, error: gamesError } = await adminClient
        .from("games")
        .select(
            "id, slug, name, description, rating, download_url, logo_path, sort_order, is_active",
        )
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });

    if (gamesError) {
        console.error("Unable to load games:", gamesError.message);
    }

    const games = (gameData ?? []) as GameRow[];

    return (
        <section className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                        Content Management
                    </p>
                    <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                        Games
                    </h1>
                    <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
                        Manage the game cards shown on the public homepage.
                    </p>
                </div>

                <div className="flex gap-3 text-sm">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-zinc-300">
                        {games.length} total
                    </span>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-emerald-300">
                        {games.filter((game) => game.is_active).length} active
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
                        Add a new game
                    </summary>
                    <form action={createGame} className="mt-7">
                        <GameFields idPrefix="new-game" />
                        <button
                            type="submit"
                            className="mt-6 flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 px-6 text-sm font-black text-black transition hover:scale-[1.01]"
                        >
                            Create game
                        </button>
                    </form>
                </details>
            )}

            {gamesError && (
                <p className="mt-10 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">
                    Unable to load games from the database.
                </p>
            )}

            <div className="mt-10 grid gap-6 xl:grid-cols-2">
                {games.map((game) => (
                    <article
                        key={game.id}
                        className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-8"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-5">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-2">
                                    <Image
                                        src={game.logo_path}
                                        alt={`${game.name} logo`}
                                        width={56}
                                        height={56}
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white">
                                        {game.name}
                                    </h2>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        {game.slug} · Order {game.sort_order} · Rating {Number(game.rating).toFixed(1)}
                                    </p>
                                </div>
                            </div>
                            <span
                                className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                                    game.is_active
                                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                        : "border-zinc-400/20 bg-zinc-400/10 text-zinc-400"
                                }`}
                            >
                                {game.is_active ? "Active" : "Hidden"}
                            </span>
                        </div>

                        <p className="mt-5 text-sm leading-7 text-zinc-400">
                            {game.description || "No description provided."}
                        </p>

                        {canEdit && (
                            <div className="mt-6 border-t border-white/10 pt-6">
                                <form action={setGameStatus}>
                                    <input
                                        type="hidden"
                                        name="gameId"
                                        value={game.id}
                                    />
                                    <input
                                        type="hidden"
                                        name="requestedStatus"
                                        value={game.is_active ? "inactive" : "active"}
                                    />
                                    <button
                                        type="submit"
                                        className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-zinc-300 transition hover:border-yellow-400/30 hover:text-yellow-300"
                                    >
                                        {game.is_active
                                            ? "Hide from website"
                                            : "Show on website"}
                                    </button>
                                </form>

                                <details className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
                                    <summary className="cursor-pointer text-sm font-bold text-zinc-200">
                                        Edit game details
                                    </summary>
                                    <form action={updateGame} className="mt-6">
                                        <input
                                            type="hidden"
                                            name="gameId"
                                            value={game.id}
                                        />
                                        <GameFields
                                            game={game}
                                            idPrefix={`game-${game.id}`}
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
