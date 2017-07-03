import {
	Record,
	Map,
	List
}                 from "immutable";
import GameRecord from "project/scripts/records/game";

const schema = {
	items: Map(),
	getGameError: null,
	gamePlayError: null,
	findGameError: null,
	findResults: null
};

class GamesStateRecord extends Record(schema, "GamesState") {
}

GamesStateRecord.prototype.setGetGameError = function setGetGameError(error) {
	return this.set("getGameError", error);
};

GamesStateRecord.prototype.addGame = function addGame(game) {
	return this.setIn(["items", game.name], new GameRecord(game));
};

GamesStateRecord.prototype.createGame = function createGame({ width, height, name, playerLimit }) {
	return this.setIn(["items", name], new GameRecord({
		name: name,
		playerLimit: playerLimit,
		board: {
			width,
			height
		}
	}));
};

GamesStateRecord.prototype.setMarble = function setMarble({ gameName, color, position}) {
	if (!this.items.has(gameName)) {
		return this;
	}

	return this.updateIn(["items", gameName], game => game.setMarble({ color, position }));
};

GamesStateRecord.prototype.setPlayer = function setPlayer({ gameName, color }) {
	if (!this.items.has(gameName)) {
		return this;
	}

	return this.setIn(["items", gameName], this.items.get(gameName).setPlayer({ color }));
};

GamesStateRecord.prototype.addPlayer = function addPlayer({ gameName, player }) {
	if (!this.items.has(gameName)) {
		return this;
	}

	return this.setIn(["items", gameName], this.items.get(gameName).addPlayer({ player }));
};

GamesStateRecord.prototype.setWinner = function setWinner({ gameName, color }) {
	if (!this.items.has(gameName)) {
		return this;
	}

	return this.setIn(["items", gameName, "winner"], color);
};

GamesStateRecord.prototype.setPlayerPresence = function setPlayerPresence({
	gameName,
	presenceMap,
	setMissingPlayersTo
}) {
	if (!this.items.has(gameName)) {
		return this;
	}

	return this.setIn(["items", gameName], this.items.get(gameName).setPlayerPresence({
		presenceMap,
		setMissingPlayersTo
	}));
};

GamesStateRecord.prototype.startGame = function startGame({ gameName }) {
	if (!this.items.has(gameName)) {
		return this;
	}

	return this.setIn(["items", gameName], this.items.get(gameName).start());
};

GamesStateRecord.prototype.setFindResults = function setFindResults(results) {
	return this.set(
		"findResults",
		results ?
			List(results.map(
				(result) => new GameRecord(result)
			)) :
			null
	);
};

export default GamesStateRecord;
