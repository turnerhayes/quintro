import React from "react";
import { fromJS, Map } from "immutable";
import { shallow } from "enzyme";
import Button from "material-ui/Button";
import Badge from "material-ui/Badge";

import { intl, mockStore } from "@app/utils/test-utils";
import Cell from "@app/components/Board/Cell";

import { Unwrapped as PlayGame } from "./PlayGame";
import StartGameOverlay from "./StartGameOverlay";
import WinnerBanner from "./WinnerBanner";
import GameJoinDialog from "@app/components/GameJoinDialog";

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

	it("should have a start button overlay if the game is not started", () => {
		const wrapper = shallow(
			<PlayGame
				intl={intl}
				game={game}
				gameName={name}
				onWatchGame={NO_OP}
				onJoinGame={NO_OP}
				onStartGame={NO_OP}
				onPlaceMarble={NO_OP}
				onGetGame={NO_OP}
				onCancelJoin={NO_OP}
				playerUsers={Map()}
				classes={{}}
			/>
		);

		expect(wrapper.find(StartGameOverlay)).toExist();
	});

	it("should disable the start button if there are not enough players", () => {
		const wrapper = shallow(
			<PlayGame
				intl={intl}
				game={game}
				gameName={name}
				onWatchGame={NO_OP}
				onJoinGame={NO_OP}
				onStartGame={NO_OP}
				onPlaceMarble={NO_OP}
				onGetGame={NO_OP}
				onCancelJoin={NO_OP}
				playerUsers={Map()}
				classes={{}}
			/>
		).find(StartGameOverlay).shallow();

		const classes = wrapper.prop("classes");

		const startButton = wrapper.shallow().findWhere(
			(el) => el.is(Button) && el.hasClass(classes.startButton)
		);

		expect(startButton).toBeDisabled();
	});

	it("should call onStartGame when the start button is clicked", () => {
		const gameWithPlayers = game.set(
			"players",
			fromJS([
				{
					color: "blue",
					userID: "1",
				},
				{
					color: "red",
					userID: "2",
				},
				{
					color: "green",
					userID: "3",
				},
			])
		);

		const playerUsers = fromJS({
			1: {},
			2: {},
			3: {},
		});

		const onStartGame = jest.fn();

		const wrapper = shallow(
			<PlayGame
				intl={intl}
				game={gameWithPlayers}
				gameName={name}
				onWatchGame={NO_OP}
				onJoinGame={NO_OP}
				onStartGame={onStartGame}
				onPlaceMarble={NO_OP}
				onGetGame={NO_OP}
				onCancelJoin={NO_OP}
				playerUsers={playerUsers}
				classes={{}}
			/>
		).find(StartGameOverlay).shallow();

		const classes = wrapper.prop("classes");

		const startButton = wrapper.shallow().findWhere((el) => el.is(Button) && el.hasClass(classes.startButton));

		expect(startButton).not.toBeDisabled();

		startButton.simulate("click");

		expect(onStartGame).toHaveBeenCalledWith();
	});

	it("should have a winner banner overlay if the game is over", () => {
		const finishedGame = game.set("isStarted", true).set(
			"winner",
			"green"
		);

		const wrapper = shallow(
			<PlayGame
				intl={intl}
				game={finishedGame}
				gameName={name}
				onWatchGame={NO_OP}
				onJoinGame={NO_OP}
				onStartGame={NO_OP}
				onPlaceMarble={NO_OP}
				onGetGame={NO_OP}
				onCancelJoin={NO_OP}
				playerUsers={Map()}
				classes={{}}
			/>
		);

		expect(wrapper.find(WinnerBanner)).toExist();
	});

	describe("onPlaceMarble", () => {
		const state = fromJS({
			games: {
				items: {
					[name]: game,
				},
			},
		});

		it("should call onPlaceMarble when a cell is clicked", () => {
			const store = mockStore(state);

			const onPlaceMarble = jest.fn();

			const wrapper = shallow(
				<PlayGame
					intl={intl}
					game={game}
					gameName={name}
					onWatchGame={NO_OP}
					onJoinGame={NO_OP}
					onStartGame={NO_OP}
					onPlaceMarble={onPlaceMarble}
					onGetGame={NO_OP}
					onCancelJoin={NO_OP}
					playerUsers={Map()}
					hasJoinedGame
					classes={{}}
				/>
			).find("BoardContainer").shallow({
				context: {
					store,
				},
			}).shallow().shallow();

			const cell = {
				gameName: game.get("name"),
				position: fromJS([0, 0]),
			};

			const firstCell = wrapper.find(Cell).first();

			firstCell.simulate("click", {
				cell: firstCell.prop("cell"),
			});

			expect(onPlaceMarble).toHaveBeenCalledWith(cell);
		});

		it("should not call onPlaceMarble when an occupied cell is clicked", () => {
			const store = mockStore(
				state.setIn(
					[
						"games",
						"items",
						game.get("name"),
						"board",
						"filled",
						0,
					],
					fromJS({
						color: "red",
						position: [0, 0]
					})
				)
			);

			const onPlaceMarble = jest.fn();

			const wrapper = shallow(
				<PlayGame
					intl={intl}
					game={game}
					gameName={name}
					onWatchGame={NO_OP}
					onJoinGame={NO_OP}
					onStartGame={NO_OP}
					onPlaceMarble={onPlaceMarble}
					onGetGame={NO_OP}
					onCancelJoin={NO_OP}
					playerUsers={Map()}
					hasJoinedGame
					classes={{}}
				/>
			).find("BoardContainer").shallow({
				context: {
					store,
				},
			}).shallow().shallow();


			const firstCell = wrapper.find(Cell).first();

			firstCell.simulate("click", {
				cell: firstCell.prop("cell"),
			});

			expect(onPlaceMarble).not.toHaveBeenCalled();
		});
	});

	it("should not render anything if no game is provided", () => {
		const wrapper = shallow(
			<PlayGame
				intl={intl}
				gameName="testgame"
				onWatchGame={NO_OP}
				onJoinGame={NO_OP}
				onStartGame={NO_OP}
				onPlaceMarble={NO_OP}
				onGetGame={NO_OP}
				onCancelJoin={NO_OP}
				playerUsers={Map()}
				classes={{}}
			/>
		);

		expect(wrapper).toBeEmptyRender();
	});

	it("should call onJoinGame when a game prop is set if the user is in the game", () => {
		const gameWithPlayers = game.set(
			"players",
			fromJS([
				{
					color: "blue",
					userID: "1",
				},
				{
					color: "red",
					userID: "2",
				},
				{
					color: "green",
					userID: "3",
				},
			])
		);

		const playerUsers = fromJS({
			1: {
				id: "1",
				isMe: true,
			},
			2: {
				id: "2",
			},
			3: {
				id: "3",
			},
		});

		const onJoinGame = jest.fn();

		const wrapper = shallow(
			<PlayGame
				intl={intl}
				gameName={name}
				onWatchGame={NO_OP}
				onJoinGame={onJoinGame}
				onStartGame={NO_OP}
				onPlaceMarble={NO_OP}
				onGetGame={NO_OP}
				onCancelJoin={NO_OP}
				playerUsers={playerUsers}
				classes={{}}
				isInGame
			/>
		);

		wrapper.setProps({
			game: gameWithPlayers,
		});

		expect(onJoinGame).toHaveBeenCalledWith({
			color: undefined,
		});
	});

	it("should call onJoinGame if the user is in the game when the component is mounted with a game", () => {
		const onJoinGame = jest.fn();

		shallow(
			<PlayGame
				intl={intl}
				game={game}
				gameName={name}
				onWatchGame={NO_OP}
				onJoinGame={onJoinGame}
				onStartGame={NO_OP}
				onPlaceMarble={NO_OP}
				onGetGame={NO_OP}
				onCancelJoin={NO_OP}
				playerUsers={Map()}
				isInGame
				classes={{}}
			/>
		);

		expect(onJoinGame).toHaveBeenCalledWith({ color: undefined });
	});

	it("should not attempt to join the game if the player is already joined", () => {
		const onJoinGame = jest.fn();

		shallow(
			<PlayGame
				intl={intl}
				game={game}
				gameName={name}
				onWatchGame={NO_OP}
				onJoinGame={onJoinGame}
				onStartGame={NO_OP}
				onPlaceMarble={NO_OP}
				onGetGame={NO_OP}
				onCancelJoin={NO_OP}
				playerUsers={Map()}
				isInGame
				hasJoinedGame
				classes={{}}
			/>
		);

		expect(onJoinGame).not.toHaveBeenCalled();
	});

	it("should join the game when the GameJoinDialog join button is clicked", () => {
		const onJoinGame = jest.fn();

		const wrapper = shallow(
			<PlayGame
				intl={intl}
				game={game}
				gameName={name}
				onWatchGame={NO_OP}
				onJoinGame={onJoinGame}
				onStartGame={NO_OP}
				onPlaceMarble={NO_OP}
				onGetGame={NO_OP}
				onCancelJoin={NO_OP}
				playerUsers={Map()}
				classes={{}}
			/>
		).shallow().find(GameJoinDialog).shallow({
			context: {
				intl,
			},
		}).shallow().shallow();

		wrapper.find("form").simulate("submit", { preventDefault() {} });

		expect(onJoinGame).toHaveBeenCalled();
	});

	it("should cancel joining when the GameJoinDialog cancel button is clicked", () => {
		const onCancelJoin = jest.fn();

		const wrapper = shallow(
			<PlayGame
				intl={intl}
				game={game}
				gameName={name}
				onWatchGame={NO_OP}
				onJoinGame={NO_OP}
				onStartGame={NO_OP}
				onPlaceMarble={NO_OP}
				onGetGame={NO_OP}
				onCancelJoin={onCancelJoin}
				playerUsers={Map()}
				classes={{}}
			/>
		).find(GameJoinDialog).shallow({
			context: {
				intl,
			},
		}).shallow().shallow();

		wrapper.find(Button).filter(".cancel-button").simulate("click");

		expect(onCancelJoin).toHaveBeenCalled();
	});

	it("should show a summary of people watching the game", () => {
		const watcherCount = 3;

		const wrapper = shallow(
			<PlayGame
				intl={intl}
				game={game}
				gameName={name}
				onWatchGame={NO_OP}
				onJoinGame={NO_OP}
				onStartGame={NO_OP}
				onPlaceMarble={NO_OP}
				onGetGame={NO_OP}
				onCancelJoin={NO_OP}
				playerUsers={Map()}
				watcherCount={watcherCount}
				classes={{}}
			/>
		);

		expect(wrapper.find(Badge).filter(`[badgeContent=${watcherCount}]`)).toExist();
	});
});
