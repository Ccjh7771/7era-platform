export interface GameCardProps {
  game: {
    id: string;
    name: string;
    logo: string;
    description: string;
    download: string;
    rating: number;
  };
}