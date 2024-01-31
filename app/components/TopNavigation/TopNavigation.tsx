import {useIntl} from "react-intl";
import Link from "next/link";
import AppBar               from "@mui/material/AppBar";
import Toolbar              from "@mui/material/Toolbar";
import Button               from "@mui/material/Button";
import HomeIcon             from "@mui/icons-material/Home";
import AccountPopupButton from "@app/components/TopNavigation/AccountPopupButton";
import QuickSettingsPopupButton from "@app/components/TopNavigation/QuickSettingsPopupButton";
import { User } from "@shared/user";


const styles = {
	accountButton: {
		marginLeft: "auto",
	},
};

interface TopNavigationProps {
	loggedInUser: User;
	className?: string;
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
}: TopNavigationProps) => {
	const intl = useIntl();

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

				<AccountPopupButton
					loggedInUser={loggedInUser}
				/>
				<QuickSettingsPopupButton
				/>
			</Toolbar>
		</AppBar>
	);
}

export { TopNavigation as Unwrapped };

export default TopNavigation;