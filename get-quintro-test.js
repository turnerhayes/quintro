const assert = require("assert");
const Board = require("./shared-lib/board");
const GameModel = require("./server/persistence/models/game");

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
	}
};

for (let key in boardLayouts) {
	if (!boardLayouts.hasOwnProperty(key)) {
		continue;
	}

	const game = new GameModel({
		board: {
			width: 10,
			height: 10,
			filled: boardLayouts[key].filled.map(
				(position) => ({
					position,
					color: "red"
				})
			)
		}
	});

	const quintros = Board.getQuintros({
		game,
		startCell: {
			position: boardLayouts[key].start,
			color: "red"
		}
	});

	for (let type in boardLayouts[key].quintros) {
		if (!boardLayouts[key].quintros.hasOwnProperty(type)) {
			continue;
		}

		assert.ok(quintros[type], `${key} board does not have a ${type} quintro`);
		assert.equal(
			JSON.stringify(quintros[type]),
			JSON.stringify(boardLayouts[key].quintros[type]),
			`${key} board's ${type} quintro is not correct`
		);
	}
}
