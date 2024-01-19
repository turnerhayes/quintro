import { PayloadAction, PayloadActionCreator, createAction } from "@reduxjs/toolkit";
import { Player } from "@shared/quintro.d";


export const JOIN_GAME_ACTION = "@QUINTRO/JOIN_GAME";

export const joinGame = createAction<{gameName: string, colors: string[]}>(JOIN_GAME_ACTION);

export const PLAYERS_JOINED_ACTION = "@QUINTRO/PLAYERS_JOINED";

export const playersJoined = createAction<{gameName: string, players: Player[]}>(PLAYERS_JOINED_ACTION);

export const WATCH_GAME_ACTION = "@QUINTRO/WATCH_GAME";

export const watchGame = createAction<string>(WATCH_GAME_ACTION);
