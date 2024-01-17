import PlayGameContainer from "@app/containers/PlayGame/PlayGame";

export default function GamePage({
    params: {
        game_name,
    },
}: {
    params: {
        game_name: string;
    };
}) {
    return (
        <PlayGameContainer
            gameName={game_name}
        />
    );
}