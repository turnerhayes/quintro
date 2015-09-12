import Backbone from "backbone";
import _ from "lodash";

function _setupBoardArray(width, height) {
	return _.reduce(
		_.range(0, height),
		function(boardArray) {
			var row = [];

			for (let i = 0; i < width; i++) {
				row[i] = null;
			}

			boardArray.push(row);

			return boardArray;
		},
		[]
	);
}

class BoardModel extends Backbone.Model {
	initialize() {
		var model = this;

		model._boardArray = _setupBoardArray(model.get('width'), model.get('height'));
	}

	get defaults() {
		return {
			width: 20,
			height: 20
		};
	}

	_getCellAtPosition(position) {
		var model = this;

		var [column, row] = position;

		return model._boardArray[row][column];
	}

	setMarble(position, color) {
		var model = this;

		var cell = model._getCellAtPosition(position);

		if (!_.isNull(cell)) {
			let err = new Error('Cell ' + JSON.stringify(position) + ' is already occupied by ' + cell);

			err.position = position;
			err.color = cell;

			throw err;
		}

		var [column, row] = position;

		model._boardArray[row][column] = color;

		var quintroResults = model._checkCellsForQuintro(position);

		if (!_.isEmpty(quintroResults)) {
			model.trigger('quintro', quintroResults);
		}

		model.trigger('marble-placed', {
			position: position,
			color: color
		});
	}

	_checkCellsForQuintro(position) {
		var model = this;

		var quintros = {};

		var horizontal = model._checkCellsHorizontal(position);
		var vertical = model._checkCellsVertical(position);
		var diagonalTopLeft = model._checkCellsDiagonalTopLeft(position);
		var diagonalTopRight = model._checkCellsDiagonalTopRight(position);

		if (horizontal.length >= 5) {
			quintros.horizontal = horizontal;
		}

		if (vertical.length >= 5) {
			quintros.vertical = vertical;
		}

		if (diagonalTopLeft.length >= 5) {
			quintros.diagonalTopLeft = diagonalTopLeft;
		}

		if (diagonalTopRight.length >= 5) {
			quintros.diagonalTopRight = diagonalTopRight;
		}

		return quintros;
	}

	update(boardData) {
		var model = this;

		_.each(
			boardData.structure,
			function(row, rowNumber) {
				_.each(
					row,
					function(cell, columnNumber) {
						model._boardArray[rowNumber][columnNumber] = cell;
					}
				)
			}
		);

		model.trigger('board-updated');
	}

	_checkCellsHorizontal(position) {
		var model = this;

		var cell;

		var [column, row] = position;

		var initialColumn = column;

		var goLeft = column > 0;
		var goRight = column < model.get('width') - 1;

		var filledCells = [position];

		var initialCell = model._getCellAtPosition(position);

		while (goLeft) {
			column -= 1;
			cell = model._getCellAtPosition([column, row]);

			if (_.isNull(cell) || initialCell !== cell) {
				goLeft = false;
			}
			else {
				filledCells.push([column, row]);
			}

			if (column === 0) {
				goLeft = false;
			}
		}

		column = initialColumn;

		while (goRight) {
			column += 1;
			cell = model._getCellAtPosition([column, row]);

			if (_.isNull(cell) || initialCell !== cell) {
				goRight = false;
			}
			else {
				filledCells.push([column, row]);
			}

			if (column === model.get('width') - 1) {
				goRight = false;
			}
		}

		return filledCells;
	}

	_checkCellsVertical(position) {
		var model = this;

		var cell;

		var [column, row] = position;

		var initialRow = row;

		var goUp = row > 0;
		var goDown = row < model.get('height') - 1;

		var filledCells = [position];

		var initialCell = model._getCellAtPosition(position);

		while (goUp) {
			row -= 1;
			cell = model._getCellAtPosition([column, row]);

			if (_.isNull(cell) || initialCell !== cell) {
				goUp = false;
			}
			else {
				filledCells.push([column, row]);
			}

			if (row === 0) {
				goUp = false;
			}
		}

		row = initialRow;

		while (goDown) {
			row += 1;
			cell = model._getCellAtPosition([column, row]);

			if (_.isNull(cell) || initialCell !== cell) {
				goDown = false;
			}
			else {
				filledCells.push([column, row]);
			}

			if (row === model.get('height') - 1) {
				goDown = false;
			}
		}

		return filledCells;
	}

	_checkCellsDiagonalTopLeft(position) {
		var model = this;

		var cell;

		var [column, row] = position;

		var initialRow = row;
		var initialColumn = column;

		var goUp = column > 0 && row > 0;
		var goDown = column < model.get('width') - 1 && row < model.get('height') - 1;

		var filledCells = [position];

		var initialCell = model._getCellAtPosition(position);

		while (goUp) {
			column -= 1;
			row -= 1;

			cell = model._getCellAtPosition([column, row]);

			if (_.isNull(cell) || initialCell !== cell) {
				goUp = false;
			}
			else {
				filledCells.push([column, row]);
			}

			if (row === 0 || column === 0) {
				goUp = false;
			}
		}

		row = initialRow;
		column = initialColumn;

		while (goDown) {
			column += 1;
			row += 1;

			cell = model._getCellAtPosition([column, row]);

			if (_.isNull(cell) || initialCell !== cell) {
				goDown = false;
			}
			else {
				filledCells.push([column, row]);
			}

			if (row === model.get('height') - 1 || column === model.get('width') - 1) {
				goDown = false;
			}
		}

		return filledCells;
	}

	_checkCellsDiagonalTopRight(position) {
		var model = this;

		var cell;

		var [column, row] = position;

		var initialRow = row;
		var initialColumn = column;

		var goUp = column < model.get('width') - 1 && row > 0;
		var goDown = column > 0 && row < model.get('height') - 1;

		var filledCells = [position];

		var initialCell = model._getCellAtPosition(position);

		while (goUp) {
			column += 1;
			row -= 1;

			cell = model._getCellAtPosition([column, row]);

			if (_.isNull(cell) || initialCell !== cell) {
				goUp = false;
			}
			else {
				filledCells.push([column, row]);
			}

			if (row === 0 || column === model.get('width') - 1) {
				goUp = false;
			}
		}

		row = initialRow;
		column = initialColumn;

		while (goDown) {
			column -= 1;
			row += 1;

			cell = model._getCellAtPosition([column, row]);

			if (_.isNull(cell) || initialCell !== cell) {
				goDown = false;
			}
			else {
				filledCells.push([column, row]);
			}

			if (row === model.get('height') - 1 || column === 0) {
				goDown = false;
			}
		}

		return filledCells;
	}
}

export default BoardModel;
