"use strict";
const { Map, Set, fromJS } = require("immutable");
const Quintro = require("@shared-lib/quintro");
const { generateLayout, } = require("./utils");
const { DEFAULT_COLORS } = require("../utils");
/* eslint-disable no-magic-numbers */
function generateDeltaBoardLayout({ grid, newCell, delta }) {
    const layout = generateLayout({
        grid
    });
    layout.newCell = fromJS(newCell);
    layout.delta = Map({
        added: Set(delta.added),
        removed: Set(delta.removed),
        changed: Set(fromJS(delta.changed))
    });
    return layout;
}
exports = module.exports = {
    "completing two quintros": generateDeltaBoardLayout({
        grid: `
		-  -  -  -  2  -  -  -  -  -
		-  -  -  -  -  2  1  1  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  1  1  2  -  -
		-  -  -  -  1  -  1  -  2  -
		-  -  -  1  -  -  1  -  -  -
		-  -  1  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		`,
        newCell: {
            position: [6, 2],
            color: DEFAULT_COLORS[0],
        },
        delta: {
            added: [
                new Quintro({
                    cells: [
                        {
                            position: [2, 2]
                        },
                        {
                            position: [3, 2]
                        },
                        {
                            position: [4, 2]
                        },
                        {
                            position: [5, 2]
                        },
                        {
                            position: [6, 2],
                            color: DEFAULT_COLORS[0]
                        }
                    ],
                    color: DEFAULT_COLORS[0],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [3, 2]
                        },
                        {
                            position: [4, 2]
                        },
                        {
                            position: [5, 2]
                        },
                        {
                            position: [6, 2],
                            color: DEFAULT_COLORS[0]
                        },
                        {
                            position: [7, 2]
                        }
                    ],
                    color: DEFAULT_COLORS[0],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [4, 2]
                        },
                        {
                            position: [5, 2]
                        },
                        {
                            position: [6, 2],
                            color: DEFAULT_COLORS[0]
                        },
                        {
                            position: [7, 2]
                        },
                        {
                            position: [8, 2]
                        }
                    ],
                    color: DEFAULT_COLORS[0],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [5, 2]
                        },
                        {
                            position: [6, 2],
                            color: DEFAULT_COLORS[0]
                        },
                        {
                            position: [7, 2]
                        },
                        {
                            position: [8, 2]
                        },
                        {
                            position: [9, 2]
                        }
                    ],
                    color: DEFAULT_COLORS[0],
                })
            ],
            removed: [
                new Quintro({
                    cells: [
                        {
                            position: [4, 0],
                            color: DEFAULT_COLORS[1],
                        },
                        {
                            position: [5, 1],
                            color: DEFAULT_COLORS[1],
                        },
                        {
                            position: [6, 2],
                        },
                        {
                            position: [7, 3],
                            color: DEFAULT_COLORS[1],
                        },
                        {
                            position: [8, 4],
                            color: DEFAULT_COLORS[1],
                        },
                    ]
                }),
            ],
            changed: [
                {
                    quintro: new Quintro({
                        cells: [
                            {
                                position: [6, 1],
                                color: DEFAULT_COLORS[0],
                            },
                            {
                                position: [6, 2],
                                color: DEFAULT_COLORS[0],
                            },
                            {
                                position: [6, 3],
                                color: DEFAULT_COLORS[0],
                            },
                            {
                                position: [6, 4],
                                color: DEFAULT_COLORS[0],
                            },
                            {
                                position: [6, 5],
                                color: DEFAULT_COLORS[0],
                            },
                        ]
                    }),
                    changedCells: [
                        undefined,
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [6, 2],
                            color: DEFAULT_COLORS[0],
                        },
                        undefined,
                        undefined,
                        undefined,
                    ],
                },
                {
                    quintro: new Quintro({
                        cells: [
                            {
                                position: [2, 6],
                                color: DEFAULT_COLORS[0],
                            },
                            {
                                position: [3, 5],
                                color: DEFAULT_COLORS[0],
                            },
                            {
                                position: [4, 4],
                                color: DEFAULT_COLORS[0],
                            },
                            {
                                position: [5, 3],
                                color: DEFAULT_COLORS[0],
                            },
                            {
                                position: [6, 2],
                                color: DEFAULT_COLORS[0],
                            },
                            {
                                position: [7, 1],
                                color: DEFAULT_COLORS[0],
                            },
                        ]
                    }),
                    changedCells: [
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        {
                            position: [6, 2],
                            color: DEFAULT_COLORS[0],
                        },
                        undefined,
                    ],
                },
            ],
        },
    }),
    "adding to empty grid": generateDeltaBoardLayout({
        grid: `
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		`,
        newCell: {
            position: [5, 5],
            color: DEFAULT_COLORS[0],
        },
        delta: {
            added: [
                new Quintro({
                    cells: [
                        {
                            position: [1, 1],
                        },
                        {
                            position: [2, 2],
                        },
                        {
                            position: [3, 3],
                        },
                        {
                            position: [4, 4],
                        },
                        {
                            position: [5, 5],
                            color: DEFAULT_COLORS[0],
                        }
                    ],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [5, 5],
                            color: DEFAULT_COLORS[0],
                        },
                        {
                            position: [6, 6],
                        },
                        {
                            position: [7, 7],
                        },
                        {
                            position: [8, 8],
                        },
                        {
                            position: [9, 9],
                        }
                    ],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [2, 2],
                        },
                        {
                            position: [3, 3],
                        },
                        {
                            position: [4, 4],
                        },
                        {
                            position: [5, 5],
                            color: DEFAULT_COLORS[0],
                        },
                        {
                            position: [6, 6],
                        }
                    ],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [5, 1],
                        },
                        {
                            position: [5, 2],
                        },
                        {
                            position: [5, 3],
                        },
                        {
                            position: [5, 4],
                        },
                        {
                            position: [5, 5],
                            color: DEFAULT_COLORS[0],
                        }
                    ],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [2, 5],
                        },
                        {
                            position: [3, 5],
                        },
                        {
                            position: [4, 5],
                        },
                        {
                            position: [5, 5],
                            color: DEFAULT_COLORS[0],
                        },
                        {
                            position: [6, 5],
                        }
                    ],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [5, 2],
                        },
                        {
                            position: [5, 3],
                        },
                        {
                            position: [5, 4],
                        },
                        {
                            position: [5, 5],
                            color: DEFAULT_COLORS[0],
                        },
                        {
                            position: [5, 6],
                        }
                    ],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [4, 6],
                        },
                        {
                            position: [5, 5],
                            color: DEFAULT_COLORS[0],
                        },
                        {
                            position: [6, 4],
                        },
                        {
                            position: [7, 3],
                        },
                        {
                            position: [8, 2],
                        }
                    ],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [5, 5],
                            color: DEFAULT_COLORS[0],
                        },
                        {
                            position: [6, 4],
                        },
                        {
                            position: [7, 3],
                        },
                        {
                            position: [8, 2],
                        },
                        {
                            position: [9, 1],
                        }
                    ],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [1, 9],
                        },
                        {
                            position: [2, 8],
                        },
                        {
                            position: [3, 7],
                        },
                        {
                            position: [4, 6],
                        },
                        {
                            position: [5, 5],
                            color: DEFAULT_COLORS[0],
                        }
                    ],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [3, 3],
                        },
                        {
                            position: [4, 4],
                        },
                        {
                            position: [5, 5],
                            color: DEFAULT_COLORS[0],
                        },
                        {
                            position: [6, 6],
                        },
                        {
                            position: [7, 7],
                        }
                    ],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [2, 8],
                        },
                        {
                            position: [3, 7],
                        },
                        {
                            position: [4, 6],
                        },
                        {
                            position: [5, 5],
                            color: DEFAULT_COLORS[0],
                        },
                        {
                            position: [6, 4],
                        }
                    ],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [5, 3],
                        },
                        {
                            position: [5, 4],
                        },
                        {
                            position: [5, 5],
                            color: DEFAULT_COLORS[0],
                        },
                        {
                            position: [5, 6],
                        },
                        {
                            position: [5, 7],
                        }
                    ],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [3, 5],
                        },
                        {
                            position: [4, 5],
                        },
                        {
                            position: [5, 5],
                            color: DEFAULT_COLORS[0],
                        },
                        {
                            position: [6, 5],
                        },
                        {
                            position: [7, 5],
                        }
                    ],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [3, 7],
                        },
                        {
                            position: [4, 6],
                        },
                        {
                            position: [5, 5],
                            color: DEFAULT_COLORS[0],
                        },
                        {
                            position: [6, 4],
                        },
                        {
                            position: [7, 3],
                        }
                    ],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [4, 5],
                        },
                        {
                            position: [5, 5],
                            color: DEFAULT_COLORS[0],
                        },
                        {
                            position: [6, 5],
                        },
                        {
                            position: [7, 5],
                        },
                        {
                            position: [8, 5],
                        }
                    ],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [5, 4],
                        },
                        {
                            position: [5, 5],
                            color: DEFAULT_COLORS[0],
                        },
                        {
                            position: [5, 6],
                        },
                        {
                            position: [5, 7],
                        },
                        {
                            position: [5, 8],
                        }
                    ],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [4, 4],
                        },
                        {
                            position: [5, 5],
                            color: DEFAULT_COLORS[0],
                        },
                        {
                            position: [6, 6],
                        },
                        {
                            position: [7, 7],
                        },
                        {
                            position: [8, 8],
                        }
                    ],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [5, 5],
                            color: DEFAULT_COLORS[0],
                        },
                        {
                            position: [5, 6],
                        },
                        {
                            position: [5, 7],
                        },
                        {
                            position: [5, 8],
                        },
                        {
                            position: [5, 9],
                        }
                    ],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [5, 5],
                            color: DEFAULT_COLORS[0],
                        },
                        {
                            position: [6, 5],
                        },
                        {
                            position: [7, 5],
                        },
                        {
                            position: [8, 5],
                        },
                        {
                            position: [9, 5],
                        }
                    ],
                }),
                new Quintro({
                    cells: [
                        {
                            position: [1, 5],
                        },
                        {
                            position: [2, 5],
                        },
                        {
                            position: [3, 5],
                        },
                        {
                            position: [4, 5],
                        },
                        {
                            position: [5, 5],
                            color: DEFAULT_COLORS[0],
                        }
                    ],
                }),
            ],
            removed: [],
            changed: [],
        },
    }),
    "only removed quintros": generateDeltaBoardLayout({
        grid: `
		-  2  3  -  -  -  -  -  -  -
		1  3  2  -  -  -  -  -  -  -
		1  -  2  -  -  -  -  -  -  -
		1  -  2  -  -  -  -  -  -  -
		1  -  2  -  -  -  -  -  -  -
		2  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		`,
        newCell: {
            position: [0, 0],
            color: DEFAULT_COLORS[2],
        },
        delta: {
            added: [],
            removed: [
                new Quintro({
                    cells: [
                        {
                            position: [0, 0],
                        },
                        {
                            position: [0, 1],
                            color: DEFAULT_COLORS[0],
                        },
                        {
                            position: [0, 2],
                            color: DEFAULT_COLORS[0],
                        },
                        {
                            position: [0, 3],
                            color: DEFAULT_COLORS[0],
                        },
                        {
                            position: [0, 4],
                            color: DEFAULT_COLORS[0],
                        },
                    ],
                }),
            ],
            changed: [],
        },
    }),
};
