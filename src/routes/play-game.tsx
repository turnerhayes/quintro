import type { Route } from './+types/play-game';
import { PlayGame } from '@/components/PlayGame';
import { gamesApi } from '@/api/games';
import { store } from '@/redux/store';


export const clientLoader = async ({ params: { gameName } }: Route.ClientLoaderArgs) => {
    if (!gameName) {
        throw Error("No game name provided to play game route");
    }

    const { data } = await store.dispatch(
        gamesApi.endpoints.getGame.initiate({
            gameName
        }),
    );

    if (!data) {
        throw new Error(`Cannot find game named "${gameName}"`)
    }

    return {
        game: data,
    };
};


export default function Component({loaderData: { game }}: Route.ComponentProps) {
  return (
    <PlayGame
        game={game}
    />
  );
}
