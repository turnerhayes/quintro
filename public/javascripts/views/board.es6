import $ from 'jquery';
import _ from 'lodash';
import Backbone from 'backbone';
import BoardModel from '../models/board';

class QuintroBoard extends Backbone.View {
	get events() {
		return {
			'click .board-cell': '_handleCellClick',
		};
	}

	initialize() {
		var view = this;

		if (!view.model) {
			view.model = new BoardModel({
				width: view.$el.find('.board-row').first().children('.board-cell').length,
				height: view.$el.find('.board-row').length
			});
		}

		view._bindCellsToModel();

		view._attachEventListeners();
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

		// TODO: Don't reach outside our $el
		if (view.$el.parents('.game-over').length > 0) {
			return;
		}

		var $cell = $(event.currentTarget);

		var column = $cell.index();

		var row = $cell.parent().index();

		try {
			view.model.setMarble([column, row], view.color);
		}
		catch(ex) {

		}
	}

	_attachEventListeners() {
		var view = this;

		view.listenTo(view.model, 'marble-placed', function(data) {
			var $cell = view._positionCellMap[JSON.stringify(data.position)];

			$cell.addClass('filled ' + data.color);

			$cell.append($('<div></div>').addClass('marble ' + data.color));
		});

		view.listenTo(view.model, 'board-updated', _.bind(view._onBoardUpdated, view));
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
