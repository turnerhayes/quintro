import React from "react";
import { fromJS } from "immutable";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import WarningIcon from "material-ui-icons/Warning";
import StopIcon from "material-ui-icons/Stop";

import _UserGamesList from "./index";
import messages from "./messages";
import { wrapWithIntlProvider, formatMessage } from "@app/utils/test-utils";
import rootReducer from "@app/reducers";

const mockStore = configureStore();

const UserGamesList = wrapWithIntlProvider(_UserGamesList);

const NO_OP = () => {};

describe("UserGamesList component", () => {
	it("should have only in progress games list if there are no finished games", () => {
		const store = mockStore(rootReducer());

		const user1 = fromJS({
			id: "1",
		});

		const player1 = fromJS({
			color: "blue",
			userID: "1",
		});

		const game1 = fromJS({
			name: "test1",
			board: {
				width: 10,
				height: 10,
			},
			players: [
				player1,
			],
		});


		const userGames = fromJS([
			game1,
		]);

		const users = fromJS({
			1: user1,
		});

		const wrapper = mount(
			<Provider
				store={store}
			>
				<MemoryRouter>
					<UserGamesList
						onGetUserGames={NO_OP}
						userGames={userGames}
						users={users}
					/>
				</MemoryRouter>
			</Provider>
		);

		const tabLabel = formatMessage(messages.tabs.inProgress);

		expect(wrapper.find(`Tab[label="${tabLabel}"]`)).toExist();

		expect(wrapper.find("ListItemText")).toHaveLength(1);
		expect(wrapper.find("ListItemText")).toHaveText(game1.get("name"));
	});

	it("should have only finished games list if there are no in progress games", () => {
		const store = mockStore(rootReducer());

		const user1 = fromJS({
			id: "1",
		});

		const player1 = fromJS({
			color: "blue",
			userID: "1",
		});

		const game1 = fromJS({
			name: "test1",
			board: {
				width: 10,
				height: 10,
			},
			players: [
				player1,
			],
			winner: "blue",
		});


		const userGames = fromJS([
			game1,
		]);

		const users = fromJS({
			1: user1,
		});

		const wrapper = mount(
			<Provider
				store={store}
			>
				<MemoryRouter>
					<UserGamesList
						onGetUserGames={NO_OP}
						userGames={userGames}
						users={users}
					/>
				</MemoryRouter>
			</Provider>
		);

		const tabLabel = formatMessage(messages.tabs.finished);

		expect(wrapper.find(`Tab[label="${tabLabel}"]`)).toExist();

		expect(wrapper.find("ListItemText")).toHaveLength(1);
		expect(wrapper.find("ListItemText")).toHaveText(game1.get("name"));
	});

	it("should have in progress and finished games lists if there are both", () => {
		const store = mockStore(rootReducer());

		const user1 = fromJS({
			id: "1",
		});

		const player1 = fromJS({
			color: "blue",
			userID: "1",
		});

		const game1 = fromJS({
			name: "test1",
			board: {
				width: 10,
				height: 10,
			},
			players: [
				player1,
			],
			isStarted: false,
		});

		const game2 = fromJS({
			name: "test2",
			board: {
				width: 10,
				height: 10,
			},
			players: [
				player1,
			],
			winner: "blue",
			isStarted: true,
		});


		const userGames = fromJS([
			game1,
			game2,
		]);

		const users = fromJS({
			1: user1,
		});

		const wrapper = mount(
			<Provider
				store={store}
			>
				<MemoryRouter>
					<UserGamesList
						onGetUserGames={NO_OP}
						userGames={userGames}
						users={users}
					/>
				</MemoryRouter>
			</Provider>
		);

		let tabLabel = formatMessage(messages.tabs.inProgress);

		expect(wrapper.find(`Tab[label="${tabLabel}"]`)).toExist();


		tabLabel = formatMessage(messages.tabs.finished);

		expect(wrapper.find(`Tab[label="${tabLabel}"]`)).toExist();

		// Switch to finished games tab
		wrapper.find(`Tab[label="${tabLabel}"]`).simulate("click");

		expect(wrapper.find("ListItemText")).toHaveLength(1);
		expect(wrapper.find("ListItemText")).toHaveText(game2.get("name"));
	});

	it("should render null if the games have not yet loaded", () => {
		const wrapper = mount(
			<MemoryRouter>
				<UserGamesList
					onGetUserGames={NO_OP}
					userGames={null}
					users={fromJS({})}
				/>
			</MemoryRouter>
		);

		expect(wrapper.find("UserGamesList")).toBeEmptyRender();
	});

	it("should show a notification icon if it's your turn", () => {
		const store = mockStore(rootReducer());

		const color = "blue";

		const user1 = fromJS({
			id: "1",
			isMe: true,
		});

		const player1 = fromJS({
			color,
			userID: "1",
		});

		const game1 = fromJS({
			name: "test1",
			board: {
				width: 10,
				height: 10,
			},
			players: [
				player1,
			],
			isStarted: true,
			currentPlayerColor: color,
		});


		const userGames = fromJS([
			game1,
		]);

		const users = fromJS({
			1: user1,
		});

		let wrapper = mount(
			<Provider
				store={store}
			>
				<MemoryRouter>
					<UserGamesList
						onGetUserGames={NO_OP}
						userGames={userGames}
						users={users}
					/>
				</MemoryRouter>
			</Provider>
		);

		expect(wrapper.find(WarningIcon)).toExist();

		// If it's not your turn, the icon should not appear
		wrapper = mount(
			<Provider
				store={store}
			>
				<MemoryRouter>
					<UserGamesList
						onGetUserGames={NO_OP}
						userGames={userGames.setIn(
							[
								0,
								"currentPlayerColor",
							],
							"red",
						)}
						users={users}
					/>
				</MemoryRouter>
			</Provider>
		);

		expect(wrapper.find(WarningIcon)).not.toExist();
	});

	it("should show a notification icon if the game is not yet started", () => {
		const store = mockStore(rootReducer());

		const color = "blue";

		const user1 = fromJS({
			id: "1",
			isMe: true,
		});

		const player1 = fromJS({
			color,
			userID: "1",
		});

		const game1 = fromJS({
			name: "test1",
			board: {
				width: 10,
				height: 10,
			},
			players: [
				player1,
			],
			isStarted: false,
		});


		const userGames = fromJS([
			game1,
		]);

		const users = fromJS({
			1: user1,
		});

		let wrapper = mount(
			<Provider
				store={store}
			>
				<MemoryRouter>
					<UserGamesList
						onGetUserGames={NO_OP}
						userGames={userGames}
						users={users}
					/>
				</MemoryRouter>
			</Provider>
		);

		expect(wrapper.find(StopIcon)).toExist();

		// If it's not your turn, the icon should not appear
		wrapper = mount(
			<Provider
				store={store}
			>
				<MemoryRouter>
					<UserGamesList
						onGetUserGames={NO_OP}
						userGames={userGames.mergeIn(
							[
								0,
							],
							fromJS({
								isStarted: true,
								currentPlayerColor: color,
							})
						)}
						users={users}
					/>
				</MemoryRouter>
			</Provider>
		);

		expect(wrapper.find(StopIcon)).not.toExist();
	});

	it("should list started games before non started games", () => {
		const store = mockStore(rootReducer());

		const color = "blue";

		const user1 = fromJS({
			id: "1",
			isMe: true,
		});

		const player1 = fromJS({
			color,
			userID: "1",
		});

		const game1 = fromJS({
			name: "test1",
			board: {
				width: 10,
				height: 10,
			},
			players: [
				player1,
			],
			isStarted: false,
		});

		const game2 = fromJS({
			name: "test2",
			board: {
				width: 10,
				height: 10,
			},
			players: [
				player1,
			],
			isStarted: true,
			currentPlayerColor: color,
		});


		const userGames = fromJS([
			// Intentionally put the not started one first to make sure sorting works
			game1,
			game2,
		]);

		const users = fromJS({
			1: user1,
		});

		let wrapper = mount(
			<Provider
				store={store}
			>
				<MemoryRouter>
					<UserGamesList
						onGetUserGames={NO_OP}
						userGames={userGames}
						users={users}
					/>
				</MemoryRouter>
			</Provider>
		);

		expect(wrapper.find("ListItemText").first()).toHaveText(game2.get("name"));
		expect(wrapper.find("ListItemText").at(1)).toHaveText(game1.get("name"));
	});
});
