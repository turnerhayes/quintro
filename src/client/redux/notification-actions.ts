import { createAction } from "@reduxjs/toolkit";
import type { BoardPosition, GameID } from "@/types";
import type { ColorID } from "@/config";

export const notifyMarblePlaced = createAction<{
    gameName: GameID;
    position: BoardPosition;
    color: ColorID;
}>("notifications/marble_placed");