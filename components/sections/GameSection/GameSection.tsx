import { GameCard } from "@/components/ui/GameCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { games } from "@/lib/data/games";

import {
  gridStyles,
  sectionStyles,
} from "./GameSection.styles";

export function GameSection() {
  return (
    <section
      id="games"
      className={sectionStyles}
    >
      <SectionHeader
        badge="PREMIUM GAMES"
        title="Explore Our Games"
        description="Discover popular mobile gaming platforms with smooth performance, exciting rewards and easy access."
      />

      <div className={gridStyles}>
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
          />
        ))}
      </div>
    </section>
  );
}