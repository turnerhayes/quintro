import assert       from "assert";
import {
	Record,
	Map
}                   from "immutable";
import PlayerRecord from "project/scripts/records/player";
import BoardRecord  from "project/shared-lib/board";


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

/**
 * Record representing a Quintro game.
 *
 * @memberof client.records
 * @extends Immutable.Record
 */
class GameRecord extends Record(schema, "Game") {
	/**
	 * Constructs an instance of the Game record.
	 *
	 * @param {object} args - arguments for constructing the record
	 * @param {object|client.records.BoardRecord} args.board - the board used by this game
	 * @param {object[]} [args.players] - a list of player objects for this
	 * game
	 */
	constructor(args) {
		assert(args.board, 'A "board" property is required');

		if (!(args.board instanceof BoardRecord)) {
			args.board = new BoardRecord(
				Object.assign(
					args.board,
					{
						filledCells: args.board.filled,
					}
				)
			);
		}

		args.players = Map(
			(args.players || []).map(
				(player, order) => [player.color, new PlayerRecord(player, { order })]
			)
		);

		super(args);
	}

	/**
	 * Gets all quintros on this game's board. Convenience accessor for
	 * {@link client.records.BoardRecord#quintros}.
	 *
	 * @returns {Types.Quintro[]} the quintros, if any
	 * @see client.records.BoardRecord#quintros
	 */
	quintros(...args) {
		return this.board.quintros(...args);
	}
}

/**
 * Updates the board to contain the specified color at the specified cell position.
 *
 * @param {object} args - arguments
 * @param {string} args.color - the color with which to fill the cell
 * @param {Types.BoardPosition|Types.BoardPositionImmutable} args.position - the position
 *	of the cell to fill
 *
 * @return {client.records.GameRecord} the mutated game record
 */
GameRecord.prototype.setMarble = function setMarble({color, position}) {
	return this.updateIn(["board"], (board) => board.fillCells({ color, position }));
};

/**
 * Updates the current player color.
 *
 * @param {object} args - arguments
 * @param {string} args.color - the color to set as the current player color
 *
 * @return {client.records.GameRecord} the mutated game record
 */
GameRecord.prototype.setPlayer = function setPlayer({ color }) {
	return this.set("currentPlayerColor", color);
};

/**
 * Updates the list of players to contain the specified player.
 * Sets the player as present if the player already exists.
 *
 * @param {object} args - arguments
 * @param {PlayerRecord|object} args.player - the player to add
 *
 * @return {client.records.GameRecord} the mutated game record
 */
GameRecord.prototype.addPlayer = function addPlayer({ player }) {
	return this.updateIn(
		["players", player.color],
		(existing) => {
			if (existing === undefined) {
				existing = new PlayerRecord(player);
				this.players.set(existing.color, existing);
			}

			return existing.set("isPresent", true);
		}
	);
};

/**
 * Updates the presence status of some or all of the players.
 *
 * @param {object} args - arguments
 * @param {object<string, boolean>} args.presenceMap - a map of colors to presence status
 * (boolean) for each color
 * @param {boolean|undefined} args.setMissingPlayersTo - if not undefined, the status will
 * set to that value for any color that does not exist in the presenceMap. If undefined, it
 * will not change the presence status at all for the missing colors.
 *
 * @return {client.records.GameRecord} the mutated game record
 */
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

/**
 * Updates the game to be marked as started, if it isn't already started.
 *
 * @return {client.records.GameRecord} the mutated game record
 */
GameRecord.prototype.start = function start() {
	if (this.isStarted) {
		return this;
	}

	return this.set("isStarted", true);
};

export default GameRecord;
