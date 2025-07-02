import React from "react";
import { fromJS, Set } from "immutable";
import { shallow } from "enzyme";

import BoardRecord from "@shared-lib/board";
import Quintro from "@shared-lib/quintro";

import { Unwrapped as Board } from "./Board";
import Cell from "./Cell";

describe("Board component", () => {
	it("should render a table with a cell for each square", () => {
		const width = 10;
		const height = 12;

		const board = new BoardRecord({
			width,
			height,
			filledCells: [],
		});

		const wrapper = shallow(
			<Board
				board={board}
				classes={{}}
			/>
		).shallow();

		expect(wrapper.find(Cell)).toHaveLength(width * height);
	});

	
	it("should mark cells in quintros", () => {
		const width = 10;
		const height = 12;

		const color = "blue";

		const filledCells = fromJS([
			/* eslint-disable no-magic-numbers */
			{
				position: [0, 0],
				color,
			},

			{
				position: [1, 1],
				color,
			},

			{
				position: [2, 2],
				color,
			},

			{
				position: [3, 3],
				color,
			},

			{
				position: [4, 4],
				color,
			},

			{
				position: [5, 5],
				color,
			},
			/* eslint-enable no-magic-numbers */
		]);

		const board = new BoardRecord({
			width,
			height,
			filledCells,
		});

		const quintros = Set([
			new Quintro({ cells: filledCells, }),
		]);

		const wrapper = shallow(
			<Board
				board={board}
				quintros={quintros}
				gameIsOver
				classes={{}}
			/>
		).shallow();

		const cells = wrapper.find(Cell);

		const quintroCells = cells.filterWhere((cell) => {
			return cell.prop("cell").get("isQuintroMember");
		});

		expect(quintroCells).toHaveLength(filledCells.size);
	});

	it("should trigger the click handler when a cell is clicked", () => {
		const width = 10;
		const height = 12;

		const color = "blue";

		const filledCells = fromJS([
			/* eslint-disable no-magic-numbers */
			{
				position: [0, 0],
				color,
			},

			{
				position: [1, 1],
				color,
			},

			{
				position: [2, 2],
				color,
			},

			{
				position: [3, 3],
				color,
			},

			{
				position: [4, 4],
				color,
			},

			{
				position: [5, 5],
				color,
			},
			/* eslint-enable no-magic-numbers */
		]);

		const board = new BoardRecord({
			width,
			height,
			filledCells,
		});

		const quintros = Set([
			new Quintro({ cells: filledCells, }),
		]);

		const cellClickHandler = jest.fn();

		const wrapper = shallow(
			<Board
				board={board}
				classes={{}}
				onCellClick={cellClickHandler}
				quintros={quintros}
				gameIsOver
			/>
		).shallow();

		const firstTd = wrapper.find(Cell).first().shallow().dive();

		firstTd.simulate("click");

		expect(cellClickHandler).toHaveBeenCalledWith({
			cell: filledCells.first().set("isQuintroMember", true),
		});

		// cell at {width} should be the first cell of the second
		// row, since board cells are rendered in row-major order,
		// from left to right. So cell at index {width - 1} is the
		// last cell of the first row, and the cell at the next
		// index is the first cell of the second row
		wrapper.find(Cell).at(width).first().shallow().dive().simulate("click");

		expect(cellClickHandler).toHaveBeenCalledWith({
			cell: fromJS({
				position: [0, 1],
				isQuintroMember: false,
			}),
		});
	});

	it("should not allow placement on a filled cell", () => {
		const width = 10;
		const height = 10;

		const color = "blue";

		const filledCells = fromJS([
			/* eslint-disable no-magic-numbers */
			{
				position: [0, 0],
				color,
			},
			/* eslint-enable no-magic-numbers */
		]);

		const board = new BoardRecord({
			width,
			height,
			filledCells,
		});

		const wrapper = shallow(
			<Board
				board={board}
				classes={{}}
				allowPlacement
			/>
		).shallow();

		expect(wrapper.find(Cell).first()).toHaveProp("allowPlacement", false);
		// make sure unfilled cells do allow placement
		expect(wrapper.find(Cell).at(1)).toHaveProp("allowPlacement", true);
	});
});
