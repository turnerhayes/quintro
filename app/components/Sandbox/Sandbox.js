import React from "react";
import PropTypes from "prop-types";
import {
	fromJS,
	Map,
	is
} from "immutable";
import classnames from "classnames";
import localForage from "localforage";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Switch from "@material-ui/core/Switch";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import IconButton from "@material-ui/core/IconButton";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import EditIcon from "@material-ui/icons/Edit";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/Save";
import RestoreIcon from "@material-ui/icons/Restore";
import DeleteIcon from "@material-ui/icons/Delete";
import CloseIcon from "@material-ui/icons/Close";
import NotShowingMoveListIcon from "@material-ui/icons/ViewList";
import ShowingMoveListIcon from "@material-ui/icons/ViewListOutlined";

import Board from "@app/components/Board";
import PlayerIndicators from "@app/components/PlayerIndicators";
import ColorPicker from "@app/components/ColorPicker";
import {
	DimensionInput,
	PlayerLimitInput
} from "@app/components/GameFormControls";
import BoardRecord from "@shared-lib/board";
import gameSelectors from "@app/selectors/games/game";
import Config from "@app/config";

import MoveList from "./MoveList";

import "@fonts/icomoon/style.css";


function filterPlayerIndicatorColorsForGame({ id }, game) {
	return !game.get("players").map((player) => player.get("color")).includes(id);
}

function getDefaultColorPickerColorForGame({ game }) {
	const colors = Config.game.colors.filter(
		({ id }) => filterPlayerIndicatorColorsForGame({ id }, game)
	);

	return colors.length > 0 ? colors[0].id : undefined;
}

const STORAGE_KEY = "SANDBOX_game";

const styles = (theme) => ({
	root: {
		display: "flex",
		flexDirection: "column",
		height: "100%",
	},

	dimensionSeparator: {
		margin: "0 0.5em",
		verticalAlign: "bottom",
	},

	boardContainer: {
		display: "flex",
		flex: 1,
		// eslint-disable-next-line no-magic-numbers
		padding: theme.spacing.unit * 2,
	},

	board: {
		flex: 1,
		overflow: "auto",
	},

	// Icomoon icons are off center in Material UI 
	icomoonIcon: {
		transform: "translate(-50%)",
	},

	moveList: {
		minWidth: "20%",
	},

	playerControls: {
		display: "flex",
		flexDirection: "row",
		flexWrap: "wrap",
	},

	playerControlsHeader: {
		width: "100%",
		display: "flex",
	},

	playerLimitInput: {
		width: "100%",
	},

	addRemovePlayerContainer: {
		display: "flex",
		flexDirection: "column",
	},

	hiddenAddPlayerButton: {
		visibility: "hidden",
	},

	gameControlsContainer: {
		position: "relative",
		display: "flex",
		flexDirection: "column",
	},

	gameControls: {
		display: "flex",
		flexDirection: "row",
	},

	gamePersistenceControlsContainer: {
		flex: 1,
	},

	resetGameButton: {
		position: "absolute",
		right: 0,
		top: 0,
	},

	speedDial: {
		position: "absolute",
		// eslint-disable-next-line no-magic-numbers
		right: theme.spacing.unit * 2,
		// eslint-disable-next-line no-magic-numbers
		bottom: theme.spacing.unit * 2,
	},

	speedDialIcon: {
		verticalAlign: "auto",
	},
});

const emptyGame = fromJS({
	board: new BoardRecord({
		width: Config.game.board.width.min,
		height: Config.game.board.height.min,
		filledCells: [],
	}),

	players: [],

	playerLimit: 6,

	playerPresence: {},

	isStarted: true,
});

class Sandbox extends React.PureComponent {
	static propTypes = {
		classes: PropTypes.object.isRequired,
	}
	
	state = {
		game: emptyGame,

		users: Map(),

		storedGame: null,

		keepRatio: true,

		newPlayerColor: null,

		contextMenuAnchorEl: null,
		
		contextMenuPlayerIndex: null,

		submenuAnchorEl: null,
		
		isSpeedDialOpen: false,

		shouldShowMoveList: false,

		shouldShowGameControls: false,
	}

	static getDerivedStateFromProps(props, state) {
		if (state.newPlayerColor === null) {
			return {
				newPlayerColor: getDefaultColorPickerColorForGame({ game: state.game })
			};
		}

		return null;
	}

	constructor(...args) {
		super(...args);

		this.getStoredGame().then(
			(game) => game && this.setState({
				storedGame: game,
			})
		);

		this.state.newPlayerColor = this.getDefaultColorPickerColor();
	}
	
	handleDimensionChange = ({ width, height }) => {
		const dimensions = {};

		if (width !== undefined) {
			dimensions.width = width;
		}

		if (height !== undefined) {
			dimensions.height = height;
		}

		this.setState((prevState) => {
			let game = prevState.game.mergeIn(["board"], dimensions);

			const firstMoveIndex = game.getIn(["board", "filledCells"]).findIndex(
				(cell) => cell.getIn(["position", 0]) >= width ||
					cell.getIn(["position", 1]) >= height
			);

			if (firstMoveIndex >= 0) {
				game = this.sliceFilledCells({
					index: firstMoveIndex,
					game,
				});
			}

			return {
				game,
			}; 
		});
	}
	
	handleWidthChange = ({ value }) => {
		const width = Number(value);
		let height;

		if (!Number.isNaN(width)) {
			if (this.state.keepRatio) {
				const diff = width - this.state.game.getIn(["board", "width"]);
				
				height = this.state.game.getIn(["board", "height"]) + diff;
			}

			this.handleDimensionChange({ width, height });
		}
	}
	
	handleHeightChange = ({ value }) => {
		const height = Number(value);
		let width;
		
		if (!Number.isNaN(height)) {
			if (this.state.keepRatio) {
				const diff = height - this.state.game.getIn(["board", "height"]);
				
				width = this.state.game.getIn(["board", "width"]) + diff;
			}

			this.handleDimensionChange({ width, height });
		}
	}

	handlePlayerIndicatorContextMenu = ({ event, index }) => {
		event.preventDefault();

		this.setState({
			contextMenuAnchorEl: event.target,
			contextMenuPlayerIndex: index,
		});
	}

	getCloseContextMenuState = () => {
		return {
			contextMenuAnchorEl: null,
			contextMenuPlayerIndex: null,
			submenuAnchorEl: null,
		};
	}

	handlePlayerIndicatorContextMenuClose = () => {
		this.setState(this.getCloseContextMenuState());
	}

	handleTogglePresenceMenuItemClick = () => {
		this.setState((prevState) => {
			const color = prevState.game.getIn([
				"players",
				this.state.contextMenuPlayerIndex,
				"color",
			]);

			return {
				game: prevState.game.setIn(
					["playerPresence", color],
					!prevState.game.getIn(["playerPresence", color], false)
				),
			};
		});
	}

	handleToggleIsMeMenuItemClick = () => {
		this.setState((prevState) => {
			const userID = prevState.game.getIn(
				"players",
				this.state.contextMenuPlayerIndex,
				"userID",
			);

			return {
				users: prevState.users.setIn(
					[userID, "isMe"],
					!prevState.users.getIn([userID, "isMe"], false)
				),
			};
		});
	}

	handleChangeColorMenuItemClick = (event) => {
		this.setState({
			submenuAnchorEl: event.target,
		});
	}

	handleNewPlayerColorChosen = ({ color }) => {
		this.setState({
			newPlayerColor: color,
		});
	}

	handleAddPlayerButtonClick = () => {
		this.setState((prevState) => {
			const color = prevState.newPlayerColor || this.getDefaultColorPickerColor();
			let game = prevState.game;
			const nextIndex = game.get("players").size;
			const userID = (nextIndex + 1).toString();
			const prevPlayer = game.get("players").last();

			if (prevPlayer) {
				const firstPrevPlayerMarbleIndex = game.getIn(["board", "filledCells"]).findIndex(
					(cell) => cell.get("color") === prevPlayer.get("color")
				);

				if (firstPrevPlayerMarbleIndex >= 0) {
					game = this.sliceFilledCells({
						index: firstPrevPlayerMarbleIndex + 1,
						game,
					});
				}
			}

			game = game.setIn(
				["players", nextIndex],
				fromJS({
					userID,
					color,
				})
			).setIn(
				["playerPresence", color],
				true
			);

			return {
				game,

				users: prevState.users.set(userID, fromJS({
					id: userID,
				})),

				newPlayerColor: null,
			};
		});
	}

	handleRemovePlayerButtonClick = () => {
		this.setState((prevState) => {
			let game = prevState.game;
			const player = game.get("players").last();
			const userID = player.get("userID");

			// eslint-disable-next-line no-magic-numbers
			const prevPlayer = game.get("players").get(-2);

			let endFilledCellIndex = prevPlayer === undefined ?
				0 :
				game.getIn(["board", "filledCells"]).findIndex((cell) => cell.get("color") === player.get("color"));
			
			if (endFilledCellIndex >= 0) {
				game = this.sliceFilledCells({ index: endFilledCellIndex, game });
			}

			game = game.update(
				"players",
				(players) => players.slice(0, -1)
			).update(
				"playerPresence",
				(presence) => presence.delete(player.get("color"))
			).delete("winner");

			return {
				game,

				users: prevState.users.delete(userID),

				newPlayerColor: null,
			};
		});
	}

	handleColorChosen = ({ color }) => {
		this.setState((prevState) => {
			const index = prevState.contextMenuPlayerIndex;
			const currentColor = prevState.game.getIn(["players", index, "color"]);

			return {
				game: prevState.game.setIn(
					["players", index, "color"],
					color
				).setIn(
					["playerPresence", color],
					prevState.game.getIn(["playerPresence", currentColor])
				).updateIn(
					["board", "filledCells"],
					(filledCells) => filledCells.reduce(
						(filledCells, cell, index) => {
							if (cell.get("color") === currentColor) {
								return filledCells.set(index, cell.set("color", color));
							}

							return filledCells;
						},
						filledCells
					)
				).deleteIn(
					["playerPresence", currentColor]
				),
				...this.getCloseContextMenuState(),
			};
		});
	}

	handleCellClick = ({ cell }) => {
		if (
			this.state.game.get("players").isEmpty() ||
			this.state.game.get("winner") || cell.get("color")
		) {
			return;
		}

		
		this.setState((prevState) => {
			let game = prevState.game.update(
				"board",
				(board) => board.fillCells({
					position: cell.get("position"),
					color: gameSelectors.getCurrentPlayerColor(this.state.game),
				})
			);
			
			const quintros = gameSelectors.getQuintros(game);

			if (!quintros.isEmpty()) {
				game = game.set("winner", quintros.first().get("color"));
			}

			return {
				game,
			};
		});
	}

	handleSelectMove = ({ index }) => {
		this.setState((prevState) => {
			if (index !== null && prevState.game.getIn(["board", "filledCells"]).size === index + 1) {
				return undefined;
			}

			return {
				game: this.sliceFilledCells({
					index: index === null ?
						0 :
						index + 1,
					game: prevState.game,
				}),
			};
		});
	}

	handlePlayerLimitChange = ({ value }) => {
		value = Number(value);

		if (!Number.isNaN(value)) {
			this.setState((prevState) => {
				return {
					game: prevState.game.set(
						"playerLimit",
						value
					).update(
						"players",
						(players) => players.slice(0, value)
					),
				};
			});
		}
	}

	handleToggleKeepRatio = () => {
		this.setState((prevState) => {
			return {
				keepRatio: !prevState.keepRatio,
			};
		});
	}

	handleSaveGameClick = () => {
		const game = this.state.game;

		localForage.setItem(STORAGE_KEY, game.toJS()).then(
			() => this.setState({
				storedGame: game,
			})
		);
	}

	handleRestoreGameClick = () => {
		this.setState((prevState) => {
			if (prevState.storedGame !== null) {
				return {
					game: prevState.storedGame,
					users: this.getUsersForGame({ game: prevState.storedGame }),
					newPlayerColor: getDefaultColorPickerColorForGame({ game: prevState.storedGame }),
				};
			}
		});
	}

	handleClearGameButtonClick = () => {
		localForage.removeItem(STORAGE_KEY).then(
			() => this.setState({
				storedGame: null,
			})
		);
	}

	handleResetGameButtonClick = () => {
		this.setState({
			game: emptyGame,
			users: Map(),
			newPlayerColor: getDefaultColorPickerColorForGame({ game: emptyGame }),
		});
	}

	handleEditGameClick = () => {
		this.setState({
			shouldShowGameControls: true,
		});
	}

	handleGameControlsCloseIconClick = () => {
		this.setState({
			shouldShowGameControls: false,
		});
	}

	handleSpeedDialClick = () => {
		this.setState((prevState) => {
			return {
				isSpeedDialOpen: !prevState.isSpeedDialOpen,
			};
		});
	}

	handleSpeedDialClickAway = () => {
		this.setState({
			isSpeedDialOpen: false,
		});
	}

	handleShowMoveListClick = () => {
		this.setState((prevState) => {
			return {
				shouldShowMoveList: !prevState.shouldShowMoveList,
			};
		});
	}

	sliceFilledCells = ({ index, game = this.state.game }) => {
		if (index === game.getIn(["board", "filledCells"]).size) {
			// if there's no change to be done, return game unchanged
			return game;
		}

		return game.updateIn(
			["board", "filledCells"],
			(filledCells) => filledCells.slice(0, index)
		).delete("winner");
	}

	getStoredGame = () => {
		return localForage.getItem(STORAGE_KEY).then(
			(game) => {
				if (game) {
					game.board = new BoardRecord(game.board);

					return fromJS(game);
				}

				return null;
			}
		);
	}

	getUsersForGame = ({ game }) => {
		return game.get("players").reduce(
			(users, player) => users.set(
				player.get("userID"),
				Map({
					id: player.userID,
				})
			),
			Map()
		);
	}

	filterPlayerIndicatorColors = ({ id }) => {
		return filterPlayerIndicatorColorsForGame({ id }, this.state.game);
	}

	getDefaultColorPickerColor = () => {
		return getDefaultColorPickerColorForGame({ game: this.state.game });
	}

	renderPlayerControls = () => {
		const contextMenuPlayer = this.state.contextMenuPlayerIndex !== null &&
			this.state.game.getIn(["players", this.state.contextMenuPlayerIndex]);

		return (
			<div
				className={this.props.classes.playerControls}
			>
				<header
					className={this.props.classes.playerControlsHeader}
				>
					<h3>Players</h3>
				</header>
				<PlayerLimitInput
					playerLimit={this.state.game.get("playerLimit")}
					onPlayerLimitChange={this.handlePlayerLimitChange}
					classes={{
						root: this.props.classes.playerLimitInput,
					}}
				/>
				<PlayerIndicators
					playerUsers={this.state.users}
					game={this.state.game}
					indicatorProps={({ index }) => ({
						onContextMenu: (event) => this.handlePlayerIndicatorContextMenu({event, index}),
					})}
					classes={{
						root: this.props.classes.playerIndicators
					}}
					markActive
				/>
				{
					this.state.contextMenuAnchorEl !== null && (
						<Menu
							anchorEl={this.state.contextMenuAnchorEl}
							open
							onClose={this.handlePlayerIndicatorContextMenuClose}
							anchorOrigin={{
								horizontal: "left",
								vertical: "bottom",
							}}
							getContentAnchorEl={null}
						>
							<MenuItem
								onClick={this.handleTogglePresenceMenuItemClick}
							>
								<Switch
									checked={this.state.game.getIn(["playerPresence", contextMenuPlayer.get("color")], false)}
								/>
								Toggle presence
							</MenuItem>
							<MenuItem
								onClick={this.handleToggleIsMeMenuItemClick}
							>
								<Switch
									checked={this.state.users.getIn([contextMenuPlayer.get("userID"), "isMe"], false)}
								/>
								Toggle whether player is me
							</MenuItem>
							<MenuItem
								button={false}
							>
								<ColorPicker
									onColorChosen={this.handleColorChosen}
									selectedColor={contextMenuPlayer.get("color")}
									colorFilter={this.filterPlayerIndicatorColors}
									getDefaultColor={this.getDefaultColorPickerColor}
								/>
							</MenuItem>
						</Menu>

					)
				}
				{
					this.state.submenuAnchorEl && (
						<Menu
							anchorEl={this.state.submenuAnchorEl}
							open
							onClose={this.handlePlayerIndicatorContextMenuClose}
							getContentAnchorEl={null}
							anchorOrigin={{
								horizontal: "right",
								vertical: "top",
							}}
						>
							<MenuItem
							>
								Color
							</MenuItem>
						</Menu>
					)
				}
				<div
					className={this.props.classes.addRemovePlayerContainer}
				>
					<div
						className={classnames({
							[this.props.classes.hiddenAddPlayerButton]: this.state.game.get("players").size >= this.state.game.get("playerLimit"),
						})}
					>
						<IconButton
							onClick={this.handleAddPlayerButtonClick}
							aria-label="Add player"
							title="Add player"
						>
							<div
								className={`icon ${this.props.classes.icomoonIcon}`}
							>add player</div>
						</IconButton>
						{
							this.getDefaultColorPickerColor() !== undefined && (
								<ColorPicker
									onColorChosen={this.handleNewPlayerColorChosen}
									colorFilter={this.filterPlayerIndicatorColors}
									getDefaultColor={this.getDefaultColorPickerColor}
									selectedColor={this.state.newPlayerColor || this.getDefaultColorPickerColor()}
								/>
							)
						}
					</div>
					{
						!this.state.game.get("players").isEmpty() && (
							<IconButton
								onClick={this.handleRemovePlayerButtonClick}
								aria-label="Remove rightmost player"
								title="Remove rightmost player"
							>
								<div
									className={`icon ${this.props.classes.icomoonIcon}`}
								>remove player</div>
							</IconButton>
						)
					}
				</div>
			</div>
		);
	}
	
	renderGameControls = () => {
		return (
			<Card
				className={this.props.classes.gameControlsContainer}
			>
				<CardHeader
					action={(
						<IconButton
							onClick={this.handleGameControlsCloseIconClick}
							title="Close edit pane"
							aria-label="Close edit pane"
						>
							<CloseIcon />
						</IconButton>
					)}
					title="Game Controls"
				/>
				<CardContent
				>
					<h3>Board</h3>
					<div
						className={this.props.classes.gameControls}
					>
						<DimensionInput
							width={this.state.game.getIn(["board", "width"])}
							height={this.state.game.getIn(["board", "height"])}
							onWidthChange={this.handleWidthChange}
							onHeightChange={this.handleHeightChange}
							keepRatio={this.state.keepRatio}
							onToggleKeepRatio={this.handleToggleKeepRatio}
						/>
					</div>

					{this.renderPlayerControls()}
				</CardContent>
			</Card>
		);
	}
	
	render() {
		const quintros = gameSelectors.getQuintros(this.state.game);
		const gameIsOver = gameSelectors.isOver(this.state.game);
		const isStoredGame = this.state.storedGame && is(this.state.game, this.state.storedGame);
		const isEmptyGame = is(this.state.game, emptyGame);
		const isDirty = !isEmptyGame && !isStoredGame;

		
		const speedDialActions = [
			{
				name: "Edit game",
				icon: (
					<EditIcon />
				),
				handler: this.handleEditGameClick,
			},

			{
				name: `${this.state.shouldShowMoveList ? "Hide" : "Show"} move list`,
				icon: this.state.shouldShowMoveList ?
					(
						<ShowingMoveListIcon />
					) :
					(
						<NotShowingMoveListIcon />
					),
				handler: this.handleShowMoveListClick,
			},
		];
		
		if (!isEmptyGame) {
			speedDialActions.push({
				name: "Reset game",
				icon: (
					<ClearIcon />
				),
				handler: this.handleResetGameButtonClick,
			});
		}

		if (isDirty) {
			speedDialActions.push({
				name: "Store game",
				icon: (
					<SaveIcon />
				),
				handler: this.handleSaveGameClick,
			});
		}

		if (this.state.storedGame !== null) {
			if (!isStoredGame) {
				speedDialActions.push({
					name: "Restore stored game",
					icon: (
						<RestoreIcon />
					),
					handler: this.handleRestoreGameClick,
				});
			}

			speedDialActions.push({
				name: "Remove stored game",
				icon: (
					<DeleteIcon />
				),
				handler: this.handleClearGameButtonClick,
			});
		}

		return (
			<div
				className={this.props.classes.root}
			>
				{this.state.shouldShowGameControls && this.renderGameControls()}
				<div
					className={this.props.classes.boardContainer}
				>
					<div
						className={this.props.classes.board}
					>
						<Board
							board={this.state.game.get("board")}
							allowPlacement={
								!this.state.game.get("players").isEmpty() &&
								this.state.game.get("isStarted") &&
								!gameIsOver
							}
							onCellClick={this.handleCellClick}
							quintros={quintros}
							gameIsOver={gameIsOver}
						/>
					</div>
					<ClickAwayListener
						onClickAway={this.handleSpeedDialClickAway}
					>
						<SpeedDial
							classes={{
								root: this.props.classes.speedDial,
							}}
							open={this.state.isSpeedDialOpen}
							onClick={this.handleSpeedDialClick}
							icon={(
								<SpeedDialIcon
									classes={{
										root: this.props.classes.speedDialIcon,
									}}
								/>
							)}
							ariaLabel="Game actions"
						>
							{
								speedDialActions.map(
									(action) => (
										<SpeedDialAction
											key={action.name}
											icon={action.icon}
											tooltipTitle={action.name}
											onClick={action.handler}
										/>
									)
								)
							}
						</SpeedDial>
					</ClickAwayListener>
					{
						this.state.shouldShowMoveList && (
							<MoveList
								classes={{
									root: this.props.classes.moveList,
								}}
								game={this.state.game}
								onSelectMove={this.handleSelectMove}
							/>
						)
					}
				</div>
			</div>
		);
	}
}
	
export default withStyles(styles)(Sandbox);
	