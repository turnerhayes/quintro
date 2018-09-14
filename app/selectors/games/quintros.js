import { getQuintros as _getQuintros, getQuintrosForCell as _getQuintrosForCell } from "@shared-lib/quintro/utils";
import { createSelector } from "reselect";

const getBoard = (state) => state.get("board");

export const getQuintrosForCell = createSelector(
	getBoard,
	(state, props) => props,
	_getQuintrosForCell
);

export const getQuintros = createSelector(
	getBoard,
	(state, props) => props,
	_getQuintros
);
