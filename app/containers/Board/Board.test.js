import React from "react";
import { fromJS, Set } from "immutable";
import { shallow } from "enzyme";
import * as immutableMatchers from "jest-immutable-matchers";

import BoardRecord from "@shared-lib/board";
import Quintro from "@shared-lib/quintro";
import { mockStore } from "@app/utils/test-utils";
import {
	fetchedGame,
} from "@app/actions";
import createReducer from "@app/reducers";

import BoardContainer from "./Board";

beforeAll(() => {
	jest.addMatchers(immutableMatchers);
});

describe("Board container", () => {
	const gameName = "test";

	const color1 = "blue";
	const color2 = "red";

	const board = new BoardRecord({
		width: 15,
		height: 15,
	});

	let game = fromJS({
		board,
		name: gameName,
		players: [
			{
				user: {
					id: 1,
				},
				color: color1,
			},
			{
				user: {
					id: 2,
				},
				color: color2,
			},
		],
	});

	it("should not pass quintros if the game is not over", () => {
		const reducer = createReducer();
		const state = reducer(undefined, fetchedGame({ game }));
		const store = mockStore(state);

		const wrapper = shallow(
			(
				<BoardContainer
					gameName={gameName}
				/>
			),
			{
				context: {
					store,
				}
			}
		);

		expect(wrapper).toHaveProp("gameIsOver", false);
		expect(wrapper).toHaveProp("quintros", undefined);
	});

	it("should have quintros if the game is over", () => {
		const reducer = createReducer();

		const cells = [
			/* eslint-disable no-magic-numbers */
			{
				position: [0, 1],
				color: color1,
			},
			{
				position: [10, 10],
				color: color2,
			},
			{
				position: [0, 2],
				color: color1,
			},
			{
				position: [9, 10],
				color: color2,
			},
			{
				position: [0, 3],
				color: color1,
			},
			{
				position: [10, 9],
				color: color2,
			},
			{
				position: [0, 4],
				color: color1,
			},
			{
				position: [10, 0],
				color: color2,
			},
			{
				position: [0, 5],
				color: color1,
			},
			/* eslint-enable no-magic-numbers */
		];

		game = game.merge({
			isStarted: true,
			winner: color1
		}).setIn(
			["board", "filledCells"],
			fromJS(cells)
		);

		const state = reducer(undefined, fetchedGame({ game }));
		const store = mockStore(state);

		const wrapper = shallow(
			(
				<BoardContainer
					gameName={gameName}
				/>
			),
			{
				context: {
					store,
				}
			}
		);

		expect(wrapper.prop("quintros")).toEqualImmutable(Set.of(
			new Quintro({
				cells: cells.filter((cell) => cell.color === color1)
			})
		));
		expect(wrapper).toHaveProp("gameIsOver", true);
	});
});
