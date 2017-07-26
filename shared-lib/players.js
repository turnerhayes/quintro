"use strict";

const {
	find,
	includes
} = require("lodash");
const Config = require("./config");

function getNextColor(currentPlayerColors) {
	return find(
		Config.game.colors,
		(colorDefinition) => !includes(
			currentPlayerColors,
			colorDefinition.id
		)
	);
}

exports = module.exports = {
	getNextColor
};
