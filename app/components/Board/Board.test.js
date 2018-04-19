import React from "react";
import { fromJS, Set } from "immutable";
import { mount } from "enzyme";
import Board from "./index";
import Cell from "./Cell";
import { unwrapComponent } from "@app/utils/test-utils";

const UnwrappedCell = unwrapComponent(Cell);

describe("Board component", () => {
	it("should render a table with a cell for each square", () => {
		const width = 10;
		const height = 12;

		const board = fromJS({
			width,
			height,
			filled: [],
		});

		const wrapper = mount(
			<Board
				board={board}
			/>
		);

		expect(wrapper.find(Cell)).toHaveLength(width * height);
	});

	
	it("should mark cells in quintros", () => {
		const width = 10;
		const height = 12;

		const color = "blue";

		const filled = fromJS([
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

		const board = fromJS({
			width,
			height,
			filled,
		});

		const quintros = Set([
			filled,
		]);

		const wrapper = mount(
			<Board
				board={board}
				quintros={quintros}
				gameIsOver
			/>
		);

		const cells = wrapper.find(UnwrappedCell);

		const quintroCells = cells.filterWhere((cell) => {
			// `cell` is the Cell component; the class is on the <td> that is its root
			// DOM element
			return cell.childAt(0).hasClass(cell.prop("classes").quintroMember);
		});

		expect(quintroCells).toHaveLength(filled.size);
	});

	it("should trigger the click handler when a cell is clicked", () => {
		const width = 10;
		const height = 12;

		const color = "blue";

		const filled = fromJS([
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

		const board = fromJS({
			width,
			height,
			filled,
		});

		const quintros = Set([
			filled,
		]);

		const cellClickHandler = jest.fn();

		const wrapper = mount(
			<Board
				board={board}
				onCellClick={cellClickHandler}
				quintros={quintros}
				gameIsOver
			/>
		);

		wrapper.find(Cell).first().simulate("click");

		expect(cellClickHandler).toHaveBeenCalledWith({
			cell: filled.first().set("isQuintroMember", true),
		});

		// cell at {width} should be the first cell of the second
		// row, since board cells are rendered in row-major order,
		// from left to right. So cell at index {width - 1} is the
		// last cell of the first row, and the cell at the next
		// index is the first cell of the second row
		wrapper.find(Cell).at(width).simulate("click");

		expect(cellClickHandler).toHaveBeenCalledWith({
			cell: fromJS({
				position: [0, 1],
				isQuintroMember: false,
			}),
		});
	});
});
