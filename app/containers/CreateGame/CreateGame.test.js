import React from "react";
import { shallow } from "enzyme";
import * as immutableMatchers from "jest-immutable-matchers";

import createReducer from "@app/reducers";
import { mockStore } from "@app/utils/test-utils";
import {
	createGame,
}                  from "@app/actions";

import CreateGame from "./CreateGame";

beforeAll(() => {
	jest.addMatchers(immutableMatchers);
});

describe("CreateGame container", () => {
	it("should pass correct props", () => {
		const store = mockStore(createReducer()(undefined, {}));

		let wrapper = shallow(
			(
				<CreateGame
				/>
			),
			{
				context: {
					store,
				},
			}
		);

		expect(wrapper.dive()).toHaveProp("onCreateGame");
	});

	it("should dispatch a createGame action when onCreateGame is invoked", () => {
		const store = mockStore(createReducer()(undefined, {}));

		jest.spyOn(store, "dispatch").mockImplementation(() => {});

		const game = {
			width: 10,
			height: 10,
			playerLimit: 3,
		};

		const wrapper = shallow(
			(
				<CreateGame
				/>
			),
			{
				context: {
					store,
				},
			}
		);

		wrapper.dive().prop("onCreateGame")(game);

		expect(store.dispatch).toHaveBeenCalledWith(
			createGame(game)
		);
	});
});
