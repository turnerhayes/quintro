import React, {
	type ChangeEvent,
	type FormEvent,
	useCallback,
	useEffect,
	useState
}                         from "react";
import { useNavigate }    from "react-router";
import {
	FormattedMessage
}                         from "react-intl";
import { skipToken }      from "@reduxjs/toolkit/query";
import TextField          from "@mui/material/TextField";
import Button             from "@mui/material/Button";
import Typography         from "@mui/material/Typography";
import Card               from "@mui/material/Card";
import CardHeader         from "@mui/material/CardHeader";
import CardContent        from "@mui/material/CardContent";
import {
	useFindGamesQuery
}                         from "@/api/games";
import Config             from "@/config";
import type {
	GameSummary
}                         from "@/types";

import styles             from "./FindGame.module.css";


interface SearchParameters {
	numberOfPlayers: number|null;
}

// const searchForGames = async (
// 	{
// 		numberOfPlayers,
// 	}: {
// 		numberOfPlayers: number|null;
// 	}
// ): Promise<GameSummary[]> => {
// 	const results = await findGames({numberOfPlayers,});
// 	if (results.length === 0) {
// 		return await searchForGames({numberOfPlayers,});
// 	}
// 	return results;
// };

const Searching = (
	{
		onCancelFind,
	}: {
		onCancelFind: () => void;
	}
) => {
	const cancelSearch = useCallback(() => {
		onCancelFind();
	}, []);

	return (
		<React.Fragment>
			<h3>
				{/* <LoadingSpinner /> */} <FormattedMessage
					id="quintro.components.FindGame.searchingText"
					defaultMessage="Searching for open games, please wait"
				/>
			</h3>
			<Button
				onClick={cancelSearch}
			>
				<FormattedMessage
					id="quintro.components.FindGame.cancelSearchLabel"
					defaultMessage="Stop searching"
				/>
			</Button>
		</React.Fragment>
	);
};

const SearchForm = (
	{
		onSearch,
	}: {
		onSearch: (params: SearchParameters) => void;
	}
) => {
	const [numberOfPlayers, setNumberOfPlayers] = React.useState<string>("3");

	const handleSearchFormSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const numPlayers = numberOfPlayers.trim() ? Number(numberOfPlayers.trim()) : null;

		onSearch({
			numberOfPlayers: numPlayers,
		});
	}, [
		onSearch,
		numberOfPlayers,
	]);

	const handleNumberOfPlayersChanged = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setNumberOfPlayers(event.target.value);
	}, [
		setNumberOfPlayers,
	]);

	return (
		<form
			onSubmit={handleSearchFormSubmit}
		>
			<div>
				<TextField
					type="number"
					name="playerLimit"
					label={
						<FormattedMessage
							id="quintro.components.FindGame.form.playerLimit.label"
							defaultMessage="Number of players"
						/>
					}
					slotProps={{
						htmlInput: {
							min: Config.game.players.min,
							max: Config.game.players.max,
						},

						inputLabel: {
							className: styles.playerLimitLabel,
						},
					}}
					onChange={handleNumberOfPlayersChanged}
					value={numberOfPlayers}
				/>
				<Typography
					variant="caption"
				>
					{
						<FormattedMessage
							id="quintro.components.FindGame.form.playerLimit.details"
							defaultMessage="Leave blank if you don't care how many players the game has"
						/>
					}
				</Typography>
			</div>

			<div>
				<Button
					type="submit"
					color="primary"
					disabled={!!numberOfPlayers && Number.isNaN(Number(numberOfPlayers))}
				>
					{<FormattedMessage
						id="quintro.components.FindGame.form.submitButton.label"
						defaultMessage="Find"
					/>}
				</Button>
			</div>
		</form>
	);
};

/**
 * Component representing a form for searching for open games to join.
 */
export const FindGame = () => {
	const [isSearching, setIsSearching] = useState(false);

	const navigate = useNavigate();

	const handleJoinGame = useCallback((game: GameSummary) => {
		navigate(`/game/play/${game.name}`);
	}, []);

	const handleCancelSearch = useCallback(() => {
		setIsSearching(false);
	}, [
		setIsSearching,
	]);

	const {data: results, isLoading, error } = useFindGamesQuery(
		isSearching ? {
			numberOfPlayers: null,
		} : skipToken
	);

	useEffect(() => {
		if (isLoading) {
			return;
		}
		if (results == null || results.length == 0) {
			return;
		}

		const firstGame = results[0];
		navigate(`/game/play/${firstGame.name}`);
	}, [
		results,
		isSearching,
		isLoading,
		navigate,
	]);

	const handleSearch = useCallback((params: SearchParameters) => {
		const {numberOfPlayers} = params;
		setIsSearching(true);

		// searchForGames({
		// 	numberOfPlayers,
		// }).then(
		// 	(results) => {
		// 		handleJoinGame(results![0]);
		// 	}
		// );
	}, [
		setIsSearching,
	]);
	
	return (
		<Card>
			<CardHeader
				title={
					<FormattedMessage
						id="quintro.components.FindGame.header"
						defaultMessage="Find a Game"
					/>
				}
			/>
			<CardContent>
				{
					isSearching ?
						(
							<Searching
								onCancelFind={handleCancelSearch}
							/>
						) :
						(
							<SearchForm
								onSearch={handleSearch}
							/>
						)
				}
			</CardContent>
		</Card>
	);
}
