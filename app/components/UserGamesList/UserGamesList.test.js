import React from "react";
import PropTypes from "prop-types";
import { fromJS } from "immutable";
import { shallow, mount } from "enzyme";
import { MemoryRouter } from "react-router";
import { intlShape } from "react-intl";
import Tab from "@material-ui/core/Tab";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import WarningIcon from "@material-ui/icons/Warning";
import StopIcon from "@material-ui/icons/Stop";

import { Unwrapped as UserGamesList } from "./UserGamesList";
import messages from "./messages";
import { intl, formatMessage, mockStore } from "@app/utils/test-utils";

const NO_OP = () => {};

describe("UserGamesList component", () => {
	it("should have only in progress games list if there are no finished games", () => {
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

		const wrapper = shallow(
			<UserGamesList
				onGetUserGames={NO_OP}
				userGames={userGames}
				users={users}
				classes={{}}
				intl={intl}
			/>
		);


		const tabLabel = formatMessage(messages.tabs.inProgress);

		expect(wrapper.find(Tab).filter(`[label="${tabLabel}"]`)).toExist();

		expect(wrapper.find(ListItemText)).toHaveLength(1);

		expect(
			wrapper.find(ListItemText)
				.shallow()
				.shallow()
				.find(Typography)
				.children()
		).toHaveText(game1.get("name"));
	});

	it("should have only finished games list if there are no in progress games", () => {
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

		const wrapper = shallow(
			<UserGamesList
				onGetUserGames={NO_OP}
				userGames={userGames}
				users={users}
				classes={{}}
				intl={intl}
			/>
		);

		const tabLabel = formatMessage(messages.tabs.finished);

		expect(wrapper.find(Tab).filter(`[label="${tabLabel}"]`)).toExist();

		expect(wrapper.find(ListItemText)).toHaveLength(1);

		expect(
			wrapper.find(ListItemText)
				.shallow()
				.shallow()
				.find(Typography)
				.children()
		).toHaveText(game1.get("name"));
	});

	it("should have in progress and finished games lists if there are both", () => {
		const store = mockStore();

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
			(
				<MemoryRouter>
					<UserGamesList
						onGetUserGames={NO_OP}
						userGames={userGames}
						users={users}
						classes={{}}
						intl={intl}
					/>
				</MemoryRouter>
			),
			{
				context: {
					intl,
					store,
				},

				childContextTypes: {
					intl: intlShape,
					store: PropTypes.object,
				},
			}
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
		const wrapper = shallow(
			<UserGamesList
				onGetUserGames={NO_OP}
				userGames={null}
				users={fromJS({})}
				classes={{}}
				intl={intl}
			/>
		);

		expect(wrapper).toBeEmptyRender();
	});

	it("should show a notification icon if it's your turn", () => {
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

		let wrapper = shallow(
			<UserGamesList
				onGetUserGames={NO_OP}
				userGames={userGames}
				users={users}
				classes={{}}
				intl={intl}
			/>
		);

		expect(wrapper.find(WarningIcon)).toExist();

		// If it's not your turn, the icon should not appear
		wrapper = shallow(
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
				classes={{}}
				intl={intl}
			/>
		);

		expect(wrapper.find(WarningIcon)).not.toExist();
	});

	it("should show a notification icon if the game is not yet started", () => {
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

		let wrapper = shallow(
			<UserGamesList
				onGetUserGames={NO_OP}
				userGames={userGames}
				users={users}
				classes={{}}
				intl={intl}
			/>
		);

		expect(wrapper.find(StopIcon)).toExist();

		// If it's not your turn, the icon should not appear
		wrapper = shallow(
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
				classes={{}}
				intl={intl}
			/>
		);

		expect(wrapper.find(StopIcon)).not.toExist();
	});

	it("should list started games before non started games", () => {
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

		let wrapper = shallow(
			<UserGamesList
				onGetUserGames={NO_OP}
				userGames={userGames}
				users={users}
				classes={{}}
				intl={intl}
			/>
		);


		expect(
			wrapper.find(ListItemText)
				.first()
				.shallow()
				.shallow()
				.find(Typography)
				.children()
		).toHaveText(game2.get("name"));

		expect(
			wrapper.find(ListItemText)
				.at(1)
				.shallow()
				.shallow()
				.find(Typography)
				.children()
		).toHaveText(game1.get("name"));
	});
});
