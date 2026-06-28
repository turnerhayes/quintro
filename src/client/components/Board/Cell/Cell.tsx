import {
	useCallback
}                                from "react";
import type { Cell as CellType } from "@/types";
import { Marble }                from "@/client/components/Marble";
import styles                    from "./Cell.module.css";
import { TableCell, useTheme } from "@mui/material";
import classNames from "classnames";


export interface CellWithQuintroStatus extends CellType {
	isQuintroMember: boolean;
}

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

	return (
		<TableCell
			className={classNames(
				styles.root,
				{
					[styles.noPlacement]: !allowPlacement,
					[styles.quintroMember]: isQuintroMember,
				}
			)}
			sx={{
				borderColor: theme.palette.divider,
				// Need to set padding here to override MUI default padding
				padding: 0,
			}}
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
