import React from "react";
import { shallow } from "enzyme";
import { fromJS } from "immutable";
import sinon from "sinon";
import { Unwrapped as FindGame } from "./FindGame";
import { SEARCH_DEBOUNCE_PERIOD_IN_MILLISECONDS } from "./FindGame";
import { intl } from "@app/utils/test-utils";

const NO_OP = () => {};

function getProps({
	onFindOpenGames = NO_OP,
	onJoinGame = NO_OP,
	onCancelFind = NO_OP,
	classes = {},
} = {}) {
	return {
		onFindOpenGames,
		onJoinGame,
		onCancelFind,
		classes,
		intl,
	};
}

describe("FindGame component", () => {
	it("should have a player limit input", () => {
		const wrapper = shallow(
			<FindGame
				{...getProps()}
			/>
		);

		expect(wrapper.find("TextField[name='playerLimit']")).toExist();
	});

	it("should call onFindOpenGames handler with null numberOfPlayers when no player limit is specified", () => {
		const onFindOpenGames = jest.fn();

		const wrapper = shallow(
			<FindGame
				{...getProps({ onFindOpenGames })}
			/>
		);

		wrapper.find("form").simulate("submit", {
			preventDefault() {},
		});

		expect(onFindOpenGames).toHaveBeenCalledWith({
			numberOfPlayers: null,
		});
	});

	it("should call onFindOpenGames handler with correct numberOfPlayers when a player limit is specified", () => {
		const onFindOpenGames = jest.fn();

		const numberOfPlayers = 3;

		const wrapper = shallow(
			<FindGame
				{...getProps({ onFindOpenGames })}
			/>
		);

		wrapper.find("TextField[name='playerLimit']").simulate(
			"change",
			{
				target: {
					value: numberOfPlayers + "",
				},
			}
		);

		wrapper.find("form").simulate("submit", {
			preventDefault() {},
		});

		expect(onFindOpenGames).toHaveBeenCalledWith({
			numberOfPlayers,
		});
	});

	it("should join the first open game found", () => {
		const onFindOpenGames = jest.fn();

		const onJoinGame = jest.fn();

		const gameName = "openGame";

		const wrapper = shallow(
			<FindGame
				{...getProps({
					onFindOpenGames,
					onJoinGame,
				})}
				onCancelFind={NO_OP}
				classes={{}}
				intl={intl}
			/>
		);

		wrapper.find("form").simulate("submit", {
			preventDefault() {},
		});

		const results = fromJS([
			{
				name: gameName,
			},
			{
				name: "full game",
			},
		]);

		wrapper.setProps({ results });

		expect(onJoinGame).toHaveBeenCalledWith({ gameName });
	});

	it("should search again if no results were found", () => {
		// Can't use Jest's fake clock API because it doesn't
		// handle Lodash's debounce implementation properly.
		// See https://github.com/facebook/jest/issues/3465
		const clock = sinon.useFakeTimers();

		const onFindOpenGames = jest.fn();

		const onJoinGame = jest.fn();

		const wrapper = shallow(
			<FindGame
				{...getProps({
					onFindOpenGames,
					onJoinGame,
				})}
			/>
		);

		wrapper.find("form").simulate("submit", {
			preventDefault() {},
		});

		expect(onFindOpenGames).toHaveBeenCalledTimes(1);

		const results = fromJS([]);

		clock.tick(SEARCH_DEBOUNCE_PERIOD_IN_MILLISECONDS);
		wrapper.setProps({ results });

		expect(onJoinGame).not.toHaveBeenCalled();

		// eslint-disable-next-line no-magic-numbers
		expect(onFindOpenGames).toHaveBeenCalledTimes(2);

		clock.restore();
	});

	it("should stop searching on encountering an error", () => {
		const wrapper = shallow(
			<FindGame
				{...getProps()}
			/>
		);

		wrapper.find("form").simulate("submit", {
			preventDefault() {},
		});

		expect(wrapper.instance().state).toHaveProperty("isSearching", true);

		wrapper.setProps({ findGameError: new Error("the world exploded") });

		expect(wrapper.instance().state).toHaveProperty("isSearching", false);
	});
});
