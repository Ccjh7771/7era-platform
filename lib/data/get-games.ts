import "server-only";

import { createPublicClient } from "@/lib/supabase/public";

import { games as fallbackGames } from "./games";
import type { Game } from "./games";

type GameRow = {
  id: number;
  slug: string;
  name: string;
  description: string;
  logo_path: string;
  download_url: string;
  rating: number | string;
};

export async function getActiveGames(): Promise<Game[]> {
  try {
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("games")
      .select(
        "id, slug, name, description, logo_path, download_url, rating",
      )
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return (data as GameRow[]).map((game) => ({
      id: game.slug,
      name: game.name,
      description: game.description,
      logo: game.logo_path,
      download: game.download_url,
      rating: Number(game.rating),
    }));
  } catch (error) {
    console.error(
      "Unable to load active games:",
      error instanceof Error ? error.message : error,
    );

    return fallbackGames;
  }
}
