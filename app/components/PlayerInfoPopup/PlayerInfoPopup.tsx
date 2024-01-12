import React, { useCallback, useState }              from "react";
import PropTypes          from "prop-types";
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

import messages           from "./messages";
import { Player, PlayerUser } from "@shared/quintro";
import Link from "next/link";

/**
 * @callback client.react-components.PlayerInfoPopup~onDisplayNameChange
 *
 * @param {object} args - the function arguments
 * @param {client.records.PlayerRecord} player - the player whose display name is being changed
 * @param {string} displayName - the display name entered
 *
 * @return {void}
 */

/**
 * @callback client.react-components.PlayerInfoPopup~toggle
 *
 * @return {void}
 */



//TODO: FIX
const formatMessage = (messageDescriptor: {id: string;}, values?: {[key: string]: unknown}) => {
	return messageDescriptor.id;
};

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
 * @class
 * @extends external:React.PureComponent
 *
 * @memberof client.react-components
 */
const PlayerInfoPopup = ({
	player,
	playerUser,
	onDisplayNameChange,
}: PlayerInfoPopupProps) => {
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
			const submitButtonTitle = formatMessage(messages.displayNameInput.submitButtonTitle);
			const cancelButtonTitle = formatMessage(messages.displayNameInput.cancelButtonTitle);
			content = (
				<form
					onSubmit={handleChangeDisplayNameFormSubmit}
				>
					<TextField
						label={formatMessage(messages.displayNameInput.label)}
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
				{formatMessage(messages.profileLink)}
			</Link>
		);
	}

	const showFormButtonTitle = formatMessage(messages.showFormButtonTitle);

	return (
		<Card>
			<CardHeader
				title={(
					<div>
						<span>
							{
								(playerUser.getIn(["name", "display"]) as string) ||
								formatMessage(messages.anonymousUserTitle)
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

export { PlayerInfoPopup as Unwrapped };

export default PlayerInfoPopup;

// export default injectIntl(PlayerInfoPopup);
