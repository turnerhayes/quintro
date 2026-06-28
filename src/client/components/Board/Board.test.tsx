/// <reference types="@vitest/browser-playwright" />

import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import { Board } from "@/client/components/Board/Board";
import type { Game } from "@/types";
import cellStyles from "@/client/components/Board/Cell/Cell.module.css";

import { screen } from "@/client/testing/test-utils";


describe("Board component", () => {
    test("highlights quintros", async () => {
        const game: Game = {
            name: 'test-game',
            players: [
                {
                    id: 1,
                    color: "red",
                },
                {
                    id: 2,
                    color: "blue",
                },
                {
                    id: 3,
                    color: "green",
                },
            ],
            playerLimit: 3,
            board: {
                width: 20,
                height: 20,
                filledCells: [
                    {
                        color: "red",
                        position: [0, 0],
                    },
                    {
                        color: "blue",
                        position: [7, 7],
                    },
                    {
                        color: "green",
                        position: [10, 10],
                    },
                    {
                        color: "red",
                        position: [1, 0],
                    },
                    {
                        color: "blue",
                        position: [7, 8],
                    },
                    {
                        color: "green",
                        position: [10, 9],
                    },
                    {
                        color: "red",
                        position: [2, 0],
                    },
                    {
                        color: "blue",
                        position: [10, 8],
                    },
                    {
                        color: "green",
                        position: [11, 10],
                    },
                    {
                        color: "red",
                        position: [3, 0],
                    },
                    {
                        color: "blue",
                        position: [5, 8],
                    },
                    {
                        color: "green",
                        position: [14, 10],
                    },
                    {
                        color: "red",
                        position: [3, 0],
                    },
                    {
                        color: "blue",
                        position: [5, 8],
                    },
                    {
                        color: "green",
                        position: [14, 10],
                    },
                    {
                        color: "red",
                        position: [4, 0],
                    },
                    {
                        color: "blue",
                        position: [5, 7],
                    },
                    {
                        color: "green",
                        position: [16, 10],
                    },
                ],
            },
            createdAtTimestamp: Date.now() - 10_000,
            startedAtTimestamp: Date.now() - 9_000,
            endedAtTimestamp: Date.now() - 7_000,
            winnerIndex: 0,
        };

        render(
            <Board
                board={game.board}
                gameIsOver
                allowPlacement={false}
                quintros={[
                        {
                            color: "red",
                            numberOfEmptyCells: 0,
                            cells: [
                                {
                                    color: "red",
                                    position: [0, 0],
                                },
                                {
                                    color: "red",
                                    position: [1, 0],
                                },
                                {
                                    color: "red",
                                    position: [2, 0],
                                },
                                {
                                    color: "red",
                                    position: [3, 0],
                                },
                                {
                                    color: "red",
                                    position: [4, 0],
                                },
                            ],
                        },
                ]}
            />
        );

        const cells = await screen.findAllByRole("cell");

        const quintroCells = cells.slice(0, 5);

        for (const cell of quintroCells) {
            expect(cell).toHaveClass(cellStyles.quintroMember);
        }
    });
});