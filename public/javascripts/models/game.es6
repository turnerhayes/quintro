import Backbone from "backbone";
import _ from "lodash";

function _getPlayerColors(numberOfPlayers) {
	return _.take(
		[
			'black',
			'blue',
			'red',
			'white',
			'yellow',
			'green'
		],
		numberOfPlayers
	);
}

class GameModel extends Backbone.Model {
	get defaults() {
		return {
			currentPlayer: null,
		};
	}

	initialize(options) {
		var model = this;

		if (!model.get('players') || model.get('players').length === 0) {
			model.set('players', _getPlayerColors(options.numberOfPlayers));
			model.set('current_player', _.first(model.get('players')));
		}


		model._attachEventListeners();
	}

	_attachEventListeners() {
		var model = this;

		model.on('marble-placed', function(data) {
			var previousPlayer = model.get('current_player');

			model.set(
				'current_player',
				model.get('players')[
					(
						_.indexOf(
							model.get('players'),
							model.get('current_player')
						) + 1
					) % _.size(model.get('players'))
				]
			);

			model.trigger('player-changed', {
				previousPlayer: previousPlayer,
				currentPlayer: model.get('current_player'),
			});
		});
	}
}

export default GameModel;
