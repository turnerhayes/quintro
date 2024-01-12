'use client';


import React, { useCallback } from "react";
import { Map } from "immutable";
import classnames         from "classnames";
import Config             from "@app/config";
import Marble             from "@app/components/Marble";

const CELL_SIZE = "3.9em";

interface CellProps {
	cell: Map<string, any>;
	allowPlacement: boolean;
	onClick: ({ cell}: {cell: any;}) => void;
	classes?: {
		cell: string;
		marble: string;
		allowPlacement: string;
		noPlacement: string;
		quintroMember: string;
	};
}

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

const Cell = ({
	cell,
	allowPlacement,
	onClick,
	classes,
}: CellProps) => {
	const handleClick = useCallback(() => {
		if (onClick) {
			onClick({
				cell: cell.set(
					"isQuintroMember",
					!!cell.get("isQuintroMember")
				)
			});
		}
	}, [onClick, cell]);

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
			onClick={handleClick}
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

export default Cell;
// export default withStyles(styles)(Cell);
