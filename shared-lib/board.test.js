import assert from "assert";
import { List, fromJS } from "immutable";
import * as immutableMatchers from "jest-immutable-matchers";
import Board from "./board";
import { DEFAULT_COLORS } from "./__test__/utils";

beforeAll(() => {
	jest.addMatchers(immutableMatchers);
});

describe("shared-lib", () => {
	describe("Board", () => {
		describe("constructor", () => {
			it("should throw an assertion error if width is undefined", () => {
				expect(
					() => new Board({
						height: 5,
					})
				).toThrow(assert.AssertionError);
			});

			it("should throw an assertion error if width is less than 0", () => {
				expect(
					() => new Board({
						width: -2
					})
				).toThrow(assert.AssertionError);
			});

			it("should throw an assertion error if width is not an integer", () => {
				expect(
					() => new Board({
						width: 5.6
					})
				).toThrow(assert.AssertionError);
			});
			
			it("should throw an assertion error if height is undefined", () => {
				expect(
					() => new Board({
						width: 5
					})
				).toThrow(assert.AssertionError);
			});

			it("should throw an assertion error if height is less than 0", () => {
				expect(
					() => new Board({
						height: -2
					})
				).toThrow(assert.AssertionError);
			});

			it("should throw an assertion error if height is not an integer", () => {
				expect(
					() => new Board({
						height: 5.6
					})
				).toThrow(assert.AssertionError);
			});

			it("should throw an assertion error if filledCells is not an array", () => {
				expect(
					() => new Board({
						width: 5,
						height: 5,
						filledCells: "not proper"
					})
				).toThrow(assert.AssertionError);
			});

			it("should not throw an error if all parameters are valid", () => {
				expect(
					() => new Board({
						width: 5,
						height: 5,
						filledCells: []
					})
				).not.toThrow();
			});
		});

		describe("getCell", () => {
			const board = new Board({
				width: 10,
				height: 10,
				filledCells: [
					{
						position: [1, 1],
						color: DEFAULT_COLORS[0],
					},
				],
			});

			it("should throw an assertion error if passed a negative column or row index", () => {
				expect(
					// eslint-disable-next-line no-magic-numbers
					() => board.getCell([-1, 2])
				).toThrow(assert.AssertionError);
				expect(
					// eslint-disable-next-line no-magic-numbers
					() => board.getCell([1, -2])
				).toThrow(assert.AssertionError);
			});

			it("should throw an assertion error if passed a column or row index outside the board bounds", () => {
				expect(
					// eslint-disable-next-line no-magic-numbers
					() => board.getCell([20, 1])
				).toThrow(assert.AssertionError);
				expect(
					// eslint-disable-next-line no-magic-numbers
					() => board.getCell([1, 20])
				).toThrow(assert.AssertionError);
			});

			it("should return a Map with `position` and `color` properties", () => {
				const cell = board.getCell([1, 1]);
				expect(cell.has("position")).toBeTruthy();
				expect(cell.has("color")).toBeTruthy();
				expect(cell.get("color")).toBe(DEFAULT_COLORS[0], "cell color is correct");
			});
		});

		describe("getPlayerColors", () => {
			it("should return colors in the order of cells filled", () => {
				const board = new Board({
					width: 20,
					height: 20,
					filledCells: [
						/* eslint-disable no-magic-numbers */
						{
							position: [2, 2],
							color: DEFAULT_COLORS[0],
						},
						{
							position: [4, 4],
							color: DEFAULT_COLORS[2],
						},
						{
							position: [0, 0],
							color: DEFAULT_COLORS[4],
						},
						/* eslint-enable no-magic-numbers */
					],
				});

				expect(board.getPlayerColors()).toEqualImmutable(List([
					DEFAULT_COLORS[0],
					DEFAULT_COLORS[2],
					DEFAULT_COLORS[4],
				]));
			});

			it("should not return duplicate colors", () => {
				const board = new Board({
					width: 20,
					height: 20,
					filledCells: [
						/* eslint-disable no-magic-numbers */
						{
							position: [2, 2],
							color: DEFAULT_COLORS[0],
						},
						{
							position: [4, 4],
							color: DEFAULT_COLORS[2],
						},
						{
							position: [0, 0],
							color: DEFAULT_COLORS[4],
						},
						{
							position: [10, 2],
							color: DEFAULT_COLORS[0],
						},
						/* eslint-enable no-magic-numbers */
					],
				});

				expect(board.getPlayerColors()).toEqualImmutable(List([
					DEFAULT_COLORS[0],
					DEFAULT_COLORS[2],
					DEFAULT_COLORS[4],
				]));
			});

			it("should return an empty List if no cells have been filled", () => {
				const board = new Board({
					width: 20,
					height: 20,
					filledCells: [],
				});

				expect(board.getPlayerColors()).toEqualImmutable(List());
			});
		});

		describe("toString", () => {
			it("should return a string representation of the board", () => {
				const width = 20;
				const height = 15;

				const board = new Board({
					width,
					height,
					filledCells: [
						{
							// eslint-disable-next-line no-magic-numbers
							position: [1, 2],
							color: DEFAULT_COLORS[0],
						},
						{
							// eslint-disable-next-line no-magic-numbers
							position: [10, 2],
							color: DEFAULT_COLORS[1],
						},
					],
				});

				expect(board.toString()).toBe(`Board<${width}x${height}, filledCells: 1,2:${DEFAULT_COLORS[0]}; 10,2:${DEFAULT_COLORS[1]}>`);
			});

			it("should not include a summary of filled cells if there are no filled cells", () => {
				const width = 20;
				const height = 15;

				const board = new Board({
					width,
					height,
					filledCells: [],
				});

				expect(board.toString()).toBe(`Board<${width}x${height}>`);
			});
		});

		describe("toGraphicalString", () => {
			it("should return a string representation of the board in grid format", () => {
				const width = 10;
				const height = 10;

				const board = new Board({
					width,
					height,
					filledCells: [
						{
							// eslint-disable-next-line no-magic-numbers
							position: [1, 2],
							color: DEFAULT_COLORS[0],
						},
						{
							// eslint-disable-next-line no-magic-numbers
							position: [9, 2],
							color: DEFAULT_COLORS[1],
						},
					],
				});

				const expected = `0: ${DEFAULT_COLORS[0]}
1: ${DEFAULT_COLORS[1]}

 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  0  -  -  -  -  -  -  -  1
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
`;

				expect(board.toGraphicalString()).toBe(expected);
			});

			it("should mark the start cell if specified", () => {
				const width = 10;
				const height = 10;

				const startCell = {
					// eslint-disable-next-line no-magic-numbers
					position: [9, 2],
					color: DEFAULT_COLORS[1],
				};

				const board = new Board({
					width,
					height,
					filledCells: [
						{
							// eslint-disable-next-line no-magic-numbers
							position: [1, 2],
							color: DEFAULT_COLORS[0],
						},
						startCell,
					],
				});

				const expected = `0: ${DEFAULT_COLORS[0]}
1: ${DEFAULT_COLORS[1]}

 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  0  -  -  -  -  -  -  - ^1
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
`;

				expect(board.toGraphicalString({
					// eslint-disable-next-line no-magic-numbers
					startCell,
				})).toBe(expected);
			});

			it("should respect the passed in player colors if specified", () => {
				const width = 10;
				const height = 10;

				const player1color = "taupe";
				const player2color = "magenta";

				const board = new Board({
					width,
					height,
					filledCells: [
						{
							// eslint-disable-next-line no-magic-numbers
							position: [1, 2],
							color: player1color,
						},
						{
							// eslint-disable-next-line no-magic-numbers
							position: [9, 2],
							color: player2color,
						},
					],
				});

				const expected = `0: ${player1color}
1: ${player2color}

 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  0  -  -  -  -  -  -  -  1
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
`;

				expect(board.toGraphicalString({
					playerColors: [
						player1color,
						player2color,
					],
				})).toBe(expected);
			});

			it("should not include the legend if there are no filled cells", () => {
				const width = 10;
				const height = 10;

				const board = new Board({
					width,
					height,
				});

				const expected = ` -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
`;

				expect(board.toGraphicalString()).toBe(expected);
			});
		});

		describe("fillCells", () => {
			it("should append the new cells to the filledCells in the order passed", () => {
				const width = 10;
				const height = 10;

				const filledCells = [
					{
						position: [0, 0],
						color: DEFAULT_COLORS[0],
					},
					{
						// eslint-disable-next-line no-magic-numbers
						position: [9, 9],
						color: DEFAULT_COLORS[1],
					},
				];
				
				let board = new Board({
					width,
					height,
					filledCells,
				});
				
				expect(board.get("filledCells")).toEqualImmutable(fromJS(filledCells));
				
				const additionalCells = [
					{
						position: [1, 0],
						color: DEFAULT_COLORS[0],
					},
					{
						// eslint-disable-next-line no-magic-numbers
						position: [9, 8],
						color: DEFAULT_COLORS[1],
					},
				];
				
				filledCells.push(...additionalCells);
				
				board = board.fillCells(...additionalCells);
				
				expect(board.get("filledCells")).toEqualImmutable(fromJS(filledCells));
			});
		});
	});
});
