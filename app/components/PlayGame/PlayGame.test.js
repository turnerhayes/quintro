import React from "react";
import PropTypes from "prop-types";
import { fromJS, Map } from "immutable";
import { shallow, mount } from "enzyme";
import { intlShape } from "react-intl";
import { MemoryRouter } from "react-router-dom";
import Button from "@material-ui/core/Button";
import Badge from "@material-ui/core/Badge";
import TextField from "@material-ui/core/TextField";
import Popover from "@material-ui/core/Popover";
import Backdrop from "@material-ui/core/Backdrop";

import BoardRecord from "@shared-lib/board";

import { intl, mockStore } from "@app/utils/test-utils";
import createReducer from "@app/reducers";
import selectors from "@app/selectors";
import { fetchedGame } from "@app/actions/games";
import Cell from "@app/components/Board/Cell";
import ZoomControls from "@app/components/Board/ZoomControls";
import GameJoinDialog from "@app/components/GameJoinDialog";
import PlayerIndicators from "@app/components/PlayerIndicators";

import { Unwrapped as PlayGame } from "./PlayGame";
import StartGameOverlay from "./StartGameOverlay";
import WinnerBanner from "./WinnerBanner";

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
				{...getProps({
					game: gameWithPlayers,
					gameName: name,
					onStartGame,
					playerUsers,
				})}
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
				{...getProps({
					game: finishedGame,
					gameName: name,
				})}
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
					{...getProps({
						game,
						gameName: name,
						onPlaceMarble,
						hasJoinedGame: true,
					})}
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

			const wrapper = shallow(
				<PlayGame
					{...getProps({
						game,
						gameName: name,
						onPlaceMarble,
						hasJoinedGame: true
					})}
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
				{...getProps({
					gameName: "testgame",
				})}
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
			color: undefined,
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

		expect(onJoinGame).toHaveBeenCalledWith({ color: undefined });
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
				id: "quintro.components.PlayGame.watchers.summary.withoutYou"
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
				id: "quintro.components.PlayGame.watchers.summary.withYou"
			},
			{
				watcherCount: watcherCount - 1,
			}
		);
	});

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
			(
				<MemoryRouter>
					<PlayGame
						{...getProps({
							game,
							gameName,
							playerUsers,
							isInGame: true,
						})}
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

		const playerIndicators = wrapper.find("PlayerIndicators");

		const indicatorClasses = playerIndicators.prop("classes");

		const firstIndicator = playerIndicators.find(`.${indicatorClasses.item}`).first();

		firstIndicator.simulate("click", {
			target: firstIndicator.getDOMNode(),
		});

		expect(wrapper.find(Popover)).toHaveProp("open", true);
		wrapper.find(Backdrop).simulate("click");
		expect(wrapper.find(Popover)).toHaveProp("open", false);
	});
});
