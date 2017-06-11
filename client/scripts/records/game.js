import assert       from "assert";
import {
	Record,
	Map
}                   from "immutable";
import PlayerRecord from "project/scripts/records/player";
import BoardRecord  from "project/scripts/records/board";


const schema = {
	name: "",
	board: undefined,
	playerLimit: 5,
	players: Map(),
	currentPlayerColor: null,
	winner: null,
	quintros: null
};

class GameRecord extends Record(schema, "Game") {
	constructor(args) {
		assert(args.board, 'A "board" property is required');

		if (!(args.board instanceof BoardRecord)) {
			args.board = new BoardRecord(args.board);
		}

		args.players = Map(
			args.players.map(
				(player, order) => [player.color, new PlayerRecord(player, { order })]
			)
		);

		super(args);
	}

	quintros() {
		return this.board.quintros(...arguments);
	}
}

GameRecord.prototype.setMarble = function setMarble({color, position}) {
	return this.updateIn(["board", "filled"], (filled) => filled.push(Map({ color, position })));
};

GameRecord.prototype.setPlayer = function setPlayer({ color }) {
	return this.set("currentPlayerColor", color);
};

GameRecord.prototype.addPlayer = function addPlayer({ player }) {
	return this.setIn(["players", player.color], new PlayerRecord(player));
};

export default GameRecord;
