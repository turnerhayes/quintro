import type { ColorID } from "@/config";
import type { BoardPosition, GameID, Player, Quintro } from ".";

export interface ServerToClientEvents {
  "game:players:joined": (args: {
    gameName: GameID;
    updatedPlayerList: Player[];
  }) => void;
  "game:players:left": (args: {
    gameName: GameID;
    playerIndexes: number[];
  }) => void;
  "game:started": (args: {
    gameName: GameID;
    startedAtTimestamp: number;
  }) => void;
  "board:marble:placed": (args: {
    gameName: GameID;
    position: BoardPosition;
    color: ColorID;
  }) => void;
  "game:over": (args: {
    gameName: GameID;
    winnerIndex: number;
    quintros: Quintro[];
  }) => void;
}

export interface ClientToServerEvents {
  "game:join": (args: {
    gameName: GameID;
    color: ColorID;
  }) => void;
  "game:connect": (args: {
    gameName: GameID;
  }) => void;
  "game:start": (args: {
    gameName: GameID;
  }) => void;
  "game:presence:get": (args: {
    gameName: GameID;
  }) => void;
  "board:place-marble": (args: {
    gameName: GameID;
    position: BoardPosition;
    color: ColorID;
  }) => void;
}

export interface InterServerEvents {
}

export interface SocketData {
    sessionID: string;
}