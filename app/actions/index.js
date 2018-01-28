import { Set } from "immutable";

export const FIND_OPEN_GAMES = "@@QUINTRO/FIND_OPEN_GAMES";

export function findOpenGames() {
	return {
		type: FIND_OPEN_GAMES,
		payload: Set(),
	};
}
