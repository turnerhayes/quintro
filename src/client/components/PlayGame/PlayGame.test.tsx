/// <reference types="@vitest/browser/providers/playwright" />

import { beforeEach, expect } from "vitest";
import { http, HttpResponse } from "msw";

import { PlayGame } from "@/client/components/PlayGame/PlayGame";
import { test } from "@/client/testing/test-base";
import { render, screen } from "@/client/testing/test-utils";
import { worker } from "@/client/testing/browser-mock";
import { GET_GAME_URL, getGameHandler } from "@/client/testing/service-mocks";


beforeEach(() => {
  worker.resetHandlers();
});

test("render loading UI", async () => {
  worker.use(
    getGameHandler({
        delay: "infinite",
    })
  );
  // worker.use(
  //   getGameHandler({
  //       delay: "infinite",
  //   })
  // );

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
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1);
      });
      return new HttpResponse(null, {status: 400});
    })
  );
  // worker.use(
  //   http.get(GET_GAME_URL, async () => {
  //     await new Promise<void>((resolve) => {
  //       setTimeout(() => {
  //         resolve();
  //       }, 1);
  //     });
  //     return new HttpResponse(null, {status: 400});
  //   })
  // );

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
