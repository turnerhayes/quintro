"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextColor = void 0;
const config_1 = require("./config");
function getNextColor(currentPlayerColors) {
    return config_1.game.colors.find((colorDefinition) => !currentPlayerColors.has(colorDefinition.id));
}
exports.getNextColor = getNextColor;
