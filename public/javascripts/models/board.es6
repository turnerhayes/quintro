import assert       from "assert";
import Backbone     from "backbone";
import _            from "lodash";
import SocketClient from "../socket-client";

class BoardModel extends Backbone.Model {
	_getCellAtPosition(position) {
		var model = this;

		var [column, row] = position;

		return model.get('structure')[row][column];
	}

	requestMarblePlacement(position, color) {
		var model = this;

		SocketClient.emit(
			'board:place-marble',
			{
				short_id: model.get('game').get('short_id'),
				color: color,
				position: position,
			},
			_.bind(model._handleMarblePlacedResponse, model)
		);
	}

	addMarbles(cells) {
		var model = this;

		assert(_.size(cells) > 0, "addMarbles() called with no cells");

		_.each(
			cells,
			function(cell) {
				model.get('structure')[cell.position[1]][cell.position[0]] = cell.color;
			}
		);

		model.trigger('marbles-added', {
			cells: cells
		});
	}

	_handleMarblePlacedResponse(data) {
		if (data.error) {
			console.error('marble placement error: ', data.message);
		}
	}

	update(boardData) {
		var model = this;

		_.each(
			boardData.structure,
			function(row, rowNumber) {
				_.each(
					row,
					function(cell, columnNumber) {
						model.get('structure')[rowNumber][columnNumber] = cell;
					}
				);
			}
		);

		model.trigger('board-updated');
	}
}

export default BoardModel;
