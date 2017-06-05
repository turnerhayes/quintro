import assert       from "assert";
import {
	Record,
	Map,
	fromJS
}                   from "immutable";
import PlayerRecord from "project/scripts/records/player";


const schema = {
	name: "",
	board: undefined,
	playerLimit: 5,
	players: Map(),
	currentPlayerColor: null,
	is_over: false
};

class GameRecord extends Record(schema, "Game") {
	constructor(args) {
		assert(args.board, 'A "board" property is required');
		assert(
			args.board.width && args.board.height,
			'Must specify "board.width" and "board.height" properties'
		);

		if (args.board.filled) {
			args.board.filled = args.board.filled.reduce(
				(filled, cellInfo) => {
					filled[JSON.stringify(cellInfo.position)] = cellInfo;

					return filled;
				},
				{}
			);
		}
		else {
			args.board.filled = [];
		}

		args.board = fromJS(args.board);

		args.players = Map(args.players.map(player => [player.color, new PlayerRecord(player)]));

		super(args);
	}
}

GameRecord.prototype.setMarble = function setMarble({color, position}) {
	return this.setIn(["board", "filled", JSON.stringify(position)], Map({ color }));
};

GameRecord.prototype.advancePlayer = function advancePlayer() {
	return this.set("currentPlayerColor", this.colors.get(
		(
			this.colors.indexOf(this.currentColor) + 1
		) % this.colors.size
	));
};

export default GameRecord;
