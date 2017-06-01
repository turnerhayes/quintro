import $          from "jquery";
import Promise    from "bluebird";
import GameRecord from "project/scripts/records/game";


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
			).then(
				game => new GameRecord(prepareGame(game))
			)
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
			).then(
				createdGame => new GameRecord(prepareGame(createdGame))
			)
		);
	}
}

export default GameUtils;
