import { Record } from "immutable";

const schema = {
	userID: null,
	isAnonymous: true,
	isPresent: true,
	order: null,
	color: "",
	user: null
};

/**
 * Record representing a player in a particular game.
 *
 * @memberof client.records
 * @extends Immutable.Record
 */
class PlayerRecord extends Record(schema, "Player") {
	/**
	 * @param {object} args - the constructor arguments
	 * @param {string} args.userID - the ID of the user represented by this player
	 * @param {object} args.user - the user represented by this player. If specified,
	 *	this should contain an `id` key with the user ID. This parameter should be avoided;
	 *	use the `userID` parameter instead (the user data will not be stored in this record
	 *	anyway)
	 */
	constructor(args) {
		if (args.user && !args.userID) {
			args.userID = args.user.id;
			delete args.user;
		}

		super(args);
	}

	/**
	 * @member {string} client.records.PlayerRecord#userID - the ID of the user represented by this player
	 */

	/**
	 * @member {boolean} isAnonymous - whether or not the user has a site account
	 */

	/**
	 * @member {boolean} isPresent - whether or not the player is present in the game
	 */

	/**
	 * @member {Number} order - the index (0-based) of where this player falls in the
	 *	turn order for the game
	 */

	/**
	 * @member {string} color - the color representing this player in the game
	 */
}

export default PlayerRecord;
