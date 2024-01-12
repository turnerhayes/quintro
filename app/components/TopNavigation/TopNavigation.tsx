import React, { useCallback, useState }                from "react";
import Link from "next/link";
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
import QuickSettingsDialog  from "@app/components/QuickSettingsDialog";
import messages             from "./messages";
import { User } from "@shared/user";

const styles = {
	accountButton: {
		marginLeft: "auto",
	},
};

//TODO: FIX
const formatMessage = ({id}: {id: string}, values?: {[key: string]: unknown}) => {
	return id;
};


	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {!external:Immutable.Map} [loggedInUser] - the logged in user, if any
	 * @prop {string} [className] - any extra class names to add to the root element
	 * @prop {object} intl - an Intl object from the react-intl package
	 */
	// static propTypes = {
	// 	loggedInUser: ImmutablePropTyps.map,
	// 	className: PropTypes.string,
	// 	intl: PropTypes.obj.isRequired,
	// 	classes: PropTypes.object.isRequired,
	// };

interface TopNavigationProps {
	loggedInUser: User;
	className: string;
	classes: {
		root: string;
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
	classes,
}: TopNavigationProps) => {
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
					title={formatMessage(messages.links.home)}
				>
					<HomeIcon/>
				</Link>
				<Button
					component={Link}
					href="/game/find"
				>
					{formatMessage(messages.links.findGame)}
				</Button>
				<Button
					component={Link}
					href="/how-to-play"
				>
					{formatMessage(messages.links.howToPlay)}
				</Button>
				<Button
					component={Link}
					href="/game/create"
				>
					{formatMessage(messages.links.startGame)}
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