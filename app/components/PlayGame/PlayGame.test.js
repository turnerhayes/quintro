import React from "react";
import { fromJS, Map, Set } from "immutable";
import { shallow, mount } from "enzyme";
import Button from "@material-ui/core/Button";
import Badge from "@material-ui/core/Badge";
import TextField from "@material-ui/core/TextField";
import Popover from "@material-ui/core/Popover";
import SimpleBackdrop from "@material-ui/core/Modal/SimpleBackdrop";

import BoardRecord from "@shared-lib/board";

import { intl, mockStore, wrapWithProviders } from "@app/utils/test-utils";
import createReducer from "@app/reducers";
import selectors from "@app/selectors";
import { fetchedGame, addPlayers, gameStarted, setMarble } from "@app/actions";
import Cell from "@app/components/Board/Cell";
import ZoomControls from "@app/components/Board/ZoomControls";
import GameJoinDialog from "@app/components/GameJoinDialog";
import PlayerIndicators from "@app/components/PlayerIndicators";

import { Unwrapped as PlayGame } from "./PlayGame";
import StartGameOverlay from "./StartGameOverlay";
import WinnerBanner from "./WinnerBanner";
// import AddPlayerButton from "@app/components/AddPlayerButton";

const NO_OP = () => {};

function getProps({
	game,
	gameName,
	onWatchGame = NO_OP,
	onJoinGame = NO_OP,
	onStartGame = NO_OP,
	onPlaceMarble = NO_OP,
	onGetGame = NO_OP,
	onCancelJoin = NO_OP,
	currentUserPlayers = Set(),
	onZoomLevelChange = NO_OP,
	watcherCount,
	hasJoinedGame,
	isWatchingGame,
	isInGame,
	playerUsers = Map(),
	classes = {},
} = {}) {
	return {
		game,
		gameName,
		onWatchGame,
		onJoinGame,
		onStartGame,
		onPlaceMarble,
		onGetGame,
		onCancelJoin,
		currentUserPlayers,
		onZoomLevelChange,
		watcherCount,
		hasJoinedGame,
		isWatchingGame,
		isInGame,
		playerUsers,
		classes,
		intl,
	};
}

describe("PlayGame component", () => {
	const name = "test";

	const game = fromJS({
		name,
		playerLimit: 3,
		players: [],
		board: new BoardRecord({
			width: 10,
			height: 10,
			filledCells: [],
		}),
	});

	it("should have a start button overlay if the game is not started", () => {
		const wrapper = shallow(
			<PlayGame
				{...getProps({
					game,
					gameName: name,
				})}
			/>
		);

		expect(wrapper.find(StartGameOverlay)).toExist();
	});

	it("should disable the start button if there are not enough players", () => {
		const wrapper = shallow(
			<PlayGame
				{...getProps({
					game,
					gameName: name,
				})}
			/>
		).find(StartGameOverlay).shallow();

		const classes = wrapper.prop("classes");

		const startButton = wrapper.shallow().findWhere(
			(el) => el.is(Button) && el.hasClass(classes.startButton)
		);

		expect(startButton).toBeDisabled();
	});

	it("should call onStartGame when the start button is clicked", () => {
		const reducer = createReducer();
		
		const state = reducer(undefined, fetchedGame({
			game: game.set(
				"players",
				fromJS([
					{
						color: "blue",
						user: {
							id: "1",
						},
					},
					{
						color: "red",
						user: {
							id: "2",
						},
					},
					{
						color: "green",
						user: {
							id: "3",
						},
					},
				])
			),
		}));

		const gameWithPlayers = selectors.games.getGame(
			state,
			{
				gameName: game.get("name"),
			}
		);

		const playerUsers = selectors.games.getPlayerUsers(
			state,
			{
				gameName: game.get("name"),
			}
		);

		const store = mockStore(state);

		const onStartGame = jest.fn();

		const wrapper = mount(
			wrapWithProviders(
				(
					<PlayGame
						{...getProps({
							game: gameWithPlayers,
							gameName: name,
							onStartGame,
							playerUsers,
						})}
					/>
				),
				{
					store,
				}
			)
		).find("StartGameOverlay");

		const classes = wrapper.prop("classes");

		const startButton = wrapper.findWhere(
			(el) => el.is(Button) && el.hasClass(classes.startButton)
		);

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
				{...getProps({
					game: finishedGame,
					gameName: name,
				})}
			/>
		);

		expect(wrapper.find(WinnerBanner)).toExist();
	});

	describe("onPlaceMarble", () => {
		const reducer = createReducer();
		const state = reducer(undefined, fetchedGame({
			game,
		}));

		it("should call onPlaceMarble when a cell is clicked and the current player is one of the user's players", () => {
			const player = fromJS({
				color: "red",
				user: {
					id: "1",
					isMe: true,
				},
				order: 0,
			});

			const stateWithPlayer = [
				addPlayers({
					gameName: name,
					players: [
						player,
					],
				}),

				gameStarted({
					gameName: name,
				}),
			].reduce(reducer, state);

			const game = selectors.games.getGame(stateWithPlayer, {
				gameName: name,
			});
			
			const currentUserPlayers = selectors.games.getCurrentUserPlayers(
				stateWithPlayer,
				{
					gameName: name,
				}
			);

			const playerUsers = selectors.games.getPlayerUsers(
				stateWithPlayer,
				{
					gameName: name,
				}
			);
			
			const store = mockStore(stateWithPlayer);

			const onPlaceMarble = jest.fn();

			const wrapper = mount(
				wrapWithProviders(
					(
						<PlayGame
							{...getProps({
								game,
								gameName: name,
								onPlaceMarble,
								hasJoinedGame: true,
								currentUserPlayers,
								playerUsers,
							})}
						/>
					),
					{
						store,
					}
				)
			).find("BoardContainer");

			const firstCell = wrapper.find(Cell).first();

			firstCell.simulate("click", {
				cell: firstCell.prop("cell"),
			});

			expect(onPlaceMarble).toHaveBeenCalledWith({
				gameName: name,
				position: fromJS([0, 0]),
				color: player.get("color"),
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
						"filledCells",
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
				wrapWithProviders(
					(
						<PlayGame
							{...getProps({
								game,
								gameName: name,
								onPlaceMarble,
								hasJoinedGame: true
							})}
						/>
					),
					{
						store,
					}
				)
			).find("BoardContainer");


			const firstCell = wrapper.find(Cell).first();

			firstCell.simulate("click", {
				cell: firstCell.prop("cell"),
			});

			expect(onPlaceMarble).not.toHaveBeenCalled();
		});

		it("should not call onPlaceMarble when the current player is not one of the user's players", () => {
			const newState = [
				addPlayers({
					gameName: game.get("name"),
					players: fromJS([
						{
							order: 0,
							color: "red",
							user: {
								id: "1",
								isMe: true,
							},
						},
						{
							order: 1,
							color: "blue",
							user: {
								id: "2",
								isMe: false,
							},
						},

						{
							order: 2,
							color: "green",
							user: {
								id: "1",
								isMe: true,
							},
						},
					])
				}),

				setMarble({
					gameName: game.get("name"),
					// eslint-disable-next-line no-magic-numbers
					position: [7, 7],
					color: "red",
				}),

				gameStarted({
					gameName: game.get("name"),
				}),
			].reduce(reducer, state);

			const modifiedGame = selectors.games.getGame(newState, { gameName: game.get("name") });

			const store = mockStore(newState);

			const onPlaceMarble = jest.fn();

			const currentUserPlayers = selectors.games.getCurrentUserPlayers(
				newState,
				{
					gameName: game.get("name"),
				}
			);

			const playerUsers = selectors.games.getPlayerUsers(
				newState,
				{
					gameName: game.get("name"),
				}
			);

			const wrapper = mount(
				wrapWithProviders(
					(
						<PlayGame
							{...getProps({
								game: modifiedGame,
								gameName: name,
								onPlaceMarble,
								hasJoinedGame: true,
								currentUserPlayers,
								playerUsers,
								isInGame: true,
							})}
						/>
					),
					{
						store,
					}
				)
			).find("BoardContainer");


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
				{...getProps({
					gameName: "testgame",
				})}
			/>
		);

		expect(wrapper).toBeEmptyRender();
	});

	it("should call onJoinGame when a game prop is set if the user is in the game", () => {
		const firstColor = "blue";

		const gameWithPlayers = game.set(
			"players",
			fromJS([
				{
					color: firstColor,
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
				{...getProps({
					gameName: name,
					onJoinGame,
					playerUsers,
					isInGame: true,
				})}
			/>
		);

		wrapper.setProps({
			game: gameWithPlayers,
		});

		expect(onJoinGame).toHaveBeenCalledWith({
			colors: Set.of(firstColor),
		});
	});

	it("should call onJoinGame if the user is in the game when the component is mounted with a game", () => {
		const onJoinGame = jest.fn();

		shallow(
			<PlayGame
				{...getProps({
					game,
					gameName: name,
					onJoinGame,
					isInGame: true,
				})}
			/>
		);

		expect(onJoinGame).toHaveBeenCalledWith({ colors: Set() });
	});

	it("should not attempt to join the game if the player is already joined", () => {
		const onJoinGame = jest.fn();

		shallow(
			<PlayGame
				{...getProps({
					game,
					gameName: name,
					onJoinGame,
					isInGame: true,
					hasJoinedGame: true,
				})}
			/>
		);

		expect(onJoinGame).not.toHaveBeenCalled();
	});

	it("should join the game when the GameJoinDialog join button is clicked", () => {
		const onJoinGame = jest.fn();

		const wrapper = shallow(
			<PlayGame
				{...getProps({
					game,
					gameName: name,
					onJoinGame,
				})}
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
				{...getProps({
					game,
					gameName: name,
					onCancelJoin,
				})}
			/>
		).find(GameJoinDialog).shallow({
			context: {
				intl,
			},
		}).shallow().shallow();

		wrapper.find(Button).filter(".cancel-button").simulate("click");

		expect(onCancelJoin).toHaveBeenCalled();
	});

	it("should change the zoom level when the zoom control is used", () => {
		const onZoomLevelChange = jest.fn().mockName("mock_onZoomLevelChange");

		const zoomLevel = 0.8;

		const wrapper = shallow(
			<PlayGame
				{...getProps({
					game,
					gameName: name,
					onZoomLevelChange,
				})}
			/>
		).find(ZoomControls).shallow({
			context: {
				intl,
			},
		}).shallow();

		wrapper.find(TextField).simulate("change", { target: { valueAsNumber: zoomLevel }});

		expect(onZoomLevelChange).toHaveBeenCalledWith(zoomLevel);
	});

	it("should show a summary of people watching the game", () => {
		const watcherCount = 3;

		jest.spyOn(intl, "formatMessage");

		let wrapper = shallow(
			<PlayGame
				{...getProps({
					game,
					gameName: name,
					watcherCount,
				})}
			/>
		);

		expect(wrapper.find(Badge).filter(`[badgeContent=${watcherCount}]`)).toExist();
		expect(intl.formatMessage).toHaveBeenCalledWith(
			{
				id: "quintro.components.PlayGame.watchersWithoutYouSummary"
			},
			{
				watcherCount,
			}
		);

		// if current player is watching the game, shows a different message
		wrapper = shallow(
			<PlayGame
				{...getProps({
					game,
					gameName: name,
					watcherCount,
					isWatchingGame: true,
				})}
			/>
		);

		expect(wrapper.find(Badge).filter(`[badgeContent=${watcherCount}]`)).toExist();
		expect(intl.formatMessage).toHaveBeenCalledWith(
			{
				id: "quintro.components.PlayGame.watchersWithYouSummary"
			},
			{
				watcherCount: watcherCount - 1,
			}
		);
	});

	describe("Player indicators", () => {
		it("should show a user information popover on clicking an indicator", () => {
			const gameName = "testgame";
	
			const game = fromJS({
				name: gameName,
				board: new BoardRecord({
					width: 10,
					height: 10,
					filledCells: [],
				}),
				players: [
					{
						color: "blue",
						userID: "1",
					},
				],
				playerLimit: 3,
			});
	
			const users = fromJS({
				1: {
					id: "1",
					name: {},
				},
			});
	
			const actions = [
				fetchedGame({
					game: game.setIn(
						[
							"players",
							0,
							"user",
						],
						users.get("1"),
					).deleteIn([
						"players",
						0,
						"userID",
					]),
				}),
			];
	
			const reducer = createReducer();
	
			const state = actions.reduce(reducer, undefined);
			
			const playerUsers = selectors.games.getPlayerUsers(state, { gameName });
	
			const store = mockStore(state);
	
			const wrapper = shallow(
				<PlayGame
					{...getProps({
						game,
						gameName,
						playerUsers,
					})}
				/>
			);
	
			let playerIndicators = wrapper.find(PlayerIndicators).shallow({
				context: {
					intl,
					store,
				},
			}).shallow();
	
			const indicatorClasses = playerIndicators.prop("classes");
			playerIndicators = playerIndicators.shallow();
	
			const firstIndicator = playerIndicators.find(`.${indicatorClasses.item}`).first();
	
			firstIndicator.simulate("click", {
				target: firstIndicator,
			});
	
			expect(wrapper.find(Popover)).toHaveProp("open", true);
		});

		it("should not show a popup when clicking an empty indicator", () => {
			const gameName = "testgame";
	
			const game = fromJS({
				name: gameName,
				board: new BoardRecord({
					width: 10,
					height: 10,
				}),
				players: [
					{
						color: "blue",
						user: {
							id: "1",
						},
					},
				],
				playerLimit: 3,
			});
	
			const actions = [
				fetchedGame({
					game,
				}),
			];
	
			const reducer = createReducer();
	
			const state = actions.reduce(reducer, undefined);
			
			const playerUsers = selectors.games.getPlayerUsers(state, { gameName });
	
			const store = mockStore(state);
	
			const wrapper = shallow(
				<PlayGame
					{...getProps({
						game: selectors.games.getGame(state, { gameName }),
						gameName,
						playerUsers,
					})}
				/>
			);
	
			let playerIndicators = wrapper.find(PlayerIndicators).shallow({
				context: {
					intl,
					store,
				},
			}).shallow();
	
			const indicatorClasses = playerIndicators.prop("classes");
			playerIndicators = playerIndicators.shallow();
	
			const secondIndicator = playerIndicators.find(`.${indicatorClasses.item}`).at(1);
	
			secondIndicator.simulate("click", {
				target: secondIndicator,
			});
	
			expect(wrapper.find(Popover)).toHaveProp("open", false);
		});
	
		it("should close the user information popover when clicking outside", () => {
			const gameName = "testgame";
	
			const game = fromJS({
				name: gameName,
				board: new BoardRecord({
					width: 10,
					height: 10,
					filledCells: [],
				}),
				players: [
					{
						color: "blue",
						userID: "1",
					},
				],
				playerLimit: 3,
				isStarted: true,
			});
	
			const users = fromJS({
				1: {
					id: "1",
					name: {},
					isMe: true,
				},
			});
	
			const actions = [
				fetchedGame({
					game: game.setIn(
						[
							"players",
							0,
							"user",
						],
						users.get("1"),
					).deleteIn([
						"players",
						0,
						"userID",
					]),
				}),
			];
	
			const reducer = createReducer();
	
			const state = actions.reduce(reducer, undefined);
			
			const playerUsers = selectors.games.getPlayerUsers(state, { gameName });
	
			const store = mockStore(state);
	
			// Can't use shallow() because we need access to the Backdrop component, and
			// shallow() rendering doesn't seem to provide access to components in a Portal.
			const wrapper = mount(
				wrapWithProviders(
					(
						<PlayGame
							{...getProps({
								game,
								gameName,
								playerUsers,
								isInGame: true,
							})}
						/>
					),
					{
						store, 
					}
				)
			);
	
			const playerIndicators = wrapper.find("PlayerIndicators");
	
			const indicatorClasses = playerIndicators.prop("classes");
	
			const firstIndicator = playerIndicators.find(`.${indicatorClasses.item}`).first();
			
			firstIndicator.simulate("click");

			let popover = wrapper.find(Popover).findWhere(
				(el) => el.key() === "player indicator popover"
			);

			expect(popover).toHaveProp("open", true);

			wrapper.find(SimpleBackdrop).simulate("click");

			popover = wrapper.find(Popover).findWhere(
				(el) => el.key() === "player indicator popover"
			);

			expect(popover).toHaveProp("open", false);
		});
	});

	describe("add player button", () => {
		it("should add a player on click", () => {
			const gameName = "testgame";

			const onJoinGame = jest.fn().mockName("mock_onJoinGame");
	
			const game = fromJS({
				name: gameName,
				board: new BoardRecord({
					width: 10,
					height: 10,
				}),
				players: [
					{
						color: "blue",
						user: {
							id: "1",
						},
					},
				],
				playerLimit: 3,
			});
	
			const actions = [
				fetchedGame({
					game,
				}),
			];
	
			const reducer = createReducer();
	
			const state = actions.reduce(reducer, undefined);

			const store = mockStore(state);
			
			const playerUsers = selectors.games.getPlayerUsers(state, { gameName });
	
			const wrapper = mount(
				wrapWithProviders(
					(
						<PlayGame
							{...getProps({
								game: selectors.games.getGame(state, { gameName }),
								gameName,
								playerUsers,
								onJoinGame,
							})}
						/>
					),
					{
						store,
					}
				)
			);
				
			const addPlayerButton = wrapper.find("AddPlayerButton");

			const color = addPlayerButton.state("color");

			addPlayerButton.prop("onAdd")({
				color,
			});
			
			expect(onJoinGame).toHaveBeenCalledWith({
				colors: [ color ],
			});
		});
	});
});
