import {game as GameConfig} from "./config";

function getNextColor(currentPlayerColors: Set<string>) {
	return GameConfig.colors.find(
		(colorDefinition) => !currentPlayerColors.has(
			colorDefinition.id
		)
	);
}

export { getNextColor };
