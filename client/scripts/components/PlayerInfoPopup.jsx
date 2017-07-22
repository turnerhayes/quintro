import React        from "react";
import PropTypes    from "prop-types";
import {
	Popover,
	PopoverTitle,
	PopoverContent
}                   from "reactstrap";
import { withRouter } from "react-router";
import { Link }       from "react-router-dom";
import PlayerRecord   from "project/scripts/records/player";
import                     "bootstrap/dist/css/bootstrap.css";
import                     "project/styles/player-info-popup";


class PlayerInfoPopup extends React.Component {
	static propTypes = {
		location: PropTypes.shape({
			pathname: PropTypes.string,
		}).isRequired,

		player: PropTypes.instanceOf(PlayerRecord).isRequired,

		target: PropTypes.string.isRequired,

		isOpen: PropTypes.bool,

		toggle: PropTypes.func,

		onDisplayNameChange: PropTypes.func,
	}

	state = {
		isFormEditable: false
	}

	invokeOnDisplayNameChange = () => {
		this.props.onDisplayNameChange && this.props.onDisplayNameChange({
			player: this.props.player,
			displayName: this.displayNameInputEl.value
		});
	}

	handleChangeDisplayNameFormSubmit = (event) => {
		event.preventDefault();

		this.invokeOnDisplayNameChange();
	}

	renderDisplayNameForm = () => {
		return (
			<form
				className="c_player-info-popup--set-display-name-form form-inline"
				action={this.props.location.pathname}
				method="PATCH"
				onSubmit={this.handleChangeDisplayNameFormSubmit}
			>
				{
					this.state.isFormEditable ?
						(
							<div
								className="form-group"
							>
								<label
									htmlFor="c_player-info-popup--set-display-name-form--display-name-input"
									className="sr-only"
								>
									My name
								</label>
								<input
									id="c_player-info-popup--set-display-name-form--display-name-input"
									className="form-control"
									type="text"
									placeholder="My name"
									ref={(displayNameInputEl) => this.displayNameInputEl = displayNameInputEl}
									defaultValue={(this.props.player.user.name && this.props.player.user.name.get("display")) || ""}
									onBlur={() => this.setState({ isFormEditable: false })}
								/>
							</div>
						) :
						(
							<span
								tabIndex={0}
								onFocus={() => this.setState({ isFormEditable: true })}
							>
								{(this.props.player.user.name && this.props.player.user.name.get("display")) || ""}
								<span
									className="fa fa-pencil"
								></span>
							</span>
						)
				}
			</form>
		);
	}

	render() {
		return (
			<Popover
				placement="bottom left"
				isOpen={this.props.isOpen}
				target={this.props.target}
				toggle={this.props.toggle}
				tetherRef={
					(tether) => {
						tether && tether.setOptions(Object.assign(
							{},
							tether.options,
							{
								classes: Object.assign(
									{},
									tether.options.classes,
									{
										element: "c_player-info-popup--popover"
									}
								)
							}
						));
					}
				}
			>
				<PopoverTitle>
					{
						(this.props.player.user.name && this.props.player.user.name.get("display")) || "Anonymous User"
					}
				</PopoverTitle>
				<PopoverContent>
					{
						this.props.player.user.isAnonymous ?
							(
								this.props.player.user.isMe ?
									this.renderDisplayNameForm() :
									null
							) :
							(
								<Link
									to={`/profile/${this.props.player.user.username}`}
								>
									Profile
								</Link>
							)
					}
				</PopoverContent>
			</Popover>
		);
	}
}

export default withRouter(PlayerInfoPopup);
