import $            from 'jquery';
import _            from 'lodash';
import Backbone     from 'backbone';
import BoardModel   from '../models/board';
import GameApp      from '../apps/game';

var _events = {
	'click .board-cell': '_handleCellClick',
};

class QuintroBoard extends Backbone.View {
	get events() {
		return _events;
	}

	initialize() {
		var view = this;

		view._getModelPromise = GameApp.getCurrentGame().then(
			function(game) {
				view.model = game.get('board');
				view._game = game;

				return view.model;
			}
		);
	}

	render() {
		var view = this;

		view._getModelPromise.done(
			function() {
				view._bindCellsToModel();

				view._attachEventListeners();
			}
		);

		return view;
	}

	update(boardData) {
		var view = this;

		view.model.update(boardData);
	}

	_bindCellsToModel() {
		var view = this;

		view._positionCellMap = {};

		view.$el.find('.board-row').each(
			function(rowIndex) {
				$(this).children('.board-cell').each(
					function(columnIndex) {
						view._positionCellMap[JSON.stringify([columnIndex, rowIndex])] = $(this);
					}
				);
			}
		);
	}

	_handleCellClick(event) {
		var view = this;

		if (view._game.get('is_over')) {
			return;
		}

		var $cell = $(event.currentTarget);

		var column = $cell.index();

		var row = $cell.parent().index();

		try {
			view.model.requestMarblePlacement([column, row], view.color);
		}
		catch(ex) {
			console.error('failed to place marble: ', ex.message);
		}
	}

	_attachEventListeners() {
		var view = this;

		view.listenTo(view.model, 'marbles-added', function(data) {
			_.each(
				data.cells,
				function(cell) {
					var $cell = view._positionCellMap[JSON.stringify(cell.position)];

					$cell.addClass('filled ' + cell.color);

					$cell.append($('<div></div>').addClass('marble ' + cell.color));
				}
			);
		});

		view.listenTo(view.model, 'board-updated', _.bind(view._onBoardUpdated, view));

		view.listenTo(view._game, 'player-added', function(data) {
			if (data.addedModel.get('is_self')) {
				view.color = data.addedModel.get('color');
			}
		});
	}

	_onBoardUpdated() {
		var view = this;

		var classRegex = new RegExp('\\b(?:filled|black|blue|red|white|yellow|green)\\b');

		view.$('.board-row').each(
			function(rowIndex) {
				$(this).find('.board-cell').each(
					function(columnIndex) {
						var $cell = $(this);
						var player = view.model._boardArray[rowIndex][columnIndex];

						if (_.isNull(player)) {
							$cell.attr('class', $cell.attr('class').replace(classRegex, ''))
								.empty();
						}
						else {
							$cell.addClass('filled ' + player)
								.append($('<div></div>').addClass('marble ' + player));
						}
					}
				);
			}
		);
	}

	get color() {
		return this._color;
	}

	set color(value) {
		this._color = value;
	}
}

export default QuintroBoard;
