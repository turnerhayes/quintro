/// <reference types="@vitest/browser-playwright" />

import { describe, expect, test, vi} from "vitest";
import { userEvent } from "vitest/browser";
import { http, HttpResponse } from "msw";

import { CreateGame } from "@/client/components/CreateGame/CreateGame";
import { worker } from "@/client/testing/browser-mock";
import { render, renderWithRouter, screen } from "@/client/testing/test-utils";
import Config from "@/config";

describe("CreateGame component", () => {
    test("disables the submit button if there are validation errors", async () => {
        render(
            <CreateGame
            />
        );

        const widthInput = await screen.findByRole("spinbutton", { name: "Width" });

        await userEvent.fill(widthInput, "0");

        const submitButton = await screen.findByRole("button", { name: "Create" });

        expect(submitButton).toBeDisabled();
    });

    test("enables the submit button if there are no validation errors", async () => {
        render(
            <CreateGame
            />
        );

        const widthInput = await screen.findByRole("spinbutton", { name: "Width" });
        const heightInput = await screen.findByRole("spinbutton", { name: "Height" });
        const playerLimitInput = await screen.findByRole("spinbutton", { name: "Number of players" });

        await userEvent.fill(widthInput, "10");
        await userEvent.fill(heightInput, "10");
        await userEvent.fill(playerLimitInput, "4");

        const submitButton = await screen.findByRole("button", { name: "Create" });

        expect(submitButton).toBeEnabled();
    });

    test("creates a game on form submission", async () => {
        const gameArgs = {
            width: 12,
            height: 12,
            playerLimit: 5,
        };

        worker.use(
            http.post(`${Config.api.origin}/api/games`, async ({ request }) => {
                const body = await request.json();

                const { width, height, playerLimit } = body as {
                    width: number;
                    height: number;
                    playerLimit: number;
                };

                return HttpResponse.json({ gameName: `${width}w${height}h${playerLimit}p` }, { status: 201 });
            })
        );

        const [, router] = renderWithRouter(
            <CreateGame
            />,
            {
                initialEntries: ["/create-game"],
            }
        );
        
        vi.spyOn(router!, "navigate").mockResolvedValue();

        const widthInput = await screen.findByRole("spinbutton", { name: "Width" });
        const heightInput = await screen.findByRole("spinbutton", { name: "Height" });
        const playerLimitInput = await screen.findByRole("spinbutton", { name: "Number of players" });
        const submitButton = await screen.findByRole("button", { name: "Create" });

        await userEvent.fill(widthInput, gameArgs.width.toString());
        await userEvent.fill(heightInput, gameArgs.height.toString());
        await userEvent.fill(playerLimitInput, gameArgs.playerLimit.toString());

        await userEvent.click(submitButton);

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(router!.navigate).toHaveBeenCalledWith(
            `/game/play/${gameArgs.width}w${gameArgs.height}h${gameArgs.playerLimit}p`,
            // the navigate() hook calls router.navigate() with a second argument we don't care about here
            expect.anything()
        );
    });

    test("toggles keeping board ratio on clicking the keep ratio button", async () => {
        render(
            <CreateGame
            />
        );

        const widthInput = await screen.findByRole("spinbutton", { name: "Width" });
        const heightInput = await screen.findByRole("spinbutton", { name: "Height" });
        const keepRatioButton = await screen.findByRole("button", { name: "Lock ratio" });

        await userEvent.fill(widthInput, "20");
        await userEvent.fill(heightInput, "10");

        expect(widthInput).toHaveValue(20);
        expect(heightInput).toHaveValue(10);

        await userEvent.click(keepRatioButton);

        await userEvent.fill(widthInput, "25");

        expect(widthInput).toHaveValue(25);
        expect(heightInput).toHaveValue(13);

        await userEvent.click(keepRatioButton);

        await userEvent.fill(widthInput, "15");

        expect(widthInput).toHaveValue(15);
        expect(heightInput).toHaveValue(13);
    });

    test("Shows an error message if the creation failed", async () => {
        const gameArgs = {
            width: 12,
            height: 12,
            playerLimit: 5,
        };

        worker.use(
            http.post(`${Config.api.origin}/api/games`, async () => {
                return HttpResponse.json({ message: "Test error" }, { status: 500 });
            })
        );

        const [, router] = renderWithRouter(
            <CreateGame
            />,
            {
                initialEntries: ["/create-game"],
            }
        );
        
        vi.spyOn(router!, "navigate").mockResolvedValue();

        const widthInput = await screen.findByRole("spinbutton", { name: "Width" });
        const heightInput = await screen.findByRole("spinbutton", { name: "Height" });
        const playerLimitInput = await screen.findByRole("spinbutton", { name: "Number of players" });
        const submitButton = await screen.findByRole("button", { name: "Create" });

        await userEvent.fill(widthInput, gameArgs.width.toString());
        await userEvent.fill(heightInput, gameArgs.height.toString());
        await userEvent.fill(playerLimitInput, gameArgs.playerLimit.toString());

        await userEvent.click(submitButton);

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(router!.navigate).not.toHaveBeenCalled();

        const errorMessage = await screen.findByText("Error creating game. Please try again later.");

        expect(errorMessage).toBeInTheDocument();
    });
});