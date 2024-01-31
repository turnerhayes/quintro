import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import cookie from "cookie";
import { connect } from "@app/api/persistence/connection";
import { GamesStore } from "@app/api/persistence/stores/game";
import { Game, ServerGame } from "@shared/game";
import { PlayerUser, ServerQuintroUser } from "@shared/quintro.d";
import { SessionStore } from "../persistence/stores/session";


export async function getSession(req: NextApiRequest) {
	const cookies = cookie.parse(req.headers.cookie || "");
	const sessionID = cookies["next-auth.session-token"];
	const session = sessionID ? await SessionStore.findBySessionToken(sessionID) : null;
	return session;
}

export function modifyPlayerUserForFrontend(user: ServerQuintroUser, currentUserId: string|null): PlayerUser {
    const convertedUser: PlayerUser = {
        id: user.id,
        isMe: currentUserId === user.id,
        isAnonymous: Boolean(user.sessionID),
        username: user.username,
        provider: user.provider,
        names: {
            given: user.names?.given,
            family: user.names?.family,
            display: user.names?.display,
        },
    };

    return convertedUser;
}

export function modifyGameForFrontend(game: ServerGame, currentUserId: string|null): Game {
    const convertedGame: Game = {
        players: game.players.map((player) => {
            return {
                color: player.color,
                user: modifyPlayerUserForFrontend(player.user, currentUserId),
            };
        }),
        name: game.name,
        winner: game.winner,
        isStarted: game.isStarted,
        playerLimit: game.playerLimit,
        playerPresence: {},
        board: game.board,
    };

    return convertedGame;
}

export async function GET(req: NextApiRequest) {
    const search = new URL(req.url).searchParams;

    // const res = new NextResponse();
    // // @ts-expect-error 
    // const session = await getSession(req, res);
    const session = await getSession(req);
    console.log("session:", session);

    const numberOfPlayersString = search.get("numberOfPlayers");
    const onlyOpenGames = search.has("onlyOpenGames");

    const numberOfPlayers = numberOfPlayersString ? Number(numberOfPlayersString) : null;

    await connect();

    const games = await GamesStore.findGames({
        numberOfPlayers,
        onlyOpenGames,
    });

    return NextResponse.json(games.map((game) => modifyGameForFrontend(game, session?.userId)));

    // const res2 = new NextResponse(
    //     JSON.stringify(games.map((game) => modifyGameForFrontend(game, session.user))),
    //     res
    // );
    // return res2;
}
