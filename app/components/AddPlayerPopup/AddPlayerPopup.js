import React from "react";
import PropTypes from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import {
	FormattedMessage,
	injectIntl
} from "react-intl";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import IconButton from "@material-ui/core/IconButton";
import CheckIcon from "@material-ui/icons/Check";

import Config from "@app/config";
import ColorPicker from "@app/components/ColorPicker";

import messages from "./messages";

class AddPlayerPopup extends React.PureComponent {
	static propTypes = {
		game: ImmutablePropTypes.map.isRequired,
		onSubmit: PropTypes.func.isRequired,
	}

	constructor(...args) {
		super(...args);

		this.state = {
			color: this.getDefaultColor(),
		};
	}

	handleSubmit = (event) => {
		event.preventDefault();

		this.props.onSubmit({
			color: this.state.color,
		});
	}

	handleColorChosen = ({ color }) => {
		this.setState({
			color,
		});
	}

	filterColors = ({ id }) => {
		return !this.props.game.get("players").map(
			(player) => player.get("color")
		).includes(id);
	}

	getDefaultColor = () => {
		return Config.game.colors.filter(this.filterColors)[0].id;
	}

	render() {
		return (
			<form
				onSubmit={this.handleSubmit}
			>
				<Card>
					<CardHeader
						title={
							<FormattedMessage
								{...messages.title}
							/>
						}
						action={
							<IconButton
								type="submit"
							>
								<CheckIcon />
							</IconButton>
						}
					/>
					<CardContent>
						<FormattedMessage
							{...messages.colorPickerLabel}
						/>
						<ColorPicker
							filterColors={this.filterColors}
							getDefaultColor={this.getDefaultColor}
							onColorChosen={this.handleColorChosen}
							selectedColor={this.state.color}
						/>
					</CardContent>
				</Card>
			</form>
		);
	}
}

export default injectIntl(AddPlayerPopup);
