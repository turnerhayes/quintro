import React from "react";
import PropTypes from "prop-types";
import { fromJS } from "immutable";
import classnames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Switch from "@material-ui/core/Switch";
import IconButton from "@material-ui/core/IconButton";

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

import "@fonts/icomoon/style.css";

import MoveList from "./MoveList";

const styles = {
	dimensionSeparator: {
		margin: "0 0.5em",
		verticalAlign: "bottom",
	},

	boardContainer: {
		display: "flex",
	},

	board: {
		flex: 1,
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
};

class Sandbox extends React.PureComponent {
	static propTypes = {
		classes: PropTypes.object.isRequired,
	}
	
	state = {
		game: fromJS({
			board: new BoardRecord({
				width: Config.game.board.width.min,
				height: Config.game.board.height.min,
				filledCells: [],
			}),

			players: [],

			playerLimit: 6,

			playerPresence: {},

			isStarted: true,
		}),

		users: fromJS({
			1: {
				name: {
					first: "Test",
					last: "Testerson",
				},
			},
		}),

		
		keepRatio: true,

		contextMenuAnchorEl: null,
		
		contextMenuPlayerIndex: null,

		submenuAnchorEl: null
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
				game = game.updateIn(
					["board", "filledCells"],
					(filledCells) => filledCells.slice(0, firstMoveIndex)
				);
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
			const nextIndex = prevState.game.get("players").size;
			const userID = (nextIndex + 1).toString();

			return {
				game: prevState.game.setIn(
					["players", nextIndex],
					fromJS({
						userID,
						color,
					})
				).setIn(
					["playerPresence", color],
					true
				),
				users: prevState.users.set(userID, fromJS({
					id: userID,
				})),
			};
		});
	}

	handleRemovePlayerButtonClick = () => {
		this.setState((prevState) => {
			const player = prevState.game.get("players").last();
			const userID = player.get("userID");

			// eslint-disable-next-line no-magic-numbers
			const prevPlayer = prevState.game.get("players").get(-2);

			return {
				game: prevState.game.update(
					"players",
					(players) => players.slice(0, -1)
				).updateIn(
					["board", "filledCells"],
					(filledCells) => {
						let endIndex = prevPlayer === undefined ?
							0 :
							filledCells.findIndex((cell) => cell.get("color") === player.get("color"));
							
						endIndex = endIndex === -1 ?
							filledCells.size :
							endIndex;


						return filledCells.slice(
							0,
							endIndex
						);
					}
				),

				users: prevState.users.delete(userID),
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
			return {
				game: prevState.game.update(
					"board",
					(board) => board.fillCells({
						position: cell.get("position"),
						color: gameSelectors.getCurrentPlayerColor(this.state.game),
					})
				),
			};
		});
	}

	handleSelectMove = ({ index }) => {
		this.setState((prevState) => {
			if (index !== null && prevState.game.getIn(["board", "filledCells"]).size === index + 1) {
				return undefined;
			}

			return {
				game: prevState.game.updateIn(
					["board", "filledCells"],
					(filledCells) => filledCells.slice(
						0,
						index === null ?
							0 :
							index + 1
					)
				),
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
	;
	handleToggleKeepRatio = () => {
		this.setState((prevState) => {
			return {
				keepRatio: !prevState.keepRatio,
			};
		});
	}

	filterPlayerIndicatorColors = ({ id }) => {
		return !this.state.game.get("players").map((player) => player.get("color")).includes(id);
	}

	getDefaultColorPickerColor = () => {
		const colors = Config.game.colors.filter(this.filterPlayerIndicatorColors);

		return colors.length > 0 ? colors[0].id : undefined;
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
						<ColorPicker
							onColorChosen={this.handleNewPlayerColorChosen}
							colorFilter={this.filterPlayerIndicatorColors}
							getDefaultColor={this.getDefaultColorPickerColor}
							selectedColor={this.state.newPlayerColor || this.getDefaultColorPickerColor()}
						/>
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
			<fieldset>
				<legend>Game Controls</legend>
			
				<h3>Board</h3>
				<DimensionInput
					width={this.state.game.getIn(["board", "width"])}
					height={this.state.game.getIn(["board", "height"])}
					onWidthChange={this.handleWidthChange}
					onHeightChange={this.handleHeightChange}
					keepRatio={this.state.keepRatio}
					onToggleKeepRatio={this.handleToggleKeepRatio}
				/>

				{this.renderPlayerControls()}
			</fieldset>
		);
	}
	
	render() {
		return (
			<div>
				{this.renderGameControls()}
				<div
					className={this.props.classes.boardContainer}
				>
					<div
						className={this.props.classes.board}
					>
						<Board
							board={this.state.game.get("board")}
							allowPlacement={!this.state.game.get("players").isEmpty() && this.state.game.get("isStarted")}
							onCellClick={this.handleCellClick}
						/>
					</div>
					<MoveList
						classes={{
							root: this.props.classes.moveList,
						}}
						game={this.state.game}
						onSelectMove={this.handleSelectMove}
					/>
				</div>
			</div>
		);
	}
}
	
export default withStyles(styles)(Sandbox);
	