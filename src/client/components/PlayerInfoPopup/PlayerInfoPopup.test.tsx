import { describe, expect, test, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render, screen } from "@/client/testing/test-utils";
import { PlayerInfoPopup } from "@/client/components/PlayerInfoPopup/PlayerInfoPopup";
import type { Player, SelfPlayer } from "@/types";

describe("PlayerInfoPopup", () => {
    test("should show an edit icon if the player is the current user and current user is anonymous", async () => {
        const player: SelfPlayer = {
            id: 1,
            color: "red",
            isMe: true,
        };

        const anchorEl = document.createElement("div");
        anchorEl.style.width = ""

        document.body.appendChild(anchorEl);

        render(
            <PlayerInfoPopup
                player={player}
                anchorEl={anchorEl}
            />
        );

        await screen.findByText("Anonymous User");

        const editButton = screen.getByRole(
            "button",
            {
                name: "Change display name",
            }
        );

        expect(editButton).toBeInTheDocument();
    });

    test("should not show an edit icon if the player is not the current user", async () => {
        const player: Player = {
            id: 1,
            color: "red",
        };

        const anchorEl = document.createElement("div");
        anchorEl.style.width = ""

        document.body.appendChild(anchorEl);

        render(
            <PlayerInfoPopup
                player={player}
                anchorEl={anchorEl}
            />
        );

        await screen.findByText("Anonymous User");

        const editButton = screen.queryByRole(
            "button",
            {
                name: "Change display name",
            }
        );

        expect(editButton).not.toBeInTheDocument();
    });

    test("should not show an edit icon if the player is not anonymous", async () => {
        const player: Player = {
            id: 1,
            color: "red",
            user: {
                id: 1,
                name: {
                    display: "Test User",
                },
            },
        };

        const anchorEl = document.createElement("div");
        anchorEl.style.width = ""

        document.body.appendChild(anchorEl);

        render(
            <PlayerInfoPopup
                player={player}
                anchorEl={anchorEl}
            />
        );

        await screen.findByText("Test User");

        const editButton = screen.queryByRole(
            "button",
            {
                name: "Change display name",
            }
        );

        expect(editButton).not.toBeInTheDocument();
    });

    test("should show an edit form when the edit icon button is clicked", async () => {
        const player: SelfPlayer = {
            id: 1,
            color: "red",
            isMe: true,
        };

        const anchorEl = document.createElement("div");
        anchorEl.style.width = ""

        document.body.appendChild(anchorEl);

        render(
            <PlayerInfoPopup
                player={player}
                anchorEl={anchorEl}
            />
        );

        await screen.findByText("Anonymous User");

        const editButton = screen.queryByRole(
            "button",
            {
                name: "Change display name",
            }
        );

        expect(editButton).toBeInTheDocument();

        editButton!.click();

        const inputField = await screen.findByRole("textbox", {
            name: "My name",
        });

        expect(inputField).toBeInTheDocument();
    });

    test("should hide the edit form when the cancel button is clicked", async () => {
        const player: SelfPlayer = {
            id: 1,
            color: "red",
            isMe: true,
        };

        const anchorEl = document.createElement("div");
        anchorEl.style.width = ""

        document.body.appendChild(anchorEl);

        render(
            <PlayerInfoPopup
                player={player}
                anchorEl={anchorEl}
            />
        );

        await screen.findByText("Anonymous User");

        const editButton = screen.queryByRole(
            "button",
            {
                name: "Change display name",
            }
        );

        expect(editButton).toBeInTheDocument();

        editButton!.click();

        const inputField = await screen.findByRole("textbox", {
            name: "My name",
        });

        expect(inputField).toBeInTheDocument();

        const cancelButton = screen.getByRole("button", {
            name: "Cancel",
        });

        cancelButton.click();

        // Wait for the next tick to allow state updates to propagate
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(
            screen.queryByRole("textbox", {
                name: "My name",
            })
        ).not.toBeInTheDocument();
    });

    test("should hide the edit form when the form is submitted", async () => {
        const player: SelfPlayer = {
            id: 1,
            color: "red",
            isMe: true,
        };

        const anchorEl = document.createElement("div");
        anchorEl.style.width = ""

        document.body.appendChild(anchorEl);

        render(
            <PlayerInfoPopup
                player={player}
                anchorEl={anchorEl}
            />
        );

        await screen.findByText("Anonymous User");

        const editButton = screen.queryByRole(
            "button",
            {
                name: "Change display name",
            }
        );

        expect(editButton).toBeInTheDocument();

        editButton!.click();

        const inputField = await screen.findByRole("textbox", {
            name: "My name",
        });

        expect(inputField).toBeInTheDocument();

        const submitButton = screen.getByRole("button", {
            name: "Change",
        });

        submitButton.click();

        // Wait for the next tick to allow state updates to propagate
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(
            screen.queryByRole("textbox", {
                name: "My name",
            })
        ).not.toBeInTheDocument();
    });

    test("should call the onDisplayNameChange callback when the form is submitted", async () => {
        const player: SelfPlayer = {
            id: 1,
            color: "red",
            isMe: true,
        };

        const anchorEl = document.createElement("div");
        anchorEl.style.width = ""

        document.body.appendChild(anchorEl);

        const onDisplayNameChange = vi.fn();

        render(
            <PlayerInfoPopup
                player={player}
                anchorEl={anchorEl}
                onDisplayNameChange={onDisplayNameChange}
            />
        );

        await screen.findByText("Anonymous User");

        const editButton = screen.queryByRole(
            "button",
            {
                name: "Change display name",
            }
        );

        expect(editButton).toBeInTheDocument();

        editButton!.click();

        await new Promise((resolve) => setTimeout(resolve, 0));

        const inputField = await screen.findByRole<HTMLInputElement>("textbox", {
            name: "My name",
        });

        expect(inputField).toBeInTheDocument();
        expect(inputField).toBeVisible();

        const newName = "New Name";

        await userEvent.fill(inputField, newName);

        const submitButton = screen.getByRole("button", {
            name: "Change",
        });

        submitButton.click();

        expect(onDisplayNameChange).toHaveBeenCalledWith({
            player,
            displayName: newName,
        });
    });
});