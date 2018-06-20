import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { withStyles }     from "@material-ui/core/styles";
import classnames         from "classnames";
import Config             from "@app/config";
import Marble             from "@app/components/Marble";

const CELL_SIZE = "3.9em";

const styles = {
	cell: {
		width: CELL_SIZE,
		height: CELL_SIZE,
		minWidth: CELL_SIZE,
		minHeight: CELL_SIZE,
		maxWidth: CELL_SIZE,
		maxHeight: CELL_SIZE,
		border: "1px solid black",
	},

	noPlacement: {
		cursor: "not-allowed",
	},

	allowPlacement: {
		cursor: "pointer",
	},

	quintroMember: {
		backgroundColor: "rgba(255, 255, 0, 0.6)",
	},

	marble: {
		margin: "5%", // (100% - 90% [marble width/height]) / 2 (top/bottom, left/right)
	},

	...Config.game.colors.reduce(
		(colorStyles, color) => {
			colorStyles[`marbleColor-${color.id}`] ={
				background: "radial-gradient(circle at 10px 7px, color.hex, #FFFFFF)",
				borderRadius: "100%",
			};

			return colorStyles;
		},
		{}
	),
};

class Cell extends React.PureComponent {
	handleClick = () => {
		this.props.onClick && this.props.onClick({
			cell: this.props.cell.set(
				"isQuintroMember",
				!!this.props.cell.get("isQuintroMember")
			)
		});
	}

	render() {
		const {
			cell,
			allowPlacement,
			classes,
		} = this.props;

		const color = cell.get("color");
		const isFilled = !!color;
		const isQuintroMember = isFilled && !!cell.get("isQuintroMember");

		return (
			<td
				className={classnames([
					classes.cell,
					{
						[classes.quintroMember]: isQuintroMember,
						[classes.noPlacement]: !allowPlacement,
						[classes.allowPlacement]: allowPlacement,
					},
				])}
				onClick={this.handleClick}
			>
				{
					isFilled ? (
						<Marble
							color={color}
							size="90%"
							className={classes.marble}
						/>
					) : null
				}
			</td>
		);
	}
}

Cell.propTypes = {
	cell: ImmutablePropTypes.map.isRequired,
	allowPlacement: PropTypes.bool,
	onClick: PropTypes.func,
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Cell);
