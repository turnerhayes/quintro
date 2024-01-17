import React, { useCallback, useState }              from "react";
import {
	Card,
	CardHeader,
	CardContent,
	TextField,
	InputAdornment,
	IconButton
} from "@mui/material";
import {
	Edit as EditIcon,
	Close as CloseIcon,
	Check as CheckIcon
} from "@mui/icons-material";
import Link from "next/link";

import { Player, PlayerUser } from "@shared/quintro";


interface PlayerInfoPopupProps {
	player: Player;
	playerUser: PlayerUser;
	onDisplayNameChange: (args: {
		player: Player;
		displayName: string;
	}) => void;
}

/**
 * Component representing a popup displaying information about a player.
 *
 * @memberof client.react-components
 */
const PlayerInfoPopup = ({
	player,
	playerUser,
	onDisplayNameChange,
}: PlayerInfoPopupProps) => {
	const intl = useIntl();
	const [isFormVisible, setIsFormVisible] = useState(false);
	const [displayNameValue, setDisplayNameValue] = useState<string>(
		(playerUser.getIn(["name", "display"]) as string) || ""
	);

	const makeFormHidden = useCallback(() => {
		setIsFormVisible(false);
	}, [setIsFormVisible]);

	const makeFormVisible = useCallback(() => {
		setIsFormVisible(true);
	}, [setIsFormVisible]);

	/**
	 * Handles submission of the change display name form.
	 *
	 * @function
	 *
	 * @param {event} event - the submit event
	 *
	 * @return {void}
	 */
	const handleChangeDisplayNameFormSubmit = useCallback((event) => {
		event.preventDefault();

		if (onDisplayNameChange) {
			onDisplayNameChange({
				player,
				displayName: displayNameValue,
			});
		}

		makeFormHidden();
	}, [onDisplayNameChange]);

	const textFieldRef = useCallback((ref) => {
		if (ref) {
			ref.focus();
		}
	}, []);

	const handleDisplayNameChange = useCallback(({ target }) => {
		setDisplayNameValue(target.value);
	}, []);

	let content = null;
	if (playerUser.get("isAnonymous")) {
		if (playerUser.get("isMe") && isFormVisible) {
			const submitButtonTitle = intl.formatMessage({
				id: "quintro.components.PlayerInfoPopup.displayNameInput.submitButtonTitle",
				description: "Button label to commit changes to player's display name",
				defaultMessage: "Change"
			});
			const cancelButtonTitle = intl.formatMessage({
				id: "quintro.components.PlayerInfoPopup.displayNameInput.cancelButtonTitle",
				description: "Button label to cancel changes to player's display name",
				defaultMessage: "Cancel"
			});
			content = (
				<form
					onSubmit={handleChangeDisplayNameFormSubmit}
				>
					<TextField
						label={<FormattedMessage
							id="quintro.components.PlayerInfoPopup.displayNameInput.label"
							description="Label for the player display name input"
							defaultMessage="My name"
						/>}
						name="name"
						inputRef={textFieldRef}
						value={displayNameValue}
						onChange={handleDisplayNameChange}
						InputProps={{
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
										onClick={makeFormHidden}
										title={cancelButtonTitle}
										aria-label={cancelButtonTitle}
									>
										<CloseIcon />
									</IconButton>
								</InputAdornment>
							)
						}}
					/>
				</form>
			);
		}
	}
	else {
		content = (
			<Link
				href={`/profile/${playerUser.get("username")}`}
				target="_blank"
			>
				<FormattedMessage
					id="quintro.components.PlayerInfoPopup.profileLink"
					description="Text for the link to the player's profile"
					defaultMessage="Profile"
				/>
			</Link>
		);
	}

	const showFormButtonTitle = intl.formatMessage({
		id: "quintro.components.PlayerInfoPopup.showFormButtonTitle",
		description: "Button text to show the form for changing a player's display name",
		defaultMessage: "Change display name",
	});

	return (
		<Card>
			<CardHeader
				title={(
					<div>
						<span>
							{
								(playerUser.getIn(["name", "display"]) as string) || (
									<FormattedMessage
										id="quintro.components.PlayerInfoPopup.anonymousUserTitle"
										description="Title for the player info popup when the user is anonymous"
										defaultMessage="Anonymous User"
									/>
								)
							}
						</span>
						{
							!isFormVisible &&
							playerUser.get("isAnonymous") &&
							playerUser.get("isMe") && (
								<IconButton
									key="edit icon"
									title={showFormButtonTitle}
									aria-label={showFormButtonTitle}
									onClick={makeFormVisible}
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


export default PlayerInfoPopup;
