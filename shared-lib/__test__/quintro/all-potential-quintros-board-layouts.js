const {
	generateLayout
}                  = require("./utils");

exports = module.exports = {
	"sample board": generateLayout({
		grid: `
		-  -  -  -  -  -  -  -  -  -
		1  1  1  -  -  1  1  2  -  -
		-  -  2  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  2  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  2  -  -  -  2  -  -
		-  -  -  -  2  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		`,
		ranges: [
			/// Horizontal
			"0-6,1", // player 1

			"0-4,2", // player 2

			"0-4,5", // player 2

			"0-4,6", // player 2

			"1-5,2", // player 2

			"1-5,5", // player 2

			"1-5,6", // player 2

			"2-6,2", // player 2

			"2-6,6", // player 2

			"3-7,3", // player 2

			"3-7,5", // player 2

			"3-7,6", // player 2

			"4-8,3", // player 2

			"4-8,6", // player 2

			"5-9,3", // player 2

			"5-9,5", // player 2

			/// Vertical
			"0,0-4", // player 1

			"0,1-5", // player 1

			"1,0-4", // player 1

			"1,1-5", // player 1

			"2,2-6", // player 2

			"3,1-5", // player 2

			"3,2-6", // player 2

			"3,3-7", // player 2

			"3,4-8", // player 2

			"3,5-9", // player 2

			"4,2-6", // player 2

			"4,3-7", // player 2

			"4,4-8", // player 2

			"4,5-9", // player 2

			"5,0-4", // player 1

			"5,1-5", // player 1

			"6,0-4", // player 1

			"6,1-5", // player 1

			"7,1-5", // player 1

			"7,3-7", // player 2

			"7,5-9", // player 2

			/// Top left to bottom right
			"0-4,1-5", // player 1

			"0-4,2-6", // player 2

			"1-5,0-4", // player 1

			"1-5,3-7", // player 2

			"2-6,1-5", // player 1

			"2-6,2-6", // player 2

			"2-6,4-8", // player 2

			"3-7,5-9", // player 2

			"3-7,1-5", // player 2

			"4-8,2-6", // player 2

			"5-9,0-4", // player 1

			"5-9,3-7", // player 2

			/// Top right to bottom left
			"0-4,4-0", // player 2

			"0-4,8-4", // player 2

			"1-5,5-1", // player 2

			"1-5,7-3", // player 2

			"1-5,9-5", // player 2

			"2-6,4-0", // player 1

			"2-6,5-1", // player 1

			"3-7,4-0", // player 1

			"3-7,5-1", // player 2

			"3-7,7-3", // player 2

			"3-7,9-5", // player 2

			"4-8,6-2", // player 2

			"4-8,8-4", // player 2

			"5-9,7-3", // player 2
		],
	}),
};
