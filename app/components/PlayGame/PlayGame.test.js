import React from "react";
import { fromJS } from "immutable";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import { IntlProvider } from "react-intl";
import configureStore from "redux-mock-store";
import PlayGame from "./PlayGame";
import StartGameOverlay from "./StartGameOverlay";
import WinnerBanner from "./WinnerBanner";
import { translationMessages } from "@app/i18n";

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

	it("should have a start button overlay if the game is not started", () => {
		const store = mockStore(state);

		const wrapper = mount(
			<Provider
				store={store}
			>
				<IntlProvider
					locale="en"
					messages={translationMessages.en}
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
					/>
				</IntlProvider>
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
				<IntlProvider
					locale="en"
					messages={translationMessages.en}
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
					/>
				</IntlProvider>
			</Provider>
		);

		expect(wrapper.find(WinnerBanner)).toExist();
	});
});
