/* eslint-env jest */

import { Set, fromJS } from "immutable";
import * as immutableMatchers from "jest-immutable-matchers";
import selectors from "./games";

beforeAll(
	() => jest.addMatchers(immutableMatchers)
);

describe("games selectors", () => {
	describe("getQuintros", () => {
		const initialState = fromJS({
			items: {
				test: {
					board: {
						filled: [],
						width: 10,
						height: 10,
					},
					name: "test",
					playerLimit: 3,
					currentPlayerColor: "blue",
				},
			},
		});

		it("should return a quintro when the last marble placed makes a quintro", () => {
			const currentPlayerColor = initialState.getIn(["items", "test", "currentPlayerColor"]);
			const player2color = "red";
			const player3color = "green";

			const filled = fromJS([
				/* eslint-disable no-magic-numbers */
				{
					position: [3, 0],
					color: currentPlayerColor,
				},
				{
					position: [5, 6],
					color: player2color,
				},
				{
					position: [8, 9],
					color: player3color,
				},

				{
					position: [4, 0],
					color: currentPlayerColor,
				},
				{
					position: [4, 6],
					color: player2color,
				},
				{
					position: [7, 9],
					color: player3color,
				},

				{
					position: [6, 0],
					color: currentPlayerColor,
				},
				{
					position: [3, 6],
					color: player2color,
				},
				{
					position: [6, 9],
					color: player3color,
				},

				{
					position: [7, 0],
					color: currentPlayerColor,
				},
				{
					position: [2, 6],
					color: player2color,
				},
				{
					position: [5, 9],
					color: player3color,
				},

				{
					position: [5, 0],
					color: currentPlayerColor,
				},
				/* eslint-ensable no-magic-numbers */
			]);

			const modifiedState = initialState.setIn(
				["items", "test", "board", "filled"],
				filled
			);

			const quintros = selectors.getQuintros(modifiedState, { gameName: "test" });

			expect(quintros).toEqualImmutable(
				Set([
					Set(filled.filter((marble) => marble.get("color") === currentPlayerColor))
				])
			);
		});

		it("should not return a quintro when the last marble placed does not make a quintro", () => {
			const currentPlayerColor = initialState.getIn(["items", "test", "currentPlayerColor"]);
			const player2color = "red";
			const player3color = "green";

			const filled = fromJS([
				{
					position: [3, 0],
					color: currentPlayerColor,
				},
				{
					position: [5, 6],
					color: player2color,
				},
				{
					position: [8, 9],
					color: player3color,
				},

				{
					position: [4, 0],
					color: currentPlayerColor,
				},
				{
					position: [4, 6],
					color: player2color,
				},
				{
					position: [7, 9],
					color: player3color,
				},

				{
					position: [6, 0],
					color: currentPlayerColor,
				},
				{
					position: [3, 6],
					color: player2color,
				},
				{
					position: [6, 9],
					color: player3color,
				},

				{
					position: [7, 0],
					color: currentPlayerColor,
				},
				{
					position: [2, 6],
					color: player2color,
				},
				{
					position: [5, 9],
					color: player3color,
				},
			]);

			const modifiedState = initialState.setIn(
				["items", "test", "board", "filled"],
				filled
			);

			const quintros = selectors.getQuintros(modifiedState, { gameName: "test" });

			expect(quintros).toEqualImmutable(Set());
		});
	});
});
