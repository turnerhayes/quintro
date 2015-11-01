"use strict";

var _         = require('lodash');
var expect    = require('expect.js');
var GameModel = require('../lib/persistence/models/game');


function _getResult(args) {
	var color = 'blue';
	var otherColor = 'green';

	var model = new GameModel({
		short_id: 'TEST_GAME_' + Date.now(),
		board: {
			width: 10,
			height: 10,
			filled: _.map(
				args.filledCells,
				function(cellPosition) {
					return {
						position: cellPosition,
						color: color
					};
				}
			).concat(
				_.map(
					args.otherColorCells,
					function(cellPosition) {
						return {
							position: cellPosition,
							color: otherColor
						};
					}
				)
			)
		}
	});

	return model.fillCell({
		position: args.placedMarble,
		color: color
	});
}

function _generateTest(quintroTypes, filledCells, placedMarble, blockingMarbles) {
	if (!_.isArray(quintroTypes)) {
		quintroTypes = [quintroTypes];
	}

	var description = "placing " + JSON.stringify(placedMarble) + " in (" +
		_.map(filledCells, JSON.stringify).join(' ') + ")";

	var isBlocked = _.size(blockingMarbles) > 0;

	if (isBlocked) {
		description += " with " + (_.size(blockingMarbles) > 1 ? "blocks at " : "a block at ") +
			_.map(blockingMarbles, JSON.stringify).join(', ');
	}

	describe(description, function() {
		it("should " + (isBlocked ? "not " : "") + "result in " +
			(_.size(quintroTypes) > 1 ?
				quintroTypes.join(" and ") + " quintros" :
				"a " + quintroTypes[0] + " quintro"
			), function() {
			var result = _getResult({
				filledCells: filledCells,
				placedMarble: placedMarble,
				otherColorCells: blockingMarbles
			});

			if (isBlocked) {
				expect(result.quintros).to.be(false);
			}
			else {
				expect(result.quintros).to.not.be(false);
				expect(result.quintros).to.only.have.keys(quintroTypes);
				_.each(
					quintroTypes,
					function(quintroType) {
						expect(result.quintros[quintroType]).to.be.ok();
					}
				);
			}
		});
	});
}

describe("getQuintros", function() {
	_generateTest(
		'horizontal',
		[[0, 0], [2, 0], [3, 0], [4, 0]],
		[1, 0]
	);

	_generateTest(
		'horizontal',
		[[0, 0], [3, 0], [4, 0]],
		[1, 0],
		[[2, 0]]
	);

	_generateTest(
		'vertical',
		[[0,1], [0,2], [0,3], [0,4]],
		[0, 0]
	);

	_generateTest(
		'vertical',
		[[0, 1], [0, 2], [0, 4]],
		[0, 0],
		[[0, 3]]
	);

	_generateTest(
		'top_left',
		[[0, 0], [1, 1], [3, 3], [4, 4]],
		[2, 2]
	);

	_generateTest(
		'top_left',
		[[0, 0], [3, 3], [4, 4]],
		[2, 2],
		[[1, 1]]
	);

	_generateTest(
		'top_right',
		[[9, 0], [8, 1], [7, 2], [5, 4]],
		[6, 3]
	);

	_generateTest(
		'top_right',
		[[9, 0], [8, 1], [5, 4]],
		[6, 3],
		[[7,2]]
	);

	_generateTest(
		['horizontal', 'vertical'],
		[
			[0, 0], [2, 0], [3, 0], [4, 0], // horizontal
			[1, 1], [1, 2], [1, 3], [1, 4]  // vertical
		],
		[1, 0]
	);

	_generateTest(
		['top_left', 'top_right'],
		[
			[0, 0], [1, 1], [3, 3], [4, 4], // top-left diagonal
			[0, 4], [1, 3], [3, 1], [4, 0]  // top-right diagonal
		],
		[2, 2]
	);

	_generateTest(
		['top_left', 'horizontal'],
		[
			[0, 0], [1, 1], [3, 3], [4, 4], // top-left diagonal
			[0, 2], [1, 2], [3, 2], [4, 2]  // horizontal
		],
		[2, 2]
	);

	_generateTest(
		['top_left', 'vertical'],
		[
			[0, 0], [1, 1], [3, 3], [4, 4], // top-left diagonal
			[2, 0], [2, 1], [2, 3], [2, 4]  // vertical
		],
		[2, 2]
	);
});
