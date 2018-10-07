import React from "react";
import PropTypes from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { injectIntl, intlShape } from "react-intl";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";

import gameSelectors from "@app/selectors/games/game";
import ColorPicker from "@app/components/ColorPicker";

import messages from "./messages";

const styles = {
	root: {},

	// Icomoon icons are off center in Material UI 
	icomoonIcon: {
		transform: "translate(-50%)",
	},
};

class AddPlayerButton extends React.PureComponent {
	static propTypes = {
		classes: PropTypes.object.isRequired,
		className: PropTypes.string,
		game: ImmutablePropTypes.map.isRequired,
		intl: intlShape.isRequired,
		onAdd: PropTypes.func.isRequired,
	}

	state = {
		color: null,
	}

	componentDidMount() {
		this.setState({
			color: ColorPicker.getDefaultColorForGame({
				game: this.props.game,
			}),
		});
	}

	static getDerivedStateFromProps(props, state) {
		if (!gameSelectors.canAddPlayerColor(props.game, { color: state.color })) {
			return {
				color: ColorPicker.getDefaultColorForGame({
					game: props.game,
				}),
			};
		}

		return null;
	}

	handleClick = () => {
		this.props.onAdd({
			color: this.state.color,
		});
	}

	handleColorChosen = ({ color }) => {
		this.setState({
			color,
		});
	}

	render() {
		const title = this.props.intl.formatMessage(messages.buttonTitle);

		return (
			<div
				className={this.props.className || this.props.classes.root}
			>
				<IconButton
					onClick={this.handleClick}
					aria-label={title}
					title={title}
				>
					<div
						className={`icon ${this.props.classes.icomoonIcon}`}
					>add player</div>
				</IconButton>
				{
					this.state.color !== undefined && (
						<ColorPicker
							game={this.props.game}
							onColorChosen={this.handleColorChosen}
							selectedColor={this.state.color}
						/>
					)
				}
			</div>
		);
	}
}

export default injectIntl(withStyles(styles)(AddPlayerButton));
