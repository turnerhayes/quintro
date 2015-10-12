import Backbone    from "backbone";
import PlayerModel from "../models/player";

class PlayersCollection extends Backbone.Collection {
	get model() {
		return PlayerModel;
	}
}

export default PlayersCollection;
