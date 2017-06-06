/* globals describe, it */

const _         = require("lodash");
const expect    = require("expect.js");
const Board     = require("../shared-lib/board");
const GameModel = require("../server/persistence/models/game");

/* eslint-disable no-magic-numbers */
const boardLayouts = {
	horizontal: {
		quintros: {
			horizontal: [
				[0, 1], [1, 1], [2, 1], [3, 1], [4, 1],
			]
		},
		start: [2, 1],
		filled: [
			[0, 1],
			[1, 1],
			[2, 1],
			[3, 1],
			[4, 1],
		]
	},

	vertical: {
		quintros: {
			vertical: [
				[0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
			]
		},
		start: [0, 3],
		filled: [
			[0, 1],
			[0, 2],
			[0, 3],
			[0, 4],
			[0, 5],
		]
	},

	"top left to bottom right": {
		quintros: {
			topLeft: [
				[2, 1], [3, 2], [4, 3], [5, 4], [6, 5], [7, 6],
			]
		},
		start: [5, 4],
		filled: [
			[2, 1],
			[3, 2],
			[4, 3],
			[5, 4],
			[6, 5],
			[7, 6],
		],
	},

	"top right to bottom left": {
		quintros: {
			topRight: [
				[1, 6], [2, 5], [3, 4], [4, 3], [5, 2], [6, 1],
			]
		},
		start: [3, 4],
		filled: [
			[6, 1],
			[5, 2],
			[4, 3],
			[3, 4],
			[2, 5],
			[1, 6],
		],
	},

	"both diagonals": {
		quintros: {
			topRight: [
				[1, 6], [2, 5], [3, 4], [4, 3], [5, 2], [6, 1],
			],
			topLeft: [
				[0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
			]
		},
		start: [3, 4],
		filled: [
			[6, 1],
			[5, 2],
			[4, 3],
			[3, 4],
			[2, 5],
			[1, 6],

			[0, 1],
			[1, 2],
			[2, 3],
			[4, 5],
		],
	},

	"horizontal and vertical": {
		quintros: {
			horizontal: [
				[4, 5], [5, 5], [6, 5], [7, 5], [8, 5],
			],
			vertical: [
				[4, 5], [4, 6], [4, 7], [4, 8], [4, 9],
			]
		},
		start: [4, 5],
		filled: [
			[4, 5],
			[5, 5],
			[6, 5],
			[7, 5],
			[8, 5],
			[4, 6],
			[4, 7],
			[4, 8],
			[4, 9],
		]
	},

	"both diagonals and horizontal and vertical": {
		quintros: {
			horizontal: [
				[3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4],
			],
			vertical: [
				[3, 4], [3, 5], [3, 6], [3, 7], [3, 8],
			],
			topRight: [
				[1, 6], [2, 5], [3, 4], [4, 3], [5, 2], [6, 1],
			],
			topLeft: [
				[0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
			]
		},
		start: [3, 4],
		filled: [
			[1, 6],
			[2, 5],
			[3, 4],
			[4, 3],
			[5, 2],
			[6, 1],
			[0, 1],
			[1, 2],
			[2, 3],
			[4, 5],
			[4, 4],
			[5, 4],
			[6, 4],
			[7, 4],
			[8, 4],
			[3, 5],
			[3, 6],
			[3, 7],
			[3, 8],
		],
	},

	"starting from an unrelated cell": {
		noQuintros: true,
		start: [7, 7],
		filled: [
			[0, 1],
			[1, 1],
			[2, 1],
			[3, 1],
			[4, 1],
		]
	},

	"interrupted by another color": {
		noQuintros: true,
		start: [1, 1],
		filled: [
			[0, 1],
			[1, 1],
			{
				position: [2, 1],
				color: "blue"
			},
			[3, 1],
			[4, 1],
		]
	},

	"less than 5 filled": {
		noQuintros: true,
		start: [1, 1],
		filled: [
			[0, 1],
			[1, 1],
			[2, 1],
			[3, 1],
		]
	},

	"gap between filled cells": {
		noQuintros: true,
		start: [1, 1],
		filled: [
			[0, 1],
			[1, 1],

			[3, 1],
			[4, 1],
		]
	},
};
/* eslint-enable no-magic-numbers */

describe("Board", function() {
	describe("getQuintros", function() {
		_.each(
			boardLayouts,
			(layout, layoutName) => {
				describe(layoutName, function() {
					const game = new GameModel({
						board: {
							width: 10,
							height: 10,
							filled: layout.filled.map(
								(cell) => {
									if (Array.isArray(cell)) {
										return {
											position: cell,
											color: "red",
										};
									}
									else {
										return {
											position: cell.position,
											color: cell.color
										};
									}
								}
							)
						}
					});

					const quintros = Board.getQuintros({
						game,
						startCell: {
							position: layout.start,
							color: "red"
						}
					});

					if (layout.noQuintros) {
						it("should not return any quintros", function() {
							expect(quintros).to.be.empty();
						});
					}
					else {
						_.each(
							layout.quintros,
							(quintro, type) => {
								it(`should return a ${type} quintro`, function() {
									expect(quintros).to.have.property(type);
									expect(quintros[type]).to.eql(layout.quintros[type]);
								});
							}
						);
					}
				});
			}
		);
	});
});
