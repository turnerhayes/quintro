import assert       from "assert";
import {
	Record,
	List,
	fromJS
}                   from "immutable";
import Board        from "project/shared-lib/board";


const schema = {
	width: null,
	height: null,
	filled: List()
};

class BoardRecord extends Record(schema, "Board") {
	constructor(args) {
		assert(
			args.width && args.height,
			'Must specify "width" and "height" properties'
		);

		if (args.filled) {
			args.filled = fromJS(args.filled);
		}

		super(args);
	}

	quintros({startCell = this.filled.last()} = {}) {
		return Board.getQuintros({
			boardWidth: this.width,
			boardHeight: this.height,
			filledCells: this.filled.toJS(),
			startCell: startCell.toJS()
		});
	}
}

export default BoardRecord;
