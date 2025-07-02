import { ColorID } from "@root/config";
import { BoardPosition, GameID, Player } from ".";

export interface ServerToClientEvents {
  "game:players:joined": (args: {
    gameName: GameID;
    updatedPlayerList: Player[];
  }) => void;
  "game:players:left": (args: {
    gameName: GameID;
    playerIndexes: number[];
  }) => void;
  "board:marble:placed": (args: {
    gameName: GameID;
    position: BoardPosition;
    color: ColorID;
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