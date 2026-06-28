import type { Route } from './+types/play-game';
import { PlayGame } from '@/client/components/PlayGame';


export default function Component({ params: { gameName } }: Route.ComponentProps) {
  if (!gameName) {
    throw new Error(`Cannot render a game without a game name`);
  }
  return (
    <PlayGame
      gameName={gameName}
    />
  );
}
