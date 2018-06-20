import React from "react";
import { shallow } from "enzyme";
import { intlShape } from "react-intl";

import createReducer from "@app/reducers";
import { mockStore, intl } from "@app/utils/test-utils";
import {
	createGame,
	checkGameName,
	checkedGameName,
}                  from "@app/actions";

import CreateGame from "./CreateGame";

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

		expect(wrapper.dive()).toHaveProp("isNameValid", false);
		expect(wrapper.dive()).toHaveProp("onCheckName");
		expect(wrapper.dive()).toHaveProp("onCreateGame");

		wrapper = shallow(
			(
				<CreateGame
				/>
			),
			{
				context: {
					store: mockStore(
						store.getState().setIn(
							[
								"CreateGameContainer",
								"isNameValid",
							],
							true
						)
					),
				},
			}
		);

		expect(wrapper.dive()).toHaveProp("isNameValid", true);
		expect(wrapper.dive()).toHaveProp("onCheckName");
		expect(wrapper.dive()).toHaveProp("onCreateGame");
	});

	it("should dispatch a createGame action when onCreateGame is invoked", () => {
		const store = mockStore(createReducer()(undefined, {}));

		jest.spyOn(store, "dispatch").mockImplementation(() => {});

		const game = {
			name: "test",
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

	it("should dispatch a checkGameName action when onCheckName is invoked", () => {
		const store = mockStore(createReducer()(undefined, {}));

		jest.spyOn(store, "dispatch").mockImplementation(() => {});

		const name = "test";

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

		wrapper.dive().prop("onCheckName")(name);

		expect(store.dispatch).toHaveBeenCalledWith(
			checkGameName(name)
		);
	});

	it("should set name validity via the container reducer", () => {
		let reducer = createReducer();
		const store = mockStore(reducer(undefined, {}));

		shallow(
			(
				<CreateGame
				/>
			),
			{
				context: {
					store,
					intl,
				},
				childContextTypes: {
					intl: intlShape,
				},
			}
		).dive().dive();

		reducer = createReducer({
			injectedReducers: store.injectedReducers,
		});

		let state;

		jest.spyOn(store, "dispatch").mockImplementation((action) => {
			state = reducer(state, action);
		});

		store.dispatch(checkedGameName({ result: true }));

		expect(state.getIn([ "CreateGameContainer", "isNameValid" ])).toBeFalsy();

		store.dispatch(checkedGameName({ result: false }));

		expect(state.getIn([ "CreateGameContainer", "isNameValid" ])).toBeTruthy();
	});
});
