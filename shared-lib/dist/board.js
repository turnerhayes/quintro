"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const assert_1 = __importDefault(require("assert"));
const schema = {
    width: null,
    height: null,
    filledCells: (0, immutable_1.List)(),
};
/**
 * Represents the state of a game board.
 *
 * @memberof shared-lib
 * @extends external:Immutable.Record
 */
class ImmutableBoard extends (0, immutable_1.Record)(schema, "Board") {
    /**
     * @param {Object} args - the constructor arguments
     * @param {!number} args.width - the width of the board, in cells (must be an integer)
     * @param {!number} args.height - the height of the board, in cells (must be an integer)
     * @param {Types.Cell[]|external:Immutable.Collection.Indexed<Types.Cell>} args.filledCells - the currently occupied cells in the board
     */
    constructor({ width, height, filledCells = [] }) {
        assert_1.default.ok(Number.isInteger(width), "`width` must be an integer; was " + width);
        assert_1.default.ok(width > 0, "`width` must be greater than 0; was " + width);
        assert_1.default.ok(Number.isInteger(height), "`height` must be an integer; was " + height);
        assert_1.default.ok(height > 0, "`height` must be greater than 0; was " + height);
        assert_1.default.ok(Array.isArray(filledCells) || filledCells instanceof immutable_1.Collection.Indexed, "`filledCells` must be an array or an indexed Immutable collection; was " + filledCells);
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
            filledCells: (0, immutable_1.List)((0, immutable_1.fromJS)(filledCells))
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
        return this.filledCells.reduce((colors, cell) => {
            return colors.add(cell.get("color"));
        }, (0, immutable_1.OrderedSet)()).toList();
    }
    toString() {
        let filledSummary = this.filledCells.map((cell) => `${cell.get("position").get(0)},${cell.get("position").get(1)}:${cell.get("color")}`).join("; ");
        if (filledSummary) {
            filledSummary = ", filledCells: " + filledSummary;
        }
        return `Board<${this.width}x${this.height}${filledSummary}>`;
    }
    toGraphicalString({ startCell, playerColors = this.getPlayerColors(), } = {}) {
        const separator = " ";
        playerColors = (0, immutable_1.List)(playerColors);
        if (startCell && !(0, immutable_1.isImmutable)(startCell)) {
            startCell = (0, immutable_1.fromJS)(startCell);
        }
        const filledMap = this.filledCells.reduce((filled, filledCell) => {
            return filled.set((0, immutable_1.List)(filledCell.get("position")), filledCell.get("color"));
        }, (0, immutable_1.Map)());
        const legend = playerColors.map((color, index) => `${index}: ${color}`).join("\n");
        const grid = [...new Array(this.height)].map((nothing, rowIndex) => [...new Array(this.width)].map((nothing, columnIndex) => {
            const filledMapCell = filledMap.get((0, immutable_1.List)([columnIndex, rowIndex]));
            if (filledMapCell) {
                const colorIndex = playerColors.indexOf(filledMapCell);
                if (startCell &&
                    startCell.getIn(["position", 0]) === columnIndex &&
                    startCell.getIn(["position", 1]) === rowIndex) {
                    return `^${colorIndex}`;
                }
                return ` ${colorIndex}`;
            }
            return " -";
        }).join(separator)).join("\n");
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
        return this.update("filledCells", (filled) => filled.push(...cells.map((cell) => (0, immutable_1.fromJS)(cell))));
    }
    /**
     * Gets information about the cell at the specified coordinates.
     *
     * @param {Types.BoardPosition|Types.BoardPositionImmutable} position - the position of the cell to get
     *
     * @return {external:Immutable.Map<{position: Types.BoardPositionImmutable, color: string}>} the cell information
     */
    getCell(position) {
        assert_1.default.ok(position[0] < this.width && position[0] >= 0, `Column index must be within the board; column index was ${position[0]}, board width was ${this.width}`);
        assert_1.default.ok(position[1] < this.height && position[1] >= 0, `Row index must be within the board; row index was ${position[0]}, board height was ${this.height}`);
        position = (0, immutable_1.List)(position);
        const filled = this.filledCells.find((cell) => (0, immutable_1.is)(cell.get("position"), position));
        return (0, immutable_1.Map)({
            position,
            color: filled && filled.get("color"),
        });
    }
}
exports.default = ImmutableBoard;
