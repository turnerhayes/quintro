import React from "react";
import { fromJS } from "immutable";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router";
import _PlayGame from "./index";
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

	it("should disable the start button if there are not enough players", () => {
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

		const overlay = wrapper.find("StartGameOverlay");

		const classes = overlay.prop("classes");

		const startButton = overlay.findWhere((el) => el.is("Button") && el.hasClass(classes.startButton));

		expect(startButton).toBeDisabled();
	});

	it("should show an error instead of the board if there was an error retrieving the game", () => {
		const store = mockStore(state);

		const wrapper = mount(
			<Provider
				store={store}
			>
				<PlayGame
					getGameError={new Error("Could not get game")}
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

		expect(wrapper.find("Board")).not.toExist();
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

		const store = mockStore(
			state.setIn(
				[
					"games",
					"items",
					game.get("name"),
				],
				gameWithPlayers
			)
		);

		const onStartGame = jest.fn();

		const wrapper = mount(
			<MemoryRouter>
				<Provider
					store={store}
				>
					<PlayGame
						game={gameWithPlayers}
						gameName={name}
						onWatchGame={NO_OP}
						onJoinGame={NO_OP}
						onStartGame={onStartGame}
						onPlaceMarble={NO_OP}
						onGetGame={NO_OP}
						onCancelJoin={NO_OP}
						playerUsers={playerUsers}
					/>
				</Provider>
			</MemoryRouter>
		);

		const overlay = wrapper.find("StartGameOverlay");

		const classes = overlay.prop("classes");

		const startButton = overlay.findWhere((el) => el.is("Button") && el.hasClass(classes.startButton));

		expect(startButton).not.toBeDisabled();

		startButton.simulate("click");

		expect(onStartGame).toHaveBeenCalledWith();
	});

	it("should have a winner banner overlay if the game is over", () => {
		const finishedGame = game.set("isStarted", true).set(
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

	it("should call onPlaceMarble when a cell is clicked", () => {
		const store = mockStore(state);

		const onPlaceMarble = jest.fn();

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
					onPlaceMarble={onPlaceMarble}
					onGetGame={NO_OP}
					onCancelJoin={NO_OP}
					playerUsers={playerUsers}
					hasJoinedGame
				/>
			</Provider>
		);

		wrapper.find("Cell").first().simulate("click");

		expect(onPlaceMarble).toHaveBeenCalledWith({
			gameName: game.get("name"),
			position: fromJS([0, 0]),
		});
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
					onPlaceMarble={onPlaceMarble}
					onGetGame={NO_OP}
					onCancelJoin={NO_OP}
					playerUsers={playerUsers}
					hasJoinedGame
				/>
			</Provider>
		);

		wrapper.find("Cell").first().simulate("click");

		expect(onPlaceMarble).not.toHaveBeenCalled();
	});

	it("should not render anything if no game is provided", () => {
		const wrapper = mount(
			<PlayGame
				gameName="testgame"
				onWatchGame={NO_OP}
				onJoinGame={NO_OP}
				onStartGame={NO_OP}
				onPlaceMarble={NO_OP}
				onGetGame={NO_OP}
				onCancelJoin={NO_OP}
				playerUsers={playerUsers}
			/>
		);

		expect(wrapper.find("PlayGame")).toBeEmptyRender();
	});

	// Cannot currently figure out how to set a prop on a nested component in such a way that it
	// will properly execute lifecycle events (e.g. componentDidUpate)
	it.skip("should call onJoinGame when a game prop is set if the user is in the game", () => {
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
				isMe: true,
			},
			2: {},
			3: {},
		});

		const onJoinGame = jest.fn();

		const wrapper = mount(
			<MemoryRouter>
				<PlayGame
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
			</MemoryRouter>
		);

		wrapper.setProps({
			children: React.cloneElement(
				wrapper.prop("children"),
				{
					game: gameWithPlayers
				}
			)
		});

		wrapper.update();

		expect(onJoinGame).toHaveBeenCalled();
	});

	it("should call onJoinGame if the user is in the game when the component is mounted with a game", () => {
		const store = mockStore(state);

		const onJoinGame = jest.fn();

		mount(
			<Provider
				store={store}
			>
				<PlayGame
					game={game}
					gameName={name}
					onWatchGame={NO_OP}
					onJoinGame={onJoinGame}
					onStartGame={NO_OP}
					onPlaceMarble={NO_OP}
					onGetGame={NO_OP}
					onCancelJoin={NO_OP}
					playerUsers={playerUsers}
					isInGame
				/>
			</Provider>
		);

		expect(onJoinGame).toHaveBeenCalledWith({ color: undefined });
	});

	it("should not attempt to join the game if the player is already joined", () => {
		const store = mockStore(state);

		const onJoinGame = jest.fn();

		mount(
			<Provider
				store={store}
			>
				<PlayGame
					game={game}
					gameName={name}
					onWatchGame={NO_OP}
					onJoinGame={onJoinGame}
					onStartGame={NO_OP}
					onPlaceMarble={NO_OP}
					onGetGame={NO_OP}
					onCancelJoin={NO_OP}
					playerUsers={playerUsers}
					isInGame
					hasJoinedGame
				/>
			</Provider>
		);

		expect(onJoinGame).not.toHaveBeenCalled();
	});

	it("should join the game when the GameJoinDialog join button is clicked", () => {
		const store = mockStore(state);

		const onJoinGame = jest.fn();

		const wrapper = mount(
			<Provider
				store={store}
			>
				<PlayGame
					game={game}
					gameName={name}
					onWatchGame={NO_OP}
					onJoinGame={onJoinGame}
					onStartGame={NO_OP}
					onPlaceMarble={NO_OP}
					onGetGame={NO_OP}
					onCancelJoin={NO_OP}
					playerUsers={playerUsers}
				/>
			</Provider>
		);

		wrapper.find("GameJoinDialog form").simulate("submit");

		expect(onJoinGame).toHaveBeenCalled();
	});

	it("should cancel joining when the GameJoinDialog cancel button is clicked", () => {
		const store = mockStore(state);

		const onCancelJoin = jest.fn();

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
					onCancelJoin={onCancelJoin}
					playerUsers={playerUsers}
				/>
			</Provider>
		);

		wrapper.find("GameJoinDialog Button.cancel-button").simulate("click");

		expect(onCancelJoin).toHaveBeenCalled();
	});

	it("should show a summary of people watching the game", () => {
		const store = mockStore(state);

		const watcherCount = 3;

		let wrapper = mount(
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
					watcherCount={watcherCount}
				/>
			</Provider>
		);

		expect(wrapper.find(`Badge[badgeContent=${watcherCount}]`)).toExist();
		
		wrapper = mount(
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
					watcherCount={watcherCount}
					isWatchingGame
				/>
			</Provider>
		);

		expect(wrapper.find(`Badge[badgeContent=${watcherCount}]`)).toExist();
	});
});
