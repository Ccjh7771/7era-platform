export interface Game {
  id: number;
  name: string;
  downloadUrl: string;
  logo: string;
}

export interface GameSectionProps {
  games?: Game[];
}