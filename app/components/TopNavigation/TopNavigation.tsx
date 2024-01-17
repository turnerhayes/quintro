import React, { useCallback, useState }                from "react";
import Link from "next/link";
import {useIntl} from "react-intl";
import AppBar               from "@mui/material/AppBar";
import Toolbar              from "@mui/material/Toolbar";
import Popover              from "@mui/material/Popover";
import Card                 from "@mui/material/Card";
import CardContent          from "@mui/material/CardContent";
import Button               from "@mui/material/Button";
import IconButton           from "@mui/material/IconButton";
import HomeIcon             from "@mui/icons-material/Home";
import AccountCircleIcon    from "@mui/icons-material/AccountCircle";
import SettingsIcon         from "@mui/icons-material/Settings";
import AccountDialog        from "@app/components/AccountDialog";
import QuickSettingsDialog  from "@app/containers/QuickSettingsDialog";
import { User } from "@shared/user";


const styles = {
	accountButton: {
		marginLeft: "auto",
	},
};

interface TopNavigationProps {
	loggedInUser: User;
	className: string;
	classes: {
		accountButton: string;
	};
}

/**
 * Component representing the navigation bar on the top of the page.
 *
 * @class
 * @extends external:React.PureComponent
 *
 * @memberof client.react-components
 */
const TopNavigation = ({
	loggedInUser,
	className,
	classes = {
		accountButton: "account-button",
	},
}: TopNavigationProps) => {
	const intl = useIntl();
	const [accountButtonEl, setAccountButtonEl] = useState<Element|null>(null);
	const [quickSettingsButtonEl, setQuickSettingsButtonEl] = useState<Element|null>(null);

	/**
	 * Handles a click of the Account button.
	 *
	 * @function
	 * @private
	 *
	 * @param {React.Event} event - the event for the click
	 *
	 * @returns {void}
	 */
	const onAccountButtonClick = useCallback((event) => {
		setAccountButtonEl(event.target);
	}, [setAccountButtonEl]);

	const closeAccountDialog = useCallback(() => {
		setAccountButtonEl(null);
	}, [setAccountButtonEl]);


	/**
	 * Handles a click of the Quick Settings button.
	 *
	 * @function
	 * @private
	 *
	 * @param {React.Event} event - the event for the click
	 *
	 * @returns {void}
	 */
	const onQuickSettingsButtonClick = useCallback((event) => {
		setQuickSettingsButtonEl(event.target);
	}, [setQuickSettingsButtonEl]);

	const closeQuickSettingsDialog = useCallback(() => {
		setQuickSettingsButtonEl(null);
	}, [setQuickSettingsButtonEl]);

	return (
		<AppBar
			className={className}
			position="static"
		>
			<Toolbar>
				<Link
					href="/"
					title={intl.formatMessage({
						id: "quintro.components.TopNavigation.links.home",
						description: "Home page link text",
						defaultMessage: "Home",
					})}
				>
					<HomeIcon/>
				</Link>
				<Button
					component={Link}
					href="/game/find"
				>
					{intl.formatMessage({
						id: "quintro.components.TopNavigation.links.findGame",
						description: "Find Game page link text",
						defaultMessage: "Find a Game",
					})}
				</Button>
				<Button
					component={Link}
					href="/how-to-play"
				>
					{intl.formatMessage({
						id: "quintro.components.TopNavigation.links.howToPlay",
						description: "How to Play page link text",
						defaultMessage: "How to Play",
					})}
				</Button>
				<Button
					component={Link}
					href="/game/create"
				>
					{intl.formatMessage({
						id: "quintro.components.TopNavigation.links.startGame",
						description: "Start Game page link text",
						defaultMessage: "Start a Game",
					})}
				</Button>

				<IconButton
					key="account popup button"
					className={classes.accountButton}
					onClick={onAccountButtonClick}
				>
					<AccountCircleIcon />
				</IconButton>
				<Popover
					open={!!accountButtonEl}
					onClose={closeAccountDialog}
					anchorEl={accountButtonEl}
					anchorOrigin={{
						horizontal: "right",
						vertical: "bottom",
					}}
					transformOrigin={{
						horizontal: "right",
						vertical: "top",
					}}
				>
					<AccountDialog
						loggedInUser={loggedInUser}
					/>
				</Popover>
				<IconButton
					key="quick settings button"
					onClick={onQuickSettingsButtonClick}
				>
					<SettingsIcon />
				</IconButton>
				<Popover
					open={!!quickSettingsButtonEl}
					onClose={closeQuickSettingsDialog}
					anchorEl={quickSettingsButtonEl}
					anchorOrigin={{
						horizontal: "right",
						vertical: "bottom",
					}}
					transformOrigin={{
						horizontal: "right",
						vertical: "top",
					}}
				>
					<Card>
						<CardContent>
							<QuickSettingsDialog
							/>
						</CardContent>
					</Card>
				</Popover>
			</Toolbar>
		</AppBar>
	);
}

export { TopNavigation as Unwrapped };

export default TopNavigation;