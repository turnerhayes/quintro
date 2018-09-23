import { fromJS } from "immutable";

import Board from "@shared-lib/board";

import { DEFAULT_COLORS } from "../__test__/utils";
import { getCurrentPlayerColor } from "./game";

describe("shared-lib", () => {
	describe("game selectors", () => {
		describe("getCurrentPlayerColor", () => {
			it("should return the next player color in the sequence", () => {
				const players = [
					{
						id: "1",
						color: DEFAULT_COLORS[0],
					},

					{
						id: "2",
						color: DEFAULT_COLORS[1],
					},

					{
						id: "3",
						color: DEFAULT_COLORS[2],
					},
				];

				const game = fromJS({
					board: new Board({
						width: 10,
						height: 10,
						filledCells: [
							{
								position: [0, 0],
								color: DEFAULT_COLORS[0],
							},

							{
								position: [1, 1],
								color: DEFAULT_COLORS[1],
							},
						],
					}),
					playerLimit: 3,
					players,
					isStarted: true,
				});

				expect(getCurrentPlayerColor(game)).toBe(DEFAULT_COLORS[2]);
			});

			it("should wrap around at the end of the player sequence", () => {
				const players = [
					{
						id: "1",
						color: DEFAULT_COLORS[0],
					},

					{
						id: "2",
						color: DEFAULT_COLORS[1],
					},

					{
						id: "3",
						color: DEFAULT_COLORS[2],
					},
				];

				const game = fromJS({
					board: new Board({
						width: 10,
						height: 10,
						filledCells: [
							{
								position: [0, 0],
								color: DEFAULT_COLORS[0],
							},

							{
								position: [1, 1],
								color: DEFAULT_COLORS[1],
							},

							{
								position: [0, 1],
								color: DEFAULT_COLORS[2],
							},
						],
					}),
					playerLimit: 3,
					players,
					isStarted: true,
				});

				expect(getCurrentPlayerColor(game)).toBe(DEFAULT_COLORS[0]);
			});

			it("should return undefined if the game has not started", () => {
				const players = [
					{
						id: "1",
						color: DEFAULT_COLORS[0],
					},
				];

				const game = fromJS({
					board: new Board({
						width: 10,
						height: 10,
						filledCells: [],
					}),
					playerLimit: 3,
					players,
					isStarted: false,
				});

				expect(getCurrentPlayerColor(game)).toBeUndefined();
			});

			it("should return the first player's color if the game is started but no move has been made", () => {
				const players = [
					{
						id: "1",
						color: DEFAULT_COLORS[0],
					},

					{
						id: "2",
						color: DEFAULT_COLORS[1],
					},

					{
						id: "3",
						color: DEFAULT_COLORS[2],
					},
				];

				const game = fromJS({
					board: new Board({
						width: 10,
						height: 10,
						filledCells: [],
					}),
					playerLimit: 3,
					players,
					isStarted: true,
				});

				expect(getCurrentPlayerColor(game)).toBe(DEFAULT_COLORS[0]);
			});
		});
	});
});
