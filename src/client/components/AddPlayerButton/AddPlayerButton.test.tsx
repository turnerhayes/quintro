/// <reference types="@vitest/browser-playwright" />

import { AddPlayerButton } from "@/client/components/AddPlayerButton/AddPlayerButton";
import { render, screen } from "@/client/testing/test-utils";
import type { Game } from "@/types";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";

describe('AddPlayerButton component', () => {
    it("changes the color when a new color is selected", async () => {
        const game: Game = {
            name: 'test-game',
            players: [],
            board: {
                width: 10,
                height: 10,
                filledCells: [],
            },
            createdAtTimestamp: Date.now(),
            playerLimit: 3,
            startedAtTimestamp: null,
            winnerIndex: null,
            endedAtTimestamp: null,
        };

        const onAdd = vi.fn();

        render(
            <AddPlayerButton
                game={game}
                onAdd={onAdd}
            />
        );

        const changeColorButton = await screen.findByRole('button', { name: "Choose Player Color" });

        await userEvent.click(changeColorButton);

        const colorOption = await screen.findByRole('menuitem', { name: "Yellow" });
        await userEvent.click(colorOption);

        const addButton = await screen.findByRole('button', { name: "Add Player" });
        await userEvent.click(addButton);

        expect(onAdd).toHaveBeenCalledWith({ color: 'yellow' });
    });
});