"use strict";

const _ = require("lodash");

const QUINTRO_LENGTH = 5;

function sortFunc(a, b) {
	// sort by column, then row
	return a[0] - b[0] || a[1] - b[1];
}

function getQuintros({boardWidth, boardHeight, filledCells, startCell}) {
	const quintros = {};
	const { color } = startCell;
	const [column, row] = startCell.position;
	const filledMap = _.reduce(
		filledCells,
		(filled, filledCell) => {
			if (filledCell.color === color) {
				const [column, row] = filledCell.position;
				filled[`${column},${row}`] = filledCell.color;
			}

			return filled;
		},
		{}
	);

	{
		// Horizontal check
		const maybeQuintro = [];

		for (let i = column; i >= 0; i--) {
			if (filledMap[`${i},${row}`]) {
				maybeQuintro.unshift([i, row]);
			}
			else {
				break;
			}
		}

		for (let i = column + 1; i < boardWidth; i++) {
			if (filledMap[`${i},${row}`]) {
				maybeQuintro.push([i, row]);
			}
			else {
				break;
			}
		}

		if (maybeQuintro.length >= QUINTRO_LENGTH) {
			quintros.horizontal = maybeQuintro.sort(sortFunc);
		}
	}

	{
		// Vertical check
		const maybeQuintro = [];

		for (let i = row; i >= 0; i--) {
			if (filledMap[`${column},${i}`]) {
				maybeQuintro.unshift([column, i]);
			}
			else {
				break;
			}
		}

		for (let i = row + 1; i < boardHeight; i++) {
			if (filledMap[`${column},${i}`]) {
				maybeQuintro.push([column, i]);
			}
			else {
				break;
			}
		}

		if (maybeQuintro.length >= QUINTRO_LENGTH) {
			quintros.vertical = maybeQuintro.sort(sortFunc);
		}
	}

	{
		// Top-left to bottom-right check
		const maybeQuintro = [];

		for (let i = column, j = row; i >= 0 && j >= 0; i--, j--) {
			if (filledMap[`${i},${j}`]) {
				maybeQuintro.push([i, j]);
			}
			else {
				break;
			}
		}

		for (let i = column + 1, j = row + 1; i < boardWidth && j < boardHeight; i++, j++) {
			if (filledMap[`${i},${j}`]) {
				maybeQuintro.push([i, j]);
			}
			else {
				break;
			}
		}

		if (maybeQuintro.length >= QUINTRO_LENGTH) {
			quintros.topLeft = maybeQuintro.sort(sortFunc);
		}
	}

	{
		// Top-right to bottom-left check
		const maybeQuintro = [];

		for (let i = column, j = row; i < boardWidth && j >= 0; i++, j--) {
			if (filledMap[`${i},${j}`]) {
				maybeQuintro.push([i, j]);
			}
			else {
				break;
			}
		}

		for (let i = column - 1, j = row + 1; i >= 0 && j < boardHeight; i--, j++) {
			if (filledMap[`${i},${j}`]) {
				maybeQuintro.push([i, j]);
			}
			else {
				break;
			}
		}

		if (maybeQuintro.length >= QUINTRO_LENGTH) {
			quintros.topRight = maybeQuintro.sort(sortFunc);
		}
	}

	return quintros;
}


exports = module.exports = {
	getQuintros
};
