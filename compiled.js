(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', '../bower_components/lodash/lodash.min', '../bower_components/jquery/dist/jquery.min'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('../bower_components/lodash/lodash.min'), require('../bower_components/jquery/dist/jquery.min'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global._, global.$);
		global.board = mod.exports;
	}
})(this, function (exports, module, _bower_componentsLodashLodashMin, _bower_componentsJqueryDistJqueryMin) {
	"use strict";

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _2 = _interopRequireDefault(_bower_componentsLodashLodashMin);

	var _$ = _interopRequireDefault(_bower_componentsJqueryDistJqueryMin);

	var QuintroBoard = (function () {
		function QuintroBoard($el) {
			_classCallCheck(this, QuintroBoard);

			var board = this;

			board.$el = $el;

			board._id = Date.now() + '-quintro-board';

			board._dimensions = {
				width: board.$el.find('.board-row').first().children('.board-cell').length,
				height: board.$el.find('.board-row').length
			};

			board._attachEventListeners();
		}

		_createClass(QuintroBoard, [{
			key: '_attachEventListeners',
			value: function _attachEventListeners() {
				var board = this;

				board._detachEventListeners();

				board.$el.on('click.' + board._id, '.board-cell', function () {
					var $cell = (0, _$['default'])(this);

					if ($cell.hasClass('filled')) {
						return;
					}

					$cell.addClass('filled ' + board.color);

					$cell.append((0, _$['default'])('<div></div>').addClass('marble ' + board.color));

					var cellResults = board._checkCell($cell);

					board.$el.trigger('marble-placed', {
						$cell: $cell,
						color: board.color,
						position: board.getPositionForCell($cell)
					});

					if (!_2['default'].isNull(cellResults.quintros)) {
						board.$el.trigger('quintro', {
							color: cellResults.color,
							quintros: cellResults.quintros
						});
					}
				});

				board.$el.on('quintro.' + board._id, _2['default'].bind(board._onQuintro, board));
			}
		}, {
			key: '_detachEventListeners',
			value: function _detachEventListeners() {
				var board = this;

				board.$el.off('.' + board._id);
			}
		}, {
			key: '_resizeBoard',
			value: function _resizeBoard(dimensions) {
				var board = this;
				var $row;
				var i;

				if (dimensions.height < board.dimensions.height) {
					while (board.$el.find('.board-row').length > dimensions.height) {
						board.$el.find('.board-row').last().remove();
					}
				} else if (dimensions.height > board.dimensions.height) {
					while (dimensions.height > board.$el.find('.board-row').length) {
						$row = (0, _$['default'])('<div></div>').addClass('board-row');

						for (i = 0; i < dimensions.row; i++) {
							$row.append((0, _$['default'])('<div></div>').addClass('board-cell'));
						}

						board.$el.find('.board-row').last().insertAfter($row);
					}
				}

				if (dimensions.width < board.dimensions.width) {
					board.$el.find('.board-row').each(function () {
						(0, _$['default'])(this).find('.board-cell').each(function (index) {
							if (index >= dimensions.width) {
								(0, _$['default'])(this).remove();
							}
						});
					});
				} else if (dimensions.width > board.dimensions.width) {
					board.$el.find('.board-row').each(function () {
						var $row = (0, _$['default'])(this);

						while (dimensions.width > $row.children('.board-cell').length) {
							$row.append((0, _$['default'])('<div></div>').addClass('board-cell'));
						}
					});
				}
			}
		}, {
			key: '_checkCellHorizontal',
			value: function _checkCellHorizontal($cell) {
				var board = this;

				var $prevCell = $cell;
				var $nextCell = $cell;
				var goLeft = true;
				var goRight = true;

				var $filled = (0, _$['default'])();

				while (goLeft) {
					$prevCell = $prevCell.prev('.board-cell.filled.' + board.color);

					if ($prevCell.length === 0) {
						goLeft = false;
					} else {
						$filled = $filled.add($prevCell);
					}
				}

				while (goRight) {
					$nextCell = $nextCell.next('.board-cell.filled.' + board.color);

					if ($nextCell.length === 0) {
						goRight = false;
					} else {
						$filled = $filled.add($nextCell);
					}
				}

				return $filled;
			}
		}, {
			key: '_checkCellVertical',
			value: function _checkCellVertical($cell) {
				var board = this;

				var goUp = true;
				var goDown = true;
				var $prevRow;
				var $nextRow;
				var $prevRowCell;
				var $nextRowCell;
				var column = $cell.index();
				var $filled = (0, _$['default'])();

				$prevRow = $nextRow = $cell.parent();

				while (goUp) {
					$prevRow = $prevRow.prev('.board-row');

					if ($prevRow.length === 0) {
						goUp = false;
					} else {
						$prevRowCell = (0, _$['default'])($prevRow.children('.board-cell').get(column));

						if (!$prevRowCell.hasClass('filled ' + board.color)) {
							goUp = false;
						} else {
							$filled = $filled.add($prevRowCell);
						}
					}
				}

				while (goDown) {
					$nextRow = $nextRow.next('.board-row');

					if ($nextRow.length === 0) {
						goDown = false;
					} else {
						$nextRowCell = (0, _$['default'])($nextRow.children('.board-cell').get(column));

						if (!$nextRowCell.hasClass('filled ' + board.color)) {
							goDown = false;
						} else {
							$filled = $filled.add($nextRowCell);
						}
					}
				}

				return $filled;
			}
		}, {
			key: '_checkCellDiagonalTopLeft',
			value: function _checkCellDiagonalTopLeft($cell) {
				var board = this;

				var goUp = true;
				var goDown = true;
				var $prevRow;
				var $nextRow;
				var $prevRowCell;
				var $nextRowCell;
				var prevRowColumn = $cell.index();
				var nextRowColumn = $cell.index();

				var $filled = (0, _$['default'])();

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
					} else {
						prevRowColumn -= 1;
						$prevRowCell = (0, _$['default'])($prevRow.children('.board-cell').get(prevRowColumn));

						if (!$prevRowCell.hasClass('filled ' + board.color)) {
							goUp = false;
						} else {
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
					} else {
						nextRowColumn += 1;
						$nextRowCell = (0, _$['default'])($nextRow.children('.board-cell').get(nextRowColumn));

						if (!$nextRowCell.hasClass('filled ' + board.color)) {
							goDown = false;
						} else {
							$filled = $filled.add($nextRowCell);
						}

						if (nextRowColumn === board.dimensions.width - 1) {
							goDown = false;
						}
					}
				}

				return $filled;
			}
		}, {
			key: '_checkCellDiagonalTopRight',
			value: function _checkCellDiagonalTopRight($cell) {
				var board = this;

				var goUp = true;
				var goDown = true;
				var $prevRow;
				var $nextRow;
				var $prevRowCell;
				var $nextRowCell;
				var prevRowColumn = $cell.index();
				var nextRowColumn = $cell.index();

				var $filled = (0, _$['default'])();

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
					} else {
						prevRowColumn += 1;
						$prevRowCell = (0, _$['default'])($prevRow.children('.board-cell').get(prevRowColumn));

						if (!$prevRowCell.hasClass('filled ' + board.color)) {
							goUp = false;
						} else {
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
					} else {
						nextRowColumn -= 1;
						$nextRowCell = (0, _$['default'])($nextRow.children('.board-cell').get(nextRowColumn));

						if (!$nextRowCell.hasClass('filled ' + board.color)) {
							goDown = false;
						} else {
							$filled = $filled.add($nextRowCell);
						}

						if (nextRowColumn === 0) {
							goDown = false;
						}
					}
				}

				return $filled;
			}
		}, {
			key: '_checkCell',
			value: function _checkCell($cell) {
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
					quintros: _2['default'].isEmpty(quintros) ? null : quintros
				};
			}
		}, {
			key: '_onQuintro',
			value: function _onQuintro(event, data) {
				var board = this;

				console.log(data);

				board.endGame({
					winner: data.color
				});
			}
		}, {
			key: 'getCellsForPositions',
			value: function getCellsForPositions(positions) {
				var board = this;
				var $cells = (0, _$['default'])();

				if (!positions || positions.length === 0) {
					return $cells;
				}

				board.$el.find('.board-row').each(function (index) {
					var positionsOnThisRow = _2['default'].where(positions, { row: index });

					if (positionsOnThisRow.length > 0) {
						(0, _$['default'])(this).children('.board-cell').each(function (index) {
							if (_2['default'].any(positionsOnThisRow, { column: index })) {
								$cells = $cells.add(this);
							}
						});
					}
				});

				return $cells;
			}
		}, {
			key: 'getCellForPosition',
			value: function getCellForPosition(position) {
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

				return (0, _$['default'])((0, _$['default'])(board.$el.find('.board-row').get(position.row)).children('.board-cell').get(position.column));
			}
		}, {
			key: 'getPositionForCell',
			value: function getPositionForCell($cell) {
				var board = this;

				var column = $cell.index();

				var row = $cell.parent().index();

				return {
					row: row,
					column: column
				};
			}
		}, {
			key: 'endGame',
			value: function endGame() {
				var board = this;

				board.$el.addClass('game-over');

				board._detachEventListeners();
			}
		}, {
			key: 'color',
			get: function get() {
				return this._color;
			},
			set: function set(value) {
				this._color = value;
			}
		}, {
			key: 'dimensions',
			get: function get() {
				return this._dimensions;
			},
			set: function set(dimensions) {
				var board = this;

				if (!dimensions || !dimensions.width && !dimensions.height) {
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
		}]);

		return QuintroBoard;
	})();

	module.exports = QuintroBoard;
});

