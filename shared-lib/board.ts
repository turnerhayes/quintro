"use strict";

import Immutable, {
	OrderedSet,
	Map,
	List,
	Record,
	fromJS,
	is,
	Collection,
	isImmutable
} from "immutable";
import assert  from "assert";


export type CellPosition = [number, number];

export type ImmutableCellPosition = List<number>;

export interface Cell {
	color?: string;
	position: [number, number];
}

export interface Board {
	width: number;
	height: number;
	filledCells: Cell[];
}

export interface Quintro {
    cells: Cell[];
    color: string;
}

export type ImmutableCell = Record<Omit<Cell, "position"> & {
	position: List<number>;
}>;

type ImmutableBoardSchema = Omit<Board, "filledCells"> & {
	filledCells: List<ImmutableCell>;
};

type ImmutableBoardConstructorArgs = Omit<Board, "filledCells"> & {
	filledCells?: Cell[] | Collection.Indexed<ImmutableCell>;
}

const schema: ImmutableBoardSchema = {
	width: null,
	height: null,
	filledCells: List<ImmutableCell>(),
};

/**
 * Represents the state of a game board.
 *
 * @memberof shared-lib
 * @extends external:Immutable.Record
 */
class ImmutableBoard extends Record(schema, "Board") {
	/**
	 * @param {Object} args - the constructor arguments
	 * @param {!number} args.width - the width of the board, in cells (must be an integer)
	 * @param {!number} args.height - the height of the board, in cells (must be an integer)
	 * @param {Types.Cell[]|external:Immutable.Collection.Indexed<Types.Cell>} args.filledCells - the currently occupied cells in the board
	 */
	constructor({
		width,
		height,
		filledCells = []
	}: ImmutableBoardConstructorArgs) {
		assert.ok(Number.isInteger(width), "`width` must be an integer; was " + width);
		assert.ok(width > 0, "`width` must be greater than 0; was " + width);
		assert.ok(Number.isInteger(height), "`height` must be an integer; was " + height);
		assert.ok(height > 0, "`height` must be greater than 0; was " + height);
		assert.ok(
			Array.isArray(filledCells) || filledCells instanceof Collection.Indexed,
			"`filledCells` must be an array or an indexed Immutable collection; was " + filledCells
		);

		/**
		 * The width of the board, in cells
		 *
		 * @member {number} width
		 * @memberof shared-lib.Board
		 */
		
		/**
		 * The height of the board, in cells
		 *
		 * @member {number} height
		 * @memberof shared-lib.Board
		 */
		
		/**
		 * The currently occupied cells in the board
		 *
		 * @member {external:Immutable.List<Types.Cell>} filledCells
		 * @memberof shared-lib.Board
		 */

		super({
			width,
			height,
			filledCells: List(fromJS(filledCells) as Collection.Indexed<ImmutableCell>)
		});
	}

	get width() {
		return this.get("width");
	}

	get height() {
		return this.get("height");
	}

	get filledCells() {
		return this.get("filledCells");
	}

	getPlayerColors() {
		return this.filledCells.reduce(
			(colors, cell) => {
				return colors.add(cell.get("color"));
			},
			OrderedSet<string>()
		).toList();
	}

	toString() {
		let filledSummary = this.filledCells.map(
			(cell) => `${cell.get("position").get(0)},${cell.get("position").get(1)}:${cell.get("color")}`
		).join("; ");

		if (filledSummary) {
			filledSummary = ", filledCells: " + filledSummary;
		}

		return `Board<${this.width}x${this.height}${filledSummary}>`;
	}

	toGraphicalString({
		startCell,
		playerColors = this.getPlayerColors(),
	}: {
		startCell?: ImmutableCellPosition|CellPosition;
		playerColors?: List<string>|string[];
	} = {}) {
		const separator = " ";

		playerColors = List(playerColors);
		if (startCell && !isImmutable(startCell)) {
			startCell = fromJS(startCell);
		}

		const filledMap = this.filledCells.reduce(
			(filled, filledCell) => {
				return filled.set(List(filledCell.get("position")), filledCell.get("color"));
			},
			Map<ImmutableCellPosition, string>()
		);

		const legend = playerColors.map(
			(color, index) => `${index}: ${color}`
		).join("\n");

		const grid = [...new Array(this.height)].map(
			(nothing, rowIndex) => [...new Array(this.width)].map(
				(nothing, columnIndex) => {
					const filledMapCell = filledMap.get(List([columnIndex, rowIndex]));

					if (filledMapCell) {
						const colorIndex = playerColors.indexOf(filledMapCell);

						if (
							startCell &&
							(startCell as ImmutableCellPosition).getIn(["position", 0]) === columnIndex &&
							(startCell as ImmutableCellPosition).getIn(["position", 1]) === rowIndex
						) {
							return `^${colorIndex}`;
						}

						return ` ${colorIndex}`;
					}

					return " -";
				}
			).join(separator)
		).join("\n");

		return `${legend ? legend + "\n\n" : ""}${grid}
`;
	}

	/**
	 * Returns an instance of {shared-lib.Board} with the specified cells added to the
	 * `filledCells` property.
	 *
	 * @param {...Type.Cell|external:Immutable.Map<Type.Cell>} cells - the cells to use for the `filledCells` property
	 *
	 * @return {shared-lib.Board} a Board instance with the cells added
	 */
	fillCells(...cells) {
		return this.update(
			"filledCells",
			(filled) => filled.push(...cells.map((cell) => fromJS(cell)))
		);
	}

	/**
	 * Gets information about the cell at the specified coordinates.
	 *
	 * @param {Types.BoardPosition|Types.BoardPositionImmutable} position - the position of the cell to get
	 *
	 * @return {external:Immutable.Map<{position: Types.BoardPositionImmutable, color: string}>} the cell information
	 */
	getCell(position) {
		assert.ok(
			position[0] < this.width && position[0] >= 0,
			`Column index must be within the board; column index was ${position[0]}, board width was ${this.width}`
		);
		assert.ok(
			position[1] < this.height && position[1] >= 0,
			`Row index must be within the board; row index was ${position[0]}, board height was ${this.height}`
		);

		position = List(position);
		const filled = this.filledCells.find((cell) => is(cell.get("position"), position));

		return Map({
			position,
			color: filled && filled.get("color"),
		});
	}
}

export default ImmutableBoard;
