import { getNextColor } from "./players";
import { DEFAULT_COLORS } from "./__test__/utils";

describe("shared-lib", () => {
	describe("player utils", () => {
		describe("getNextColor", () => {
			it("should return the first color when the game is empty", () => {
				const color = getNextColor([]);

				expect(color.id).toBe(DEFAULT_COLORS[0]);
			});

			it("should return the first color when it is not taken", () => {
				const color = getNextColor([DEFAULT_COLORS[1]]);

				expect(color.id).toBe(DEFAULT_COLORS[0]);
			});

			it("should return the first that is not taken", () => {
				// eslint-disable-next-line no-magic-numbers
				const color = getNextColor(DEFAULT_COLORS.slice(0, 3));

				// eslint-disable-next-line no-magic-numbers
				expect(color.id).toBe(DEFAULT_COLORS[3]);
			});

			it("should return undefined if all the colors are taken", () => {
				const color = getNextColor(DEFAULT_COLORS);

				expect(color).toBeUndefined();
			});
		});
	});
});

