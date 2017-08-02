import React         from "react";
import PropTypes     from "prop-types";
import { Link }      from "react-router-dom";
import {
	Modal,
	ModalHeader,
	ModalBody,
	Dropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
	Button,
	ButtonGroup
}                    from "reactstrap";
import Config        from "project/scripts/config";
import GameRecord    from "project/scripts/records/game";
import                    "project/styles/game-join-dialog.less";

export default class GameJoinDialog extends React.Component {
	static propTypes = {
		game: PropTypes.instanceOf(GameRecord).isRequired,
		onSubmit: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
		onWatchGame: PropTypes.func
	}

	state = {
		modalIsOpen: true,
		colorPickerIsOpen: false,
		selectedColor: null
	}

	toggleColorPicker = (isOpen) => {
		if (isOpen === undefined) {
			isOpen = !this.state.colorPickerIsOpen;
		}

		this.setState({ colorPickerIsOpen: isOpen });
	}

	handleColorClicked = ({ colorDefinition }) => {
		this.setState({ selectedColor: colorDefinition.id });
		this.toggleColorPicker(false);
	}

	handleCancelButtonClicked = () => {
		this.props.onCancel();
	}

	handleWatchGameButtonClicked = () => {
		this.props.onWatchGame && this.props.onWatchGame();
	}

	handleSubmit = ({ event, defaultColor }) => {
		event.preventDefault();

		this.props.onSubmit({
			color: this.state.selectedColor || defaultColor
		});

		this.setState({ modalIsOpen: true });
	}

	renderColorOptionContent = (colorDefinition) => {
		return (
			<span>
				<span
					className="c_game-join-dialog--color-swatch align-bottom"
					style={{backgroundColor: colorDefinition.hex}}
				></span>
				{colorDefinition.name}
			</span>
		);
	}

	renderCannotJoinGame = ({ reason }) => {
		return (
			<div>
				Sorry, { reason }
				<div>
					<Link to="/game/find">Find another game</Link> or <Link to="/game/create">create your own!</Link>
				</div>
				<Button
					color="secondary"
					onClick={this.handleWatchGameButtonClicked}
				>I want to watch this game</Button>
			</div>
		);
	}

	renderPlayerForm = () => {
		const playerColors = this.props.game.players.map((player) => player.color).toArray();
		const colors = Config.game.colors.filter(
			(colorDefinition) => playerColors.indexOf(colorDefinition.id) < 0
		);

		return (
			<form
				method="POST"
				onSubmit={(event) => this.handleSubmit({ event, defaultColor: colors[0].id })}
			>
				<div
					className="form-group"
				>
					<label
					>
						Color:
						<Dropdown
							isOpen={this.state.colorPickerIsOpen}
							toggle={this.toggleColorPicker}
						>
							<DropdownToggle caret>
								{
									this.renderColorOptionContent(
										Config.game.colors.get(this.state.selectedColor) || colors[0]
									)
								}
							</DropdownToggle>
							<DropdownMenu>
								{
									colors.map(
										(colorDefinition) => {
											return (
												<DropdownItem
													key={colorDefinition.id}
													onClick={() => this.handleColorClicked({
														colorDefinition
													})}
												>
													{ this.renderColorOptionContent(colorDefinition) }
												</DropdownItem>
											);
										}
									)
								}
							</DropdownMenu>
						</Dropdown>
					</label>
				</div>
				<div
					className="form-group"
				>
					<ButtonGroup>
						<Button
							type="submit"
							color="primary"
						>
							Join
						</Button>
						<Button
							type="button"
							color="secondary"
							onClick={this.handleCancelButtonClicked}
						>
							Cancel
						</Button>
					</ButtonGroup>
				</div>
			</form>
		);
	}

	render() {
		const isFull = this.props.game.players.size === this.props.game.playerLimit;

		let body;
		let canJoin = false;

		if (isFull) {
			body = this.renderCannotJoinGame({
				reason: "this game is full."
			});
		}
		else if (this.props.game.isStarted) {
			body = this.renderCannotJoinGame({
				reason: "this game is already in progress."
			});
		}
		else {
			body = this.renderPlayerForm();
			canJoin = true;
		}

		return (
			<Modal
				className="c_game-join-dialog"
				modalClassName="c_game-join-dialog--wrapper d-flex justify-content-center align-items-center"
				isOpen={this.state.modalIsOpen}
				fade={false}
			>
				{ canJoin && (<ModalHeader>Join this game</ModalHeader>) }
				<ModalBody>
					{ body }
				</ModalBody>
			</Modal>
		);
	}
}
