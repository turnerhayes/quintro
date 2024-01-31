import React, { ChangeEvent, ChangeEventHandler, FormEvent, FormEventHandler, useCallback, useEffect, useMemo, useRef, useState }              from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
	TextField,
	Button,
	Typography,
	Card,
	CardHeader,
	CardContent,
	Stack,
	List,
	ListItem,
	ListItemText,
} from "@mui/material"
import {
	Group as PlayersIcon
} from "@mui/icons-material";
import LoadingSpinner     from "@app/components/LoadingSpinner";
import Config             from "@app/config";
import { Game } from "@shared/game";


type OnJoinGameCallback = (args: {gameName: string;}) => void;

interface FindGameProps {
	isSearching: boolean;
	numberOfPlayers: string;
	onChangeNumberOfPlayers: (numberOfPlayers: string) => void;
	onFindOpenGames: () => void;
	onJoinGame: OnJoinGameCallback;
	onCancelSearch: () => void;
	findGameError?: {};
	results?: Game[];
}

const styles = {
	playerLimitLabel: {
		position: "static",
	},

	// This is here simply to give a class to the Cancel button so that
	// it can be grabbed by tests
	cancelButton: {},
};

const JoinGameButton = ({
	gameName,
	isInGame,
	onJoinGame,
}: {
	gameName: string;
	isInGame: boolean;
	onJoinGame: OnJoinGameCallback;
}) => {
	const callback = useCallback(() => {
		onJoinGame({gameName});
	}, [gameName, onJoinGame]);

	return (
		<Button
			onClick={callback}
		>
			{isInGame ?
				(
					<FormattedMessage
						id="quintro.components.FindGame.goToGameButton"
						description="Button text to go to a particular game found in the Find Game page which they are already a participant in"
						defaultMessage="Go to Game"
					/>
				) : (
					<FormattedMessage
						id="quintro.components.FindGame.joinGameButton"
						description="Button text to join a particular game found in the Find Game page"
						defaultMessage="Join"
					/>
				)
			}
		</Button>
	);
};

const ResultsList = ({
	results,
	onJoinGame,
}: {
	results: Game[];
	onJoinGame: OnJoinGameCallback;
}) => {
	console.log("results:", results);
	return results.length > 0 ? (
		<List>
			{results.map((game) => (
				<ListItem
					key={game.name}
					secondaryAction={
						<JoinGameButton
							gameName={game.name}
							onJoinGame={onJoinGame}
							isInGame={game.players.find(
								(player) => player.user.isMe
							) !== undefined}
						/>
					}
				>
					<ListItemText>
						<Stack direction="column">
							<Typography variant="h6">
								{game.name}
							</Typography>
							<Stack direction="row" spacing={2}>
								<PlayersIcon />
								<Typography variant="subtitle1">
									{game.players.length}/{game.playerLimit}
								</Typography>
							</Stack>
						</Stack>
					</ListItemText>
				</ListItem>
			))}
		</List>
	) : (
		<Typography>
			<FormattedMessage
				id="quintro.components.FindGame.noResults"
				description="Message shown when no games were found in the Find Game page"
				defaultMessage="No results found. You can change your search parameters, create a new game, or try again later."
			/>
		</Typography>
	);
};

/**
 * Renders the searching UI.
 */
const Searching = ({
	cancelSearch,
	classes = {
		cancelButton: "",
	},
}: {
	cancelSearch: () => void;
	classes?: {
		cancelButton: string;
	};
}) => {
	return (
		<>
			<h3>
				<LoadingSpinner /> <FormattedMessage
					id="quintro.components.FindGame.searchingText"
					description="Message shown while searching for open games"
					defaultMessage="Searching for open games, please wait"
				/>
			</h3>
			<Button
				onClick={cancelSearch}
				className={classes.cancelButton}
			>
				<FormattedMessage
					id="quintro.components.FindGame.cancelSearchLabel"
					description="Button text to cancel searching for open games"
					defaultMessage="Stop searching"
				/>
			</Button>
		</>
	);
}

/**
 * Renders the search form.
 */
const SearchForm = ({
	handleSearchFormSubmit,
	numberOfPlayers,
	handleNumberOfPlayersChanged,
	classes = {
		playerLimitLabel: "",
	},
}: {
	handleSearchFormSubmit: FormEventHandler<HTMLFormElement>;
	numberOfPlayers: string;
	handleNumberOfPlayersChanged: ChangeEventHandler;
	classes?: {
		playerLimitLabel: string;
	};
}) => {
	const intl = useIntl();
	return (
		<form
			onSubmit={handleSearchFormSubmit}
		>
			<Stack direction="column">
				<Stack direction="column">
					<TextField
						type="number"
						name="playerLimit"
						label={intl.formatMessage({
							id: "quintro.components.FindGame.form.playerLimit.label",
							description: "Label for the input field to specify max number of players allowed in games in the Find Games page",
							defaultMessage: "Number of players",
						})}
						inputProps={{
							min: Config.game.players.min,
							max: Config.game.players.max,
						}}
						InputLabelProps={{
							className: classes.playerLimitLabel,
						}}
						onChange={handleNumberOfPlayersChanged}
						value={numberOfPlayers}
					/>
					<Typography
						variant="caption"
					>
						<FormattedMessage
							id="quintro.components.FindGame.form.playerLimit.details"
							description="Additional instructions for the player limit input on the Find Game page"
							defaultMessage="Leave blank if you don't care how many players the game has"
						/>
					</Typography>
				</Stack>

				<Button
					type="submit"
					color="primary"
					disabled={!!numberOfPlayers && Number.isNaN(Number(numberOfPlayers))}
				>
					<FormattedMessage
						id="quintro.components.FindGame.form.submitButton.label"
						description="Label for the button to start searching for games on the Find Game page"
						defaultMessage="Find"
					/>
				</Button>
			</Stack>
		</form>
	);
}

/**
 * Component representing a form for searching for open games to join.
 *
 * @memberof client.react-components
 */
const FindGame = ({
	isSearching,
	numberOfPlayers,
	onChangeNumberOfPlayers,
	onFindOpenGames,
	onJoinGame,
	onCancelSearch,
	findGameError,
	results,
}: FindGameProps) => {
	/**
	 * Joins the first game in the results.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	const joinGame = useCallback(() => {
		const gameName = results[0].name;

		onJoinGame({ gameName });
	}, [results, onJoinGame]);

	/**
	 * Handles the case when the component has been updated with search results.
	 *
	 * @function
	 * @async
	 *
	 * @return {void}
	 */
	const handleGamesFound = useCallback(() => {
		if (results?.length === 0) {
			// Found nothing; try until we do
			// onFindOpenGames();
		} else {
			// joinGame();
		}
	}, [onFindOpenGames, results, joinGame]);

	useEffect(() => {
		// istanbul ignore else
		if (isSearching) {
			if (results) {
				handleGamesFound();
			}
		}
	}, [results, handleGamesFound]);

	const cancelSearch = useCallback(() => {
		onCancelSearch();
	}, [onCancelSearch]);

	/**
	 * Handles the search form being submitted.
	 *
	 * @function
	 *
	 * @param {event} event - the submit event
	 *
	 * @return {void}
	 */
	const handleSearchFormSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		onFindOpenGames();
	}, [onFindOpenGames, numberOfPlayers]);

	const handleNumberOfPlayersChanged = useCallback((event: ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
		onChangeNumberOfPlayers(event.target.value);
	}, [onChangeNumberOfPlayers]);

	return (
		<Card>
			<CardHeader
				title={
					<FormattedMessage
						id="quintro.components.FindGame.header"
						description="Header for the Find Game page"
						defaultMessage="Find a Game"
					/>
				}
			/>
			<CardContent>
				{
					isSearching ?
						(<Searching
							cancelSearch={cancelSearch}
						/>) :
						(<SearchForm
							numberOfPlayers={numberOfPlayers}
							handleNumberOfPlayersChanged={handleNumberOfPlayersChanged}
							handleSearchFormSubmit={handleSearchFormSubmit}
						/>)
				}
				{
					results ? (
						<ResultsList
							results={results}
							onJoinGame={onJoinGame}
						>
						</ResultsList>
					) : null
				}
			</CardContent>
		</Card>
	);

}

export default FindGame;
