import React from "react";
import PropTypes from "prop-types";
import { fromJS } from "immutable";
import TextField from "@material-ui/core/TextField";
import { withStyles } from "@material-ui/core/styles";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Switch from "@material-ui/core/Switch";
import LinkIcon from "@material-ui/icons/Link";
import ToggleButton from "@material-ui/lab/ToggleButton";

import Board from "@app/components/Board";
import PlayerIndicators from "@app/components/PlayerIndicators";
import BoardRecord from "@shared-lib/board";
import Config from "@app/config";

const styles = {
	dimensionSeparator: {
		margin: "0 0.5em",
		verticalAlign: "bottom",
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

			players: fromJS([
				{
					userID: "1",
					color: Config.game.colors[0].id,
				},
			]),

			playerLimit: 6,
		}),

		users: fromJS({
			1: {
				name: {
					first: "Test",
					last: "Testerson",
				},
			},
		}),

		
		keepRatio: false,

		contextMenuAnchorEl: null,
		
		contextMenuPlayer: null,

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
			return {
				board: prevState.game.mergeIn(["board"], dimensions),
			}; 
		});
	}
	
	handleWidthChange = (event) => {
		const width = event.target.valueAsNumber;
		let height;

		if (!Number.isNaN(width)) {
			if (this.state.keepRatio) {
				const diff = width - this.state.game.getIn(["board", "width"]);
				
				height = this.state.game.getIn(["board", "height"]) + diff;
			}

			this.handleDimensionChange({ width, height });
		}
	}
	
	handleHeightChange = (event) => {
		const height = event.target.valueAsNumber;
		let width;
		
		if (!Number.isNaN(height)) {
			if (this.state.keepRatio) {
				const diff = height - this.state.game.getIn(["board", "height"]);
				
				width = this.state.game.getIn(["board", "width"]) + diff;
			}

			this.handleDimensionChange({ width, height });
		}
	}

	handlePlayerIndicatorClicked = (/* selectedPlayer, element */) => {
	}

	handlePlayerIndicatorContextMenu = ({ event, player }) => {
		event.preventDefault();

		this.setState({
			contextMenuAnchorEl: event.target,
			contextMenuPlayer: player,
		});
	}

	handlePlayerIndicatorContextMenuClose = () => {
		this.setState({
			contextMenuAnchorEl: null,
			contextMenuPlayer: null,
			submenuAnchorEl: null,
		});
	}

	toggleKeepRatio = () => {
		this.setState(
			(prevState) => ({
				keepRatio: !prevState.keepRatio,
			})
		);
	}

	handleTogglePresenceMenuItemClick = () => {
		this.setState((prevState) => {
			const color = prevState.contextMenuPlayer.get("color");

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
			const userID = prevState.contextMenuPlayer.get("userID");

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

	renderPlayerControls = () => {
		return (
			<fieldset>
				<legend>
					Player Controls
				</legend>

				<PlayerIndicators
					playerUsers={this.state.users}
					game={this.state.game}
					onIndicatorClick={this.handlePlayerIndicatorClicked}
					indicatorProps={({ player }) => ({
						onContextMenu: (event) => this.handlePlayerIndicatorContextMenu({event, player}),
					})}
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
									checked={this.state.game.getIn(["playerPresence", this.state.contextMenuPlayer.get("color")], false)}
								/>
								Toggle presence
							</MenuItem>
							<MenuItem
								onClick={this.handleToggleIsMeMenuItemClick}
							>
								<Switch
									checked={this.state.users.getIn([this.state.contextMenuPlayer.get("userID"), "isMe"], false)}
								/>
								Toggle whether player is me
							</MenuItem>
							<MenuItem
								onClick={this.handleChangeColorMenuItemClick}
							>
								Change color
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
			</fieldset>
		);
	}
	
	renderBoardControls = () => {
		return (
			<fieldset>
				<legend>Board Controls</legend>
			
				<TextField
					type="number"
					label="Width"
					inputProps={{
						max: Config.game.board.width.max,
						min: Config.game.board.width.min,
					}}
					name="width"
					value={this.state.game.getIn(["board", "width"])}
					onChange={this.handleWidthChange}
				/>
				<span
					className={this.props.classes.dimensionSeparator}
				>×</span>
			
				<TextField
					type="number"
					label="Height"
					inputProps={{
						max: Config.game.board.height.max,
						min: Config.game.board.height.min,
					}}
					name="height"
					value={this.state.game.getIn(["board", "height"])}
					onChange={this.handleHeightChange}
				/>

				<ToggleButton
					selected={this.state.keepRatio}
					value=""
					onClick={this.toggleKeepRatio}
					title={`${this.state.keepRatio ? "Unl" : "L"}ock ratio`}
				>
					<LinkIcon />
				</ToggleButton>
			</fieldset>
		);
	}
	
	render() {
		return (
			<div>
				{this.renderBoardControls()}
				{this.renderPlayerControls()}
				<Board
					board={this.state.game.get("board")}
				/>
			</div>
		);
	}
}
	
export default withStyles(styles)(Sandbox);
	