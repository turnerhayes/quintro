import React, { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState }              from "react";
import Card               from "@mui/material/Card";
import CardHeader         from "@mui/material/CardHeader";
import CardContent        from "@mui/material/CardContent";
import TextField          from "@mui/material/TextField";
import InputAdornment     from "@mui/material/InputAdornment";
import IconButton         from "@mui/material/IconButton";
import EditIcon           from "@mui/icons-material/Edit";
import CloseIcon          from "@mui/icons-material/Close";
import CheckIcon          from "@mui/icons-material/Check";
import { Link }           from "react-router";
import type { Player } from "@root/types";
import { FormattedMessage, useIntl } from "react-intl";


export interface PlayerInfoPopupProps {
	player: Player;
	onDisplayNameChange?: (args: {
		player: Player;
		displayName: string;
	}) => void;
}

/**
 * Component representing a popup displaying information about a player.
 *
 * @memberof client.react-components
 */
export const PlayerInfoPopup = (
	{
		player,
		onDisplayNameChange,
	}: PlayerInfoPopupProps
) => {
	const intl = useIntl();
	const [isFormVisible, setIsFormVisible] = useState(false);
	const [displayNameValue, setDisplayNameValue] = useState(player.user?.name.display || "");

	const hideForm = useCallback(() => {
		setIsFormVisible(false);
	}, [
		setIsFormVisible,
	]);

	const showForm = useCallback(() => {
		setIsFormVisible(true);
	}, [
		setIsFormVisible,
	]);

	/**
	 * Handles submission of the change display name form.
	 *
	 * @function
	 *
	 * @param {event} event - the submit event
	 *
	 * @return {void}
	 */
	const handleChangeDisplayNameFormSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		onDisplayNameChange && onDisplayNameChange({
			player,
			displayName: displayNameValue,
		});

		hideForm();
	}, [
		player,
		displayNameValue,
		hideForm,
		onDisplayNameChange,
	]);

	const textFieldRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		textFieldRef.current?.focus();
	}, []);

	const handleDisplayNameChange = useCallback(({ target }: ChangeEvent<HTMLInputElement>) => {
		setDisplayNameValue(target.value);
	}, [
		setDisplayNameValue,
	]);

	const isMe = "isMe" in player;

	let content = null;
	if (player.user == null) {
		if (isMe && isFormVisible) {
			const submitButtonTitle = intl.formatMessage({
				id: "quintro.components.PlayerInfoPopup.displayNameInput.submitButtonTitle",
				defaultMessage: "Change"
			});
			const cancelButtonTitle = intl.formatMessage({
				id: "quintro.components.PlayerInfoPopup.displayNameInput.cancelButtonTitle",
				defaultMessage: "Cancel"
			});

			content = (
				<form
					onSubmit={handleChangeDisplayNameFormSubmit}
				>
					<TextField
						label={
							<FormattedMessage
								id="quintro.components.PlayerInfoPopup.displayNameInput.label"
								defaultMessage="My name"
							/>
						}
						name="name"
						inputRef={textFieldRef}
						value={displayNameValue}
						onChange={handleDisplayNameChange}
						slotProps={{
							input: {
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											title={submitButtonTitle}
											aria-label={submitButtonTitle}
											type="submit"
										>
											<CheckIcon />
										</IconButton>
										<IconButton
											key="close icon"
											onClick={hideForm}
											title={cancelButtonTitle}
											aria-label={cancelButtonTitle}
										>
											<CloseIcon />
										</IconButton>
									</InputAdornment>
								)
							},
						}}
					/>
				</form>
			);
		}
	}
	else {
		content = (
			<Link
				to={`/profile/${player.user.id}`}
				target="_blank"
			>
				<FormattedMessage
					id=	"quintro.components.PlayerInfoPopup.profileLink"
					defaultMessage="Profile"
				/>
			</Link>
		);
	}

	const showFormButtonTitle = intl.formatMessage({
		id: "quintro.components.PlayerInfoPopup.showFormButtonTitle",
		defaultMessage: "Change display name"
	});

	return (
		<Card>
			<CardHeader
				title={(
					<div>
						<span>
							{
								player.user?.name.display || (
									<FormattedMessage
										id="quintro.components.PlayerInfoPopup.anonymousUserTitle"
										defaultMessage="Anonymous User"
									/>
								)
							}
						</span>
						{
							!isFormVisible &&
							player.user == null &&
							isMe && (
								<IconButton
									key="edit icon"
									title={showFormButtonTitle}
									aria-label={showFormButtonTitle}
									onClick={showForm}
								>
									<EditIcon
									/>
								</IconButton>
							)
						}
					</div>
				)}
			/>
			{
				content && (
					<CardContent>
						{content}
					</CardContent>
				)
			}
		</Card>
	);
}
