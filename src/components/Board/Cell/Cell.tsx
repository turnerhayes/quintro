import {
	useCallback
}                                from "react";
import type { Cell as CellType } from "@/types";
import { Marble }                from "@/components/Marble";
import styles                    from "./Cell.module.css";
import { TableCell, useTheme, type SxProps } from "@mui/material";


export interface CellWithQuintroStatus extends CellType {
	isQuintroMember: boolean;
}

const CELL_SIZE = "3.9em";

export const Cell = (
	{
		cell,
		allowPlacement,
		onClick,
	}: {
		cell: CellWithQuintroStatus;
		allowPlacement: boolean;
		onClick: (args: {
			cell: CellWithQuintroStatus;
		}) => void;
	}
) => {
	const handleClick = useCallback(() => {
		onClick && onClick({
			cell: {
				...cell,
				isQuintroMember: !!cell.isQuintroMember,
			}
		});
	}, [
		onClick,
	]);

	const color = cell.color;
	const isFilled = !!color;
	const isQuintroMember = isFilled && !!cell.isQuintroMember;
	const theme = useTheme();

	const cellSx: SxProps = {
		width: CELL_SIZE,
		height: CELL_SIZE,
		minWidth: CELL_SIZE,
		minHeight: CELL_SIZE,
		maxWidth: CELL_SIZE,
		maxHeight: CELL_SIZE,
		border: `1px solid ${theme.palette.divider}`,
		padding: 0,
		fontSize: "1em",
		cursor: "pointer",
	};

	if (!allowPlacement) {
		cellSx.cursor = "not-allowed";
	}

	if (isQuintroMember) {
		cellSx.backgroundColor = "rgba(255, 255, 0, 0.6)";
	}

	return (
		<TableCell
			sx={cellSx}
			onClick={handleClick}
		>
			{
				isFilled ? (
					<Marble
						color={color}
						size="90%"
						className={styles.marble}
					/>
				) : null
			}
		</TableCell>
	);
}
