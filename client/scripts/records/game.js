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
	playerLimit: null,
	players: Map(),
	currentPlayerColor: null,
	winner: null,
	quintros: null,
	isStarted: false
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

	quintros(...args) {
		return this.board.quintros(...args);
	}

	get me() {
		return this.players.find((player) => player.isMe);
	}
}

GameRecord.prototype.setMarble = function setMarble({color, position}) {
	return this.updateIn(["board", "filled"], (filled) => filled.push(Map({ color, position })));
};

GameRecord.prototype.setPlayer = function setPlayer({ color }) {
	return this.set("currentPlayerColor", color);
};

GameRecord.prototype.addPlayer = function addPlayer({ player }) {
	return this.updateIn(
		["players", player.color],
		new PlayerRecord(player),
		(player) => player.set("isPresent", true)
	);
};

GameRecord.prototype.setPlayerPresence = function setPlayerPresence({ presenceMap, setMissingPlayersTo }) {
	return this.updateIn(
		["players"],
		(players) => players.map(
			(player) => {
				if (player.color in presenceMap) {
					return player.set("isPresent", presenceMap[player.color]);
				}

				if (setMissingPlayersTo !== undefined) {
					return player.set("isPresent", setMissingPlayersTo);
				}

				return player;
			}
		)
	);
};

GameRecord.prototype.start = function start() {
	if (this.isStarted) {
		return this;
	}

	return this.set("isStarted", true);
};

export default GameRecord;
