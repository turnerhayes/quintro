import { fromJS } from "immutable";

import BoardRecord from "@shared-lib/board";
import createReducer from "@app/reducers";
import {
	fetchedGame
} from "@app/actions";

import selectors from "./game";

describe("game selectors", () => {
	describe("getWinner", () => {
		it("should return the winning color", () => {
			const winningColor = "green";
			const gameName = "test";

			const game = fromJS({
				name: gameName,
				board: new BoardRecord({
					width: 10,
					height: 10,
				}),
				players: [
					{
						color: "blue",
						user: {
							id: "1",
						},
					},
					{
						color: "red",
						user: {
							id: "2",
						},
					},
					{
						color: winningColor,
						user: {
							id: "3",
						},
					},
				],
				isStarted: true,
				winner: winningColor,
			});

			const reducer = createReducer();

			const state = [
				fetchedGame({ game }),
			].reduce(reducer, undefined);

			expect(selectors.getWinner(state.getIn(["games", "items", gameName]))).toBe(winningColor);
		});

		it("should return undefined if the game is not over", () => {
			const winningColor = "green";
			const gameName = "test";

			const game = fromJS({
				name: gameName,
				board: new BoardRecord({
					width: 10,
					height: 10,
				}),
				players: [
					{
						color: "blue",
						user: {
							id: "1",
						},
					},
					{
						color: "red",
						user: {
							id: "2",
						},
					},
					{
						color: winningColor,
						user: {
							id: "3",
						},
					},
				],
				isStarted: true,
			});

			const reducer = createReducer();

			const state = [
				fetchedGame({ game }),
			].reduce(reducer, undefined);

			expect(selectors.getWinner(state.getIn(["games", "items", gameName]))).toBeUndefined();
		});
	});
});
