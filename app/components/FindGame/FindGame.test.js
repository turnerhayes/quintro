import React from "react";
import { mount } from "enzyme";
import { fromJS } from "immutable";
import sinon from "sinon";
import _FindGame from "./index";
import { SEARCH_DEBOUNCE_PERIOD_IN_MILLISECONDS } from "./FindGame";
import { wrapWithIntlProvider } from "@app/utils/test-utils";

const FindGame = wrapWithIntlProvider(_FindGame);

const NO_OP = () => {};

describe("FindGame component", () => {
	it("should have a player limit input", () => {
		const wrapper = mount(
			<FindGame
				onFindOpenGames={NO_OP}
				onJoinGame={NO_OP}
			/>
		);

		expect(wrapper.find("TextField[name='playerLimit']")).toExist();
	});

	it("should call onFindOpenGames handler with null numberOfPlayers when no player limit is specified", () => {
		const onFindOpenGames = jest.fn();

		const wrapper = mount(
			<FindGame
				onFindOpenGames={onFindOpenGames}
				onJoinGame={NO_OP}
			/>
		);

		wrapper.find("form").simulate("submit");

		expect(onFindOpenGames).toHaveBeenCalledWith({
			numberOfPlayers: null,
		});
	});

	it("should call onFindOpenGames handler with correct numberOfPlayers when a player limit is specified", () => {
		const onFindOpenGames = jest.fn();

		const numberOfPlayers = 3;

		const wrapper = mount(
			<FindGame
				onFindOpenGames={onFindOpenGames}
				onJoinGame={NO_OP}
			/>
		);

		wrapper.find("input[name='playerLimit']").simulate(
			"change",
			{
				target: {
					value: numberOfPlayers + "",
				},
			}
		);

		wrapper.find("form").simulate("submit");

		expect(onFindOpenGames).toHaveBeenCalledWith({
			numberOfPlayers,
		});
	});

	it("should join the first open game found", () => {
		const onFindOpenGames = jest.fn();

		const onJoinGame = jest.fn();

		const gameName = "openGame";

		const wrapper = mount(
			<FindGame
				onFindOpenGames={onFindOpenGames}
				onJoinGame={onJoinGame}
			/>
		);

		wrapper.find("form").simulate("submit");

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

		const wrapper = mount(
			<FindGame
				onFindOpenGames={onFindOpenGames}
				onJoinGame={onJoinGame}
			/>
		);

		wrapper.find("form").simulate("submit");

		expect(onFindOpenGames).toHaveBeenCalledTimes(1);

		const results = fromJS([]);

		clock.tick(SEARCH_DEBOUNCE_PERIOD_IN_MILLISECONDS);
		wrapper.setProps({ results });

		expect(onJoinGame).not.toHaveBeenCalled();

		expect(onFindOpenGames).toHaveBeenCalledTimes(2);

		clock.restore();
	});

	it("should stop searching on encountering an error", () => {
		const wrapper = mount(
			<FindGame
				onFindOpenGames={NO_OP}
				onJoinGame={NO_OP}
			/>
		);

		wrapper.find("form").simulate("submit");

		expect(wrapper.find("FindGame").instance().state).toHaveProperty("isSearching", true);

		wrapper.setProps({ findGameError: new Error("the world exploded") });

		expect(wrapper.find("FindGame").instance().state).toHaveProperty("isSearching", false);
	});
});
