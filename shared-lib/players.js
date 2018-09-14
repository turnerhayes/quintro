"use strict";

const Config = require("./config");

function getNextColor(currentPlayerColors) {
	return Config.game.colors.find(
		(colorDefinition) => !currentPlayerColors.includes(
			colorDefinition.id
		)
	);
}

exports = module.exports = {
	getNextColor
};
