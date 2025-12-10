/// <reference types="@vitest/browser/providers/playwright" />

import { expect, describe, vi } from "vitest";
import { http, HttpResponse } from "msw";

import { PlayGame } from "@/client/components/PlayGame/PlayGame";
import { test } from "@/client/testing/test-base";
import { render, screen, within } from "@/client/testing/test-utils";
import { worker } from "@/client/testing/browser-mock";
import { GET_GAME_URL, getGameHandler } from "@/client/testing/service-mocks";
import { socketClient } from "@/client/api/socket-client.client";
import type { SelfPlayer } from "@/types";
import { page } from "@vitest/browser/context";



describe("PlayGame component", () => {
  test("render loading UI", async () => {
    worker.use(
      getGameHandler({
          delay: "infinite",
      })
    );

    render(
      (
        <PlayGame
          gameName="test-game"
        />
      )
    );

    const content = await screen.findByText("Loading game...");
    expect(content).toBeInTheDocument();
  });

  test("render error UI", async () => {
    worker.use(
      http.get(GET_GAME_URL, async () => {
        return new HttpResponse(null, {status: 400});
      })
    );

    render(
      (
        <PlayGame
          gameName="test-game"
        />
      )
    );

    const content = await screen.findByText("Error loading game. Please try again later.");
    expect(content).toBeInTheDocument();
  });

  test("render join game UI", async () => {
    render(
      (
        <PlayGame
          gameName="test-game"
        />
      )
    );

    const content = await screen.findByText("Join this game");

    expect(content).toBeInTheDocument();
  });

  test("has a start game button if the game is not started", async () => {
    worker.use(
      getGameHandler({
        game: {
          name: "test-game",
          playerLimit: 3,
          players: [
            {
              id: 1,
              color: "red",
              user: {
                id: 1,
                name: {
                  display: "Player 1",
                },
              },
              isMe: true,
            } as SelfPlayer,
            {
              id: 2,
              color: "blue",
            },
            {
              id: 3,
              color: "yellow",
            },
          ],
        },
      })
    );

    render(
      (
        <PlayGame
          gameName="test-game"
        />
      )
    );

    const content = await screen.findByRole("button", {name: "Start Game"});

    expect(content).toBeInTheDocument();
  });

  test("disables start game button if there are not enough players", async () => {
    worker.use(
      getGameHandler({
        game: {
          name: "test-game",
          playerLimit: 3,
          players: [
            {
              id: 1,
              color: "red",
              user: {
                id: 1,
                name: {
                  display: "Player 1",
                },
              },
              isMe: true,
            } as SelfPlayer,
            {
              id: 2,
              color: "blue",
            },
          ],
        },
      })
    );

    render(
      (
        <PlayGame
          gameName="test-game"
        />
      )
    );

    const button = await screen.findByRole("button", {name: "Start Game"});

    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  test("starts game when the Start Game button is clicked", async () => {
    worker.use(
      getGameHandler({
        game: {
          name: "test-game",
          playerLimit: 3,
          players: [
            {
              id: 1,
              color: "red",
              user: {
                id: 1,
                name: {
                  display: "Player 1",
                },
              },
              isMe: true,
            } as SelfPlayer,
            {
              id: 2,
              color: "blue",
            },
            {
              id: 3,
              color: "yellow",
            },
          ],
        },
      })
    );

    const startGameSpy = vi.spyOn(socketClient, "startGame").mockImplementation(() => Promise.resolve());

    render(
      (
        <PlayGame
          gameName="test-game"
        />
      )
    );

    const button = await screen.findByRole("button", {name: "Start Game"});

    button.click();

    expect(startGameSpy).toBeCalled();
  });

  test("has a winner banner if the game is over", async () => {
    worker.use(
      getGameHandler({
        game: {
          name: "test-game",
          winnerIndex: 0,
          endedAtTimestamp: Date.now(),
          playerLimit: 3,
          players: [
            {
              id: 1,
              color: "red",
              user: {
                id: 1,
                name: {
                  display: "Player 1",
                },
              },
              isMe: true,
            } as SelfPlayer,
            {
              id: 2,
              color: "blue",
            },
            {
              id: 3,
              color: "yellow",
            },
          ],
        },
      })
    );

    render(
      (
        <PlayGame
          gameName="test-game"
        />
      )
    );

    const dialog = await screen.findByRole("dialog", {description: "Red wins!"});
    
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent("Red wins!");
  });

  test("calls joinGame on load if not in the game", async () => {
    worker.use(
      getGameHandler({
        game: {
          name: "test-game",
          playerLimit: 3,
          players: [
          ],
        },
      })
    );

    const joinGameSpy = vi.spyOn(socketClient, "joinGame").mockImplementation(() => Promise.resolve());

    render(
      (
        <PlayGame
          gameName="test-game"
        />
      )
    );

    await page.getByRole("dialog", {name: "Join this game"}).getByRole("button", {name: "Join"}).click();

    expect(joinGameSpy).toBeCalled();
  });

  describe("placeMarble", () => {
    test("calls placeMarble on clicking a cell", async () => {
      worker.use(
        getGameHandler({
          game: {
            name: "test-game",
            createdAtTimestamp: Date.now() - 10000,
            startedAtTimestamp: Date.now(),
            playerLimit: 3,
            players: [
              {
                id: 1,
                color: "red",
                user: {
                  id: 1,
                  name: {
                    display: "Player 1",
                  },
                },
                isMe: true,
              } as SelfPlayer,
              {
                id: 2,
                color: "blue",
              },
              {
                id: 3,
                color: "yellow",
              },
            ],
          },
        })
      );

      const placeMarbleSpy = vi.spyOn(socketClient, "placeMarble").mockImplementation(() => Promise.resolve());

      render(
        (
          <PlayGame
            gameName="test-game"
          />
        )
      );

      // Ensure the board is loaded
      await screen.findByRole("table");

      const cell = page.getByRole("table").getByRole("cell").first().element() as HTMLElement|undefined;

      expect(cell).toBeDefined();

      if (cell) {
        cell.click();
      }

      expect(placeMarbleSpy).toBeCalled();
    });

    test("does not call placeMarble on clicking an occupied cell", async () => {
      worker.use(
        getGameHandler({
          game: {
            name: "test-game",
            createdAtTimestamp: Date.now() - 10000,
            startedAtTimestamp: Date.now(),
            playerLimit: 3,
            players: [
              {
                id: 1,
                color: "red",
              },
              {
                id: 2,
                color: "blue",
                user: {
                  id: 1,
                  name: {
                    display: "Player 1",
                  },
                },
                isMe: true,
              } as SelfPlayer,
              {
                id: 3,
                color: "yellow",
              },
            ],
            board: {
              filledCells: [
                {
                  color: "red",
                  position: [0, 0],
                },
              ],
            }
          },
        })
      );

      const placeMarbleSpy = vi.spyOn(socketClient, "placeMarble").mockImplementation(() => Promise.resolve());

      render(
        (
          <PlayGame
            gameName="test-game"
          />
        )
      );

      // Ensure the board is loaded
      await screen.findByRole("table");

      const cell = page.getByRole("table").getByRole("cell").first().element() as HTMLElement|undefined;

      expect(cell).toBeDefined();

      if (cell) {
        cell.click();
      }

      expect(placeMarbleSpy).not.toBeCalled();
    });

    test("does not call placeMarble on clicking if it's not player's turn", async () => {
      worker.use(
        getGameHandler({
          game: {
            name: "test-game",
            createdAtTimestamp: Date.now() - 10000,
            startedAtTimestamp: Date.now(),
            playerLimit: 3,
            players: [
              {
                id: 1,
                color: "red",
              },
              {
                id: 2,
                color: "blue",
                user: {
                  id: 1,
                  name: {
                    display: "Player 1",
                  },
                },
                isMe: true,
              } as SelfPlayer,
              {
                id: 3,
                color: "yellow",
              },
            ],
          },
        })
      );

      const placeMarbleSpy = vi.spyOn(socketClient, "placeMarble").mockImplementation(() => Promise.resolve());

      render(
        (
          <PlayGame
            gameName="test-game"
          />
        )
      );

      // Ensure the board is loaded
      await screen.findByRole("table");

      const cell = page.getByRole("table").getByRole("cell").first().element() as HTMLElement|undefined;

      expect(cell).toBeDefined();

      if (cell) {
        cell.click();
      }

      expect(placeMarbleSpy).not.toBeCalled();
    });
  });

  test("calls establishGameConnection on load if player is in the game", async () => {
    worker.use(
      getGameHandler({
        game: {
          name: "test-game",
          playerLimit: 3,
          players: [
            {
              id: 1,
              color: "red",
              user: {
                id: 1,
                name: {
                  display: "Player 1",
                },
              },
              isMe: true,
            } as SelfPlayer,
            {
              id: 2,
              color: "blue",
            },
            {
              id: 3,
              color: "yellow",
            },
          ],
        },
      })
    );

    const establishConnectionSpy = vi.spyOn(socketClient, "establishGameConnection").mockImplementation(() => Promise.resolve());

    render(
      (
        <PlayGame
          gameName="test-game"
        />
      )
    );

    await screen.findByRole("table");

    expect(establishConnectionSpy).toBeCalled();
  });

  describe("Winner banner", () => {
    test("Closes winner banner on clicking Close", async () => {
      worker.use(
        getGameHandler({
          game: {
            name: "test-game",
            winnerIndex: 0,
            endedAtTimestamp: Date.now(),
            playerLimit: 3,
            players: [
              {
                id: 1,
                color: "red",
                user: {
                  id: 1,
                  name: {
                    display: "Player 1",
                  },
                },
                isMe: true,
              } as SelfPlayer,
              {
                id: 2,
                color: "blue",
              },
              {
                id: 3,
                color: "yellow",
              },
            ],
          },
        })
      );

      render(
        (
          <PlayGame
            gameName="test-game"
          />
        )
      );

      const dialog = await screen.findByRole("dialog", {description: "Red wins!"});
      expect(dialog).toBeInTheDocument();

      const closeButton = await screen.findByRole("button", {name: "Close"});
      closeButton.click();

      // Defer to next tick to allow dialog to close
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(dialog).not.toBeInTheDocument();
    });
  });

  describe("Player indicators", () => {
    test("shows player info on clicking an indicator", async () => {
      worker.use(
        getGameHandler({
          game: {
            name: "test-game",
            playerLimit: 3,
            players: [
              {
                id: 1,
                color: "red",
                isMe: true,
              } as SelfPlayer,
              {
                id: 2,
                color: "blue",
              },
              {
                id: 3,
                color: "yellow",
              },
            ],
          },
        })
      );

      render(
        (
          <PlayGame
            gameName="test-game"
          />
        )
      );

      const indicatorButton = await screen.findByRole("button", {name: "This is you"});

      indicatorButton.click();

      const playerInfoPopup = await screen.findByRole("tooltip");

      expect(playerInfoPopup).toBeInTheDocument();
      expect(playerInfoPopup).toHaveTextContent("Anonymous User");
      const editButton = within(playerInfoPopup).getByRole(
        "button",
        {
          name: "Change display name",
        }
      );

      expect(editButton).toBeInTheDocument();
    });

    test("closes the player info popup when clicks outside of the popup", async () => {
      worker.use(
        getGameHandler({
          game: {
            name: "test-game",
            playerLimit: 3,
            players: [
              {
                id: 1,
                color: "red",
                isMe: true,
              } as SelfPlayer,
              {
                id: 2,
                color: "blue",
              },
              {
                id: 3,
                color: "yellow",
              },
            ],
          },
        })
      );

      render(
        (
          <PlayGame
            gameName="test-game"
          />
        )
      );

      const indicatorButton = await screen.findByRole("button", {name: "This is you"});

      indicatorButton.click();

      const playerInfoPopup = await screen.findByRole("tooltip");

      expect(playerInfoPopup).toBeInTheDocument();

      indicatorButton.click();

      // Defer to next tick to allow popup to close
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(playerInfoPopup).not.toBeInTheDocument();
    });
  });

  describe("Player presence", () => {
    test("lists player presence correctly", async () => {
      worker.use(
        getGameHandler({
          game: {
            name: "test-game",
            playerLimit: 3,
            players: [
              {
                id: 1,
                color: "red",
                isMe: true,
              } as SelfPlayer,
              {
                id: 2,
                color: "blue",
              },
              {
                id: 3,
                color: "yellow",
              },
            ],
          },
        })
      );

      vi.spyOn(socketClient, "getPlayerPresence").mockReturnValue(Promise.resolve({
        red: true,
        blue: true,
        yellow: false,
      }));

      render(
        (
          <PlayGame
            gameName="test-game"
          />
        )
      );

      let indicator = await screen.findByRole("button", {name: "This is you"});

      expect(indicator).toBeInTheDocument();

      indicator = await screen.findByRole("button", {name: "Player blue"});

      expect(indicator).toBeInTheDocument();

      indicator = await screen.findByRole("button", {name: "Player yellow is absent"});

      expect(indicator).toBeInTheDocument();
    });
  });
});
