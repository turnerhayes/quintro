import $          from "jquery";
import Promise    from "bluebird";


function prepareGame(game) {
	game.currentPlayerColor = game.current_player_color;
	delete game.current_player_color;

	return game;
}

// TODO: factor out of individual utils
function getErrorMessageFromXHR(jqXHR) {
	return jqXHR.responseJSON &&
	jqXHR.responseJSON.error &&
	jqXHR.responseJSON.error.message ?
		jqXHR.responseJSON.error.message :
		jqXHR.responseText;
}

class GameUtils {
	static getGame({ gameName }) {
		return Promise.resolve(
			$.ajax({
				url: `/api/games/${gameName}`,
				type: "GET",
				dataType: "json"
			}).catch(
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
				}
			).then(prepareGame)
		);
	}

	static createGame({ name, width, height, playerLimit }) {
		return Promise.resolve(
			$.ajax({
				url: `/api/games/${name}`,
				type: "POST",
				dataType: "json",
				data: {
					width,
					height,
					playerLimit
				}
			}).catch(
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
				}
			).then(prepareGame)
		);
	}
}

export default GameUtils;
