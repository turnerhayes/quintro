import PlayGamePage from "./PlayGamePage";

export default function GamePage({
    params: {
        game_id,
    },
}: {
    params: {
        game_id: string;
    };
}) {
    return (
        <div>
            <h2>Game {game_id}</h2>
            <PlayGamePage />
        </div>
    );
}