(function($, _) {
	"use strict";

	function QuintroBoard($el) {
		var board = this;

		board.$el = $($el);

		board._id = Date.now() + '-quintro-board';

		board._dimensions = {
			width: board.$el.find('.board-row').first().children('.board-cell').length,
			height: board.$el.find('.board-row').length,
		};

		board._attachEventListeners();
	}

	QuintroBoard.prototype = Object.create(Object.prototype, {
		_attachEventListeners: {
			value: function() {
				var board = this;

				board._detachEventListeners();

				board.$el.on('click.' + board._id, '.board-cell', function() {
					var $cell = $(this);

					if ($cell.hasClass('filled')) {
						return;
					}

					$cell.addClass('filled ' + board.color);

					$cell.append($('<div></div>').addClass('marble ' + board.color));

					var cellResults = board._checkCell($cell);

					board.$el.trigger('marble-placed', {
						$cell: $cell,
						color: board.color,
						position: board.getPositionForCell($cell)
					});

					if (!_.isNull(cellResults.quintros)) {
						board.$el.trigger('quintro', {
							color: cellResults.color,
							quintros: cellResults.quintros
						});
					}
				});

				board.$el.on('quintro.' + board._id, _.bind(board._onQuintro, board));
			}
		},

		_detachEventListeners: {
			value: function() {
				var board = this;

				board.$el.off('.' + board._id);
			}
		},

		_resizeBoard: {
			value: function(dimensions) {
				var board = this;
				var $row;
				var i;

				if (dimensions.height < board.dimensions.height) {
					while (board.$el.find('.board-row').length > dimensions.height) {
						board.$el.find('.board-row').last().remove();
					}
				}
				else if (dimensions.height > board.dimensions.height) {
					while (dimensions.height > board.$el.find('.board-row').length) {
						$row = $('<div></div>').addClass('board-row');

						for (i = 0; i < dimensions.row; i++) {
							$row.append($('<div></div>').addClass('board-cell'));
						}

						board.$el.find('.board-row').last().insertAfter($row);
					}
				}

				if (dimensions.width < board.dimensions.width) {
					board.$el.find('.board-row').each(
						function() {
							$(this).find('.board-cell').each(
								function(index) {
									if (index >= dimensions.width) {
										$(this).remove();
									}
								}
							)		
						}
					);
				}
				else if (dimensions.width > board.dimensions.width) {
					board.$el.find('.board-row').each(
						function() {
							var $row = $(this);

							while (dimensions.width > $row.children('.board-cell').length) {
								$row.append($('<div></div>').addClass('board-cell'));
							}
						}
					);
				}
			}
		},

		_checkCellHorizontal: {
			value: function($cell) {
				var board = this;

				var $prevCell = $cell;
				var $nextCell = $cell;
				var goLeft = true;
				var goRight = true;

				var $filled = $();

				while (goLeft) {
					$prevCell = $prevCell.prev('.board-cell.filled.' + board.color);

					if ($prevCell.length === 0) {
						goLeft = false;
					}
					else {
						$filled = $filled.add($prevCell);
					}
				}

				while (goRight) {
					$nextCell = $nextCell.next('.board-cell.filled.' + board.color);

					if ($nextCell.length === 0) {
						goRight = false;
					}
					else {
						$filled = $filled.add($nextCell);
					}
				}

				return $filled;
			}
		},

		_checkCellVertical: {
			value: function($cell) {
				var board = this;

				var goUp = true;
				var goDown = true;
				var $prevRow;
				var $nextRow;
				var $prevRowCell;
				var $nextRowCell;
				var column = $cell.index();
				var $filled = $();

				$prevRow = $nextRow = $cell.parent();

				while (goUp) {
					$prevRow = $prevRow.prev('.board-row');

					if ($prevRow.length === 0) {
						goUp = false;
					}
					else {
						$prevRowCell = $($prevRow.children('.board-cell').get(column));

						if (!$prevRowCell.hasClass('filled ' + board.color)) {
							goUp = false;
						}
						else {
							$filled = $filled.add($prevRowCell);
						}
					}
				}

				while (goDown) {
					$nextRow = $nextRow.next('.board-row');

					if ($nextRow.length === 0) {
						goDown = false;
					}
					else {
						$nextRowCell = $($nextRow.children('.board-cell').get(column));

						if (!$nextRowCell.hasClass('filled ' + board.color)) {
							goDown = false;
						}
						else {
							$filled = $filled.add($nextRowCell);
						}
					}
				}

				return $filled;
			}
		},

		_checkCellDiagonalTopLeft: {
			value: function($cell) {
				var board = this;

				var goUp = true;
				var goDown = true;
				var $prevRow;
				var $nextRow;
				var $prevRowCell;
				var $nextRowCell;
				var prevRowColumn = $cell.index();
				var nextRowColumn = $cell.index();

				var $filled = $();

				$prevRow = $nextRow = $cell.parent();

				if (prevRowColumn === 0) {
					goUp = false;
				}

				if (nextRowColumn === board.dimensions.width - 1) {
					goDown = false;
				}

				while (goUp) {
					$prevRow = $prevRow.prev('.board-row');

					if ($prevRow.length === 0) {
						goUp = false;
					}
					else {
						prevRowColumn -= 1;
						$prevRowCell = $($prevRow.children('.board-cell').get(prevRowColumn));

						if (!$prevRowCell.hasClass('filled ' + board.color)) {
							goUp = false;
						}
						else {
							$filled = $filled.add($prevRowCell);
						}

						if (prevRowColumn === 0) {
							goUp = false;
						}
					}
				}

				while (goDown) {
					$nextRow = $nextRow.next('.board-row');

					if ($nextRow.length === 0) {
						goDown = false;
					}
					else {
						nextRowColumn += 1;
						$nextRowCell = $($nextRow.children('.board-cell').get(nextRowColumn));

						if (!$nextRowCell.hasClass('filled ' + board.color)) {
							goDown = false;
						}
						else {
							$filled = $filled.add($nextRowCell);
						}

						if (nextRowColumn === board.dimensions.width - 1) {
							goDown = false;
						}
					}
				}

				return $filled;
			}
		},

		_checkCellDiagonalTopRight: {
			value: function($cell) {
				var board = this;

				var goUp = true;
				var goDown = true;
				var $prevRow;
				var $nextRow;
				var $prevRowCell;
				var $nextRowCell;
				var prevRowColumn = $cell.index();
				var nextRowColumn = $cell.index();

				var $filled = $();

				$prevRow = $nextRow = $cell.parent();

				if (prevRowColumn === board.dimensions.width - 1) {
					goUp = false;
				}

				if (nextRowColumn === 0) {
					goDown = false;
				}

				while (goUp) {
					$prevRow = $prevRow.prev('.board-row');

					if ($prevRow.length === 0) {
						goUp = false;
					}
					else {
						prevRowColumn += 1;
						$prevRowCell = $($prevRow.children('.board-cell').get(prevRowColumn));

						if (!$prevRowCell.hasClass('filled ' + board.color)) {
							goUp = false;
						}
						else {
							$filled = $filled.add($prevRowCell);
						}

						if (prevRowColumn === board.dimensions.width - 1) {
							goUp = false;
						}
					}
				}

				while (goDown) {
					$nextRow = $nextRow.next('.board-row');

					if ($nextRow.length === 0) {
						goDown = false;
					}
					else {
						nextRowColumn -= 1;
						$nextRowCell = $($nextRow.children('.board-cell').get(nextRowColumn));

						if (!$nextRowCell.hasClass('filled ' + board.color)) {
							goDown = false;
						}
						else {
							$filled = $filled.add($nextRowCell);
						}

						if (nextRowColumn === 0) {
							goDown = false;
						}
					}
				}

				return $filled;
			}
		},

		_checkCell: {
			value: function($cell) {
				var board = this;

				var $filledHorizontal = board._checkCellHorizontal($cell);
				var $filledVertical = board._checkCellVertical($cell);
				var $filledDiagonalTopLeftToBottomRight = board._checkCellDiagonalTopLeft($cell);
				var $filledDiagonalTopRightToBottomLeft = board._checkCellDiagonalTopRight($cell);

				var quintros = {};

				if ($filledHorizontal.length >= 5) {
					quintros.horizontal = {
						$cells: $filledHorizontal.add($cell)
					};
				}

				if ($filledVertical.length >= 5) {
					quintros.vertical = {
						$cells: $filledVertical.add($cell)
					};
				}

				if ($filledDiagonalTopLeftToBottomRight.length >= 5) {
					quintros.diagonalTopLeft = {
						$cells: $filledDiagonalTopLeftToBottomRight.add($cell)
					};
				}

				if ($filledDiagonalTopRightToBottomLeft.length >= 5) {
					quintros.diagonalTopRight = {
						$cells: $filledDiagonalTopRightToBottomLeft.add($cell)
					};
				}

				return {
					color: board.color,
					quintros: _.isEmpty(quintros) ?
						null :
						quintros
				};
			}
		},

		_onQuintro: {
			value: function(event, data) {
				var board = this;

				console.log(data);

				board.endGame({
					winner: data.color
				});
			}
		},

		color: {
			enumerable: true,
			get: function() {
				var board = this;

				return board._color;
			},
			set: function(value) {
				var board = this;

				board._color = value;
			}
		},

		getCellsForPositions: {
			enumerable: true,
			value: function(positions) {
				var board = this;
				var $cells = $();

				if (!positions || positions.length === 0) {
					return $cells;
				}

				board.$el.find('.board-row').each(
					function(index) {
						var positionsOnThisRow = _.where(positions, {row: index});

						if (positionsOnThisRow.length > 0) {
							$(this).children('.board-cell').each(
								function(index) {
									if (_.any(positionsOnThisRow, {column: index})) {
										$cells = $cells.add(this);
									}
								}
							);
						}
					}
				)

				return $cells;
			}
		},

		getCellForPosition: {
			enumerable: true,
			value: function(position) {
				var board = this;

				if (!position || position.row === void 0 || position.column === void 0) {
					throw new Error('Must pass a position object with `row` and `column` properties');
				}

				if (position.row >= board.dimensions.height) {
					throw new RangeError('Row ' + position.row + ' is beyond the maximum row value ' + (board.dimensions.height - 1));
				}

				if (position.row < 0) {
					throw new RangeError('Row ' + position.row + ' is below the minimum row value 0');
				}

				if (position.column >= board.dimensions.width) {
					throw new RangeError('Column ' + position.column + ' is beyond the maximum column value ' + (board.dimensions.width - 1));
				}

				if (position.column < 0) {
					throw new RangeError('Column ' + position.column + ' is below the minimum column value 0');
				}

				return $(
					$(
						board.$el.find('.board-row').get(position.row)
					).children('.board-cell').get(position.column)
				);
			}
		},

		getPositionForCell: {
			enumerable: true,
			value: function($cell) {
				var board = this;

				var column = $cell.index();

				var row = $cell.parent().index();

				return {
					row: row,
					column: column,
				};
			}
		},

		endGame: {
			value: function() {
				var board = this;

				board.$el.addClass('game-over');

				board._detachEventListeners();
			}
		},

		dimensions: {
			enumerable: true,
			get: function() {
				var board = this;

				return board._dimensions;
			},
			set: function(dimensions) {
				var board = this;

				if (!dimensions || (!dimensions.width && !dimensions.height)) {
					throw new Error('Must specify a dimensions object with at least one of width or height properties');
				}

				if (!dimensions.width) {
					dimensions.width = board._dimensions.width;
				}

				if (!dimensions.height) {
					dimensions.height = board._dimensions.height;
				}

				board._resizeBoard(dimensions);

				board._dimensions = {
					width: dimensions.width,
					height: dimensions.height
				};
			}
		}
	});

	var board = new QuintroBoard($('.board'));

	window.board = board;
}(jQuery, _));