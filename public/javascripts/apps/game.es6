import $              from 'jquery';
import _              from 'lodash';
import Q              from 'q';
import GameCollection from '../collections/games';

class GameApp {
	constructor() {
		var app = this;

		app._collection = new GameCollection();

		app._currentGame_id = null;

		app._populateFromDOM();
	}

	getCurrentGame() {
		var app = this;

		if (_.isNull(app._currentGameID)) {
			return Q(undefined);
		}

		return app._collection.fetchGame(app._currentGame_id);
	}

	joinGame(short_id) {
		var app = this;

		return app.fetchGame(short_id).then(
			function(game) {
				return game.join();
			}
		);
	}

	_populateFromDOM() {
		var app = this;

		app._collection.add(
			_.compact(
				$('[name="game-model"]')
					.map(
						function() {
							var gameString = $(this).val();

							if (!gameString) {
								return undefined;
							}

							try {
								return JSON.parse(gameString);
							}
							catch(e) {
								return undefined;
							}
						}
					)
			)
		);

		app._currentGame_id = $('[name="game-id"]').val() || null;
	}
}

export default new GameApp();
