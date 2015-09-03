import $ from 'jquery';
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

		view.model = new BoardModel({
			width: view.$el.find('.board-row').first().children('.board-cell').length,
			height: view.$el.find('.board-row').length
		});

		view._bindCellsToModel();

		view._attachEventListeners();
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

		view.listenTo(view.model, 'quintro', function(data) {
			view.endGame({
				winner: data.color
			});
		});

		view.listenTo(view.model, 'change:width change:height', function() {
			view._resizeBoard();
		});
	}

	_resizeBoard() {
		var view = this;
		var $row;
		var i;

		var dimensions = {
			width: view.model.get('width'),
			height: view.model.get('height'),
		};

		if (dimensions.height < view.dimensions.height) {
			while (view.$el.find('.board-row').length > dimensions.height) {
				view.$el.find('.board-row').last().remove();
			}
		}
		else if (dimensions.height > view.dimensions.height) {
			while (dimensions.height > view.$el.find('.board-row').length) {
				$row = $('<div></div>').addClass('board-row');

				for (i = 0; i < dimensions.row; i++) {
					$row.append($('<div></div>').addClass('board-cell'));
				}

				view.$el.find('.board-row').last().insertAfter($row);
			}
		}

		if (dimensions.width < view.dimensions.width) {
			view.$el.find('.board-row').each(
				function() {
					$(this).find('.board-cell').each(
						function(index) {
							if (index >= dimensions.width) {
								$(this).remove();
							}
						}
					);
				}
			);
		}
		else if (dimensions.width > view.dimensions.width) {
			view.$el.find('.board-row').each(
				function() {
					var $row = $(this);

					while (dimensions.width > $row.children('.board-cell').length) {
						$row.append($('<div></div>').addClass('board-cell'));
					}
				}
			);
		}
	}

	endGame() {
		var view = this;

		view.$el.addClass('game-over');
	}

	get color() {
		return this._color;
	}

	set color(value) {
		this._color = value;
	}
}

export default QuintroBoard;
