import { GameCard } from "@/components/ui/GameCard";
import { Reveal } from "@/components/ui/Reveal";
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
      <Reveal>
        <SectionHeader
          badge="PREMIUM GAMES"
          title="Explore Our Games"
          description="Discover popular mobile gaming platforms with smooth performance, exciting rewards and easy access."
        />
      </Reveal>

      <div className={gridStyles}>
        {games.map((game, index) => (
          <Reveal
            key={game.id}
            delay={index * 80}
            className="h-full"
          >
            <GameCard game={game} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}