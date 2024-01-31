import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import {connect} from "@app/api/persistence/connection";
import { GamesStore } from "@app/api/persistence/stores/game";
import { getSession, modifyGameForFrontend } from "../route";


export async function GET(
    req: NextApiRequest,
    {params: {gameName}}: {params: {gameName: string;}}
) {
    await connect();

    const session = await getSession(req);

    console.log("session:", session);

    const game = await GamesStore.getGame({
        name: gameName,
    });

    return NextResponse.json(modifyGameForFrontend(game, session?.userId));
};
