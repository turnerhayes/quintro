import React, {
	CSSProperties,
	useCallback
}                                from "react";
import classnames                from "classnames";
import type { Cell as CellType } from "@root/types";
import Config                    from "@root/config";
import { Marble }                from "@/components/Marble";
import * as styles               from "./Cell.module.scss";


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
		onclick,
	]);

	const color = cell.color;
	const isFilled = !!color;
	const isQuintroMember = isFilled && !!cell.isQuintroMember;

	return (
		<td
			className={classnames([
				styles.cell,
				{
					[styles.quintroMember]: isQuintroMember,
					[styles.noPlacement]: !allowPlacement,
				},
			])}
			style={{
				"--cell-size": CELL_SIZE,
			} as CSSProperties}
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
		</td>
	);
}
