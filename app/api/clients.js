/* globals Promise */

import GameClient from "./game-client";
import UserClient from "./user-client";

let resolveInitialize;

const initializedPromise = new Promise(
	(resolve) => {
		resolveInitialize = resolve;
	}
);

let initialized = false;

export function initializeClients({ store }) {
	if (initialized) {
		return;
	}

	resolveInitialize({
		games: new GameClient({ store }),
		users: new UserClient({ store }),
	});
}

export default initializedPromise;