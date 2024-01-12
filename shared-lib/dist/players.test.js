"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const players_1 = require("./players");
const utils_1 = require("./__test__/utils");
describe("shared-lib", () => {
    describe("player utils", () => {
        describe("getNextColor", () => {
            it("should return the first color when the game is empty", () => {
                const color = (0, players_1.getNextColor)([]);
                expect(color.id).toBe(utils_1.DEFAULT_COLORS[0]);
            });
            it("should return the first color when it is not taken", () => {
                const color = (0, players_1.getNextColor)([utils_1.DEFAULT_COLORS[1]]);
                expect(color.id).toBe(utils_1.DEFAULT_COLORS[0]);
            });
            it("should return the first that is not taken", () => {
                // eslint-disable-next-line no-magic-numbers
                const color = (0, players_1.getNextColor)(utils_1.DEFAULT_COLORS.slice(0, 3));
                // eslint-disable-next-line no-magic-numbers
                expect(color.id).toBe(utils_1.DEFAULT_COLORS[3]);
            });
            it("should return undefined if all the colors are taken", () => {
                const color = (0, players_1.getNextColor)(utils_1.DEFAULT_COLORS);
                expect(color).toBeUndefined();
            });
        });
    });
});
