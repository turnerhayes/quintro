import debounce           from "lodash.debounce";
import { FormattedMessage, useIntl } from "react-intl";
import React, { ChangeEvent, ChangeEventHandler, FormEvent, FormEventHandler, useCallback, useEffect, useState }              from "react";
import {
	TextField,
	Button,
	Typography,
	Card,
	CardHeader,
	CardContent
} from "@mui/material"
import {List} from "immutable";
import LoadingSpinner     from "@app/components/LoadingSpinner";
import Config             from "@app/config";


export const SEARCH_DEBOUNCE_PERIOD_IN_MILLISECONDS = 10000;

const styles = {
	playerLimitLabel: {
		position: "static",
	},

	// This is here simply to give a class to the Cancel button so that
	// it can be grabbed by tests
	cancelButton: {},
};


/**
 * Executes the search.
 *
 * This function is debounced.
 */
const debouncedRunSearch = debounce(
	(numberOfPlayers, onFindOpenGames, setIsSearching) => {
		onFindOpenGames({
			numberOfPlayers: Number(numberOfPlayers) || null,
		});

		setIsSearching(true);
	},
	SEARCH_DEBOUNCE_PERIOD_IN_MILLISECONDS,
	{
		leading: true
	}
);

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
			<div>
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
			</div>

			<div>
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
			</div>
		</form>
	);
}

/**
 * Component representing a form for searching for open games to join.
 *
 * @memberof client.react-components
 */
const FindGame = ({
	onFindOpenGames,
	onJoinGame,
	onCancelFind,
	findGameError,
	results,
}: {
	onFindOpenGames: (args: {numberOfPlayers: number|null;}) => void;
	onJoinGame: (args: {gameName: string;}) => void;
	onCancelFind: () => void;
	findGameError?: {};
	results?: List<unknown>;
}) => {
	const [numberOfPlayers, setNumberOfPlayers] = useState("");
	const [isSearching, setIsSearching] = useState(false);

	/**
	 * Joins the first game in the results.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	const joinGame = useCallback(() => {
		const gameName = results.getIn([ 0, "name" ]) as string;

		onJoinGame({ gameName });
	}, [results, onJoinGame]);

	const runSearch = useCallback(() => {
		debouncedRunSearch(numberOfPlayers, onFindOpenGames, setIsSearching);
	}, [numberOfPlayers, onFindOpenGames, setIsSearching]);

	/**
	 * Handles the case when the component has been updated with search results.
	 *
	 * @function
	 * @async
	 *
	 * @return {void}
	 */
	const handleGamesFound = useCallback(() => {
		if (results.isEmpty()) {
			// Found nothing; try until we do
			runSearch();
		} else {
			joinGame();
		}
	}, [runSearch, numberOfPlayers, onFindOpenGames, setIsSearching, results, joinGame]);

	useEffect(() => {
		// istanbul ignore else
		if (isSearching) {
			if (findGameError) {
				// TODO: display error notification
				setIsSearching(false);
			}
			else {
				// istanbul ignore else
				if (results) {
					handleGamesFound();
				}
			}
		}
	}, [findGameError, setIsSearching, results, handleGamesFound]);

	const cancelSearch = useCallback(() => {
		debouncedRunSearch.cancel();
		setIsSearching(false);
		onCancelFind();
	}, [setIsSearching, onCancelFind]);

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

		runSearch();
	}, [runSearch]);

	const handleNumberOfPlayersChanged = useCallback((event: ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
		setNumberOfPlayers(event.target.value);
	}, [setNumberOfPlayers]);

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
			</CardContent>
		</Card>
	);

}

export { FindGame as Unwrapped };

export default FindGame;
