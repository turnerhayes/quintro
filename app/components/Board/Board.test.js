import React from "react";
import { fromJS } from "immutable";
import { mount } from "enzyme";
import Board from "./Board";
import Cell from "./Cell";

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
});
