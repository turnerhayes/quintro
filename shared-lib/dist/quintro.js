"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const assert_1 = __importDefault(require("assert"));
const schema = {
    cells: (0, immutable_1.List)(),
    color: undefined,
    numberOfEmptyCells: 0,
};
const SERIALIZED_SEPARATOR = ";";
/**
 * The minimum length for a quintro.
 *
 * @default
 * @memberof shared-lib.Quintro
 */
const QUINTRO_LENGTH = 5;
// Adapted from https://stackoverflow.com/a/7616484/324399
function stringHash(str) {
    let hash = 0, i, chr;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        // eslint-disable-next-line no-magic-numbers
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
/**
 * Represents a quintro or potential quintro.
 *
 * @extends external:Immutable.Record
 * @memberof shared-lib
 */
class Quintro extends (0, immutable_1.Record)(schema, "Quintro") {
    static QUINTRO_LENGTH = QUINTRO_LENGTH;
    _serialized = null;
    /**
     * @param {object} args - the constructor args
     * @param {external:Immutable.List<Types.Cell|external:Immutable.Map>|Array<Types.Cell|external:Immutable.Map>} args.cells - the
     *	cells in this quintro
     *
     * @throws {AssertionError} the collection of cells contains occupied cells with different colors
     */
    constructor(args) {
        const cells = (0, immutable_1.fromJS)(args.cells);
        let quintroColor;
        let numberOfEmptyCells = 0;
        cells.forEach((cell) => {
            const color = cell.get("color");
            if (!color) {
                numberOfEmptyCells += 1;
                return;
            }
            if (quintroColor === undefined) {
                quintroColor = color;
                return;
            }
            assert_1.default.equal(quintroColor, color, `A quintro may only contain filled cells of one color; found at least two colors (${quintroColor} and ${color}`);
        });
        (0, assert_1.default)(quintroColor !== undefined, "Cannot create a quintro with only empty cells");
        args.numberOfEmptyCells = numberOfEmptyCells;
        args.color = quintroColor;
        super({
            ...args,
            cells,
        });
    }
    /**
     * The collection of cells in this quintro.
     *
     * @member {external:Immutable.List<Types.Cell>} cells
     * @memberof shared-lib.quintro
     */
    /**
     * The color of any filled cells in this quintro.
     *
     * @member {string} color
     * @memberof shared-lib.quintro
     */
    /**
     * The number of unoccupied cells in this quintro.
     *
     * @member {number} numberOfEmptyCells
     * @memberof shared-lib.quintro
     */
    /**
     * Returns a serialized string representation of the specified cell.
     *
     * @private
     *
     * @return {string} the serialized quintro
     */
    _serializeCell(cell) {
        const obj = { position: cell.get("position") };
        if (cell.get("color")) {
            obj.color = cell.get("color");
        }
        return JSON.stringify(obj);
    }
    /**
     * Returns a serialized string representation of this quintro. This value can be used to
     * determine if two {@link shared-lib.Quintro|Quintros} represent the same set of cells.
     *
     * @return {string} the serialized quintro
     */
    serialize() {
        if (!this._serialized) {
            this._serialized = this.cells.map(this._serializeCell).join(SERIALIZED_SEPARATOR);
        }
        return this._serialized;
    }
    /**
     * Returns a string representation of this quintro.
     *
     * @return {string} string representation of this quintro
     */
    toString() {
        return `Quintro<${this.serialize()}>`;
    }
    /**
     * Determines whether this quintro represents the same set of cells as another
     * (without regard to the colors in the cells, if any).
     *
     * @param {*} other - the other object to check equality against
     *
     * @return {boolean} false if the other is not a Quintro object or the cells
     * are not the same sets
     */
    cellsAreInSamePositions(other) {
        if (!(other instanceof Quintro)) {
            return false;
        }
        return (0, immutable_1.is)(this.cells.map((cell) => cell.delete("color")), other.cells.map((cell) => cell.delete("color")));
    }
    /**
     * Determines whether this quintro is equivalent to another.
     *
     * @return whether or not the quintros are equivalent
     */
    equals(other) {
        if (!(other instanceof Quintro)) {
            return false;
        }
        return this.serialize() === other.serialize();
    }
    /**
     * Returns a hash code for this quintro.
     *
     * @return the quintro's hash code
     */
    hashCode() {
        return stringHash(this.serialize());
    }
    /**
     * Determines whether the specified position exists in this quintro.
     *
     * @param position - the position of the cell to check
     *
     * @return whether or not the cell is in the quintro
     */
    containsCell({ position }) {
        return !!this.cells.find((cell) => (0, immutable_1.is)(cell.get("position"), (0, immutable_1.List)(position)));
    }
}
exports = module.exports = Quintro;
