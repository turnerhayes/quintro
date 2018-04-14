import React from "react";
import { fromJS } from "immutable";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import _PlayGame from "./PlayGame";
import StartGameOverlay from "./StartGameOverlay";
import WinnerBanner from "./WinnerBanner";
import { wrapWithIntlProvider } from "@app/utils/test-utils";

const PlayGame = wrapWithIntlProvider(_PlayGame);

const mockStore = configureStore();

const NO_OP = () => {};

describe("PlayGame component", () => {
	const name = "test";

	const game = fromJS({
		name,
		playerLimit: 3,
		players: [],
		board: {
			width: 10,
			height: 10,
			filled: [],
		},
	});

	const state = fromJS({
		games: {
			items: {
				[name]: game,
			},
		},
	});

	const playerUsers = fromJS({});

	it("should have a start button overlay if the game is not started", () => {
		const store = mockStore(state);

		const wrapper = mount(
			<Provider
				store={store}
			>
				<PlayGame
					game={game}
					gameName={name}
					onWatchGame={NO_OP}
					onJoinGame={NO_OP}
					onStartGame={NO_OP}
					onPlaceMarble={NO_OP}
					onGetGame={NO_OP}
					onCancelJoin={NO_OP}
					playerUsers={playerUsers}
				/>
			</Provider>
		);

		expect(wrapper.find(StartGameOverlay)).toExist();
	});

	it("should have a winner banner overlay if the game is over", () => {
		const finishedGame = game.set(
			"winner",
			"green"
		);

		const store = mockStore(
			state.setIn(
				[
					"games",
					"items",
					name,
				],
				finishedGame
			)
		);

		const wrapper = mount(
			<Provider
				store={store}
			>
				<PlayGame
					game={finishedGame}
					gameName={name}
					onWatchGame={NO_OP}
					onJoinGame={NO_OP}
					onStartGame={NO_OP}
					onPlaceMarble={NO_OP}
					onGetGame={NO_OP}
					onCancelJoin={NO_OP}
					playerUsers={playerUsers}
				/>
			</Provider>
		);

		expect(wrapper.find(WinnerBanner)).toExist();
	});
});
