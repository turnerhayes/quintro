import { useCallback, useState, type MouseEvent } from "react";
import { Link as RouterLink } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import { AppBar, Card, CardContent, IconButton, Popover, Toolbar, Link as MuiLink } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { QuickSettingsDialog } from "@/components/QuickSettingsDialog";
import { AccountDialog } from "@/components/AccountDialog";
import type { User } from "@/types";


const Link = (
    {
        to,
        title,
        children,
    }: {
        to: string;
        title?: string;
        children?: React.ReactNode;
    }
) => {
    return (
        <MuiLink
            component={RouterLink}
            to={to}
            title={title}
            color="textSecondary"
            underline="none"
            sx={{
                marginLeft: "1em",
                textTransform: "uppercase"
            }}
        >
            {children}
        </MuiLink>
    );
};


export const TopNav = (
    {
        loggedInUser,
    }: {
        loggedInUser?: User;
    }
) => {
    const intl = useIntl();
    const [accountButtonEl, setAccountButtonEl] = useState<HTMLElement|null>(null);
    const [quickSettingsButtonEl, setQuickSettingsButtonEl] = useState<HTMLElement|null>(null);

	/**
	 * Handles a click of the Account button.
	 */
	const onAccountButtonClick = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            setAccountButtonEl(event.target as HTMLElement);
        },
        [
            setAccountButtonEl,
        ]
    );

	const closeAccountDialog = useCallback(
        () => {
            setAccountButtonEl(null);
        },
        [
            setAccountButtonEl,
        ]
    );

	/**
	 * Handles a click of the Quick Settings button.
	 */
	const onQuickSettingsButtonClick = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            setQuickSettingsButtonEl(event.target as HTMLElement)
        },
        [
            setQuickSettingsButtonEl,
        ]
    );

	const closeQuickSettingsDialog = useCallback(
        () => {
            setQuickSettingsButtonEl(null);
        },
        [
            setQuickSettingsButtonEl,
        ]
    );

    return (
        <AppBar
            position="static"
        >
            <Toolbar>
                <Link
                    to="/"
                    title={intl.formatMessage({
                        id: "quintro.components.TopNavigation.links.home",
                        defaultMessage: "Home",
                    })}
                >
                    <HomeIcon/>
                </Link>
                <Link
                    to="/game/find"
                >
                    <FormattedMessage
                        id="quintro.components.TopNavigation.links.findGame"
                        defaultMessage="Find"
                    />
                </Link>
                <Link
                    to="/game/create"
                >
                    <FormattedMessage
                        id="quintro.components.TopNavigation.links.startGame"
                        defaultMessage="Create"
                    />
                </Link>
                <Link
                    to="/how-to-play"
                >
                    <FormattedMessage
                        id="quintro.components.TopNavigation.links.howToPlay"
                        defaultMessage="Help"
                    />
                </Link>

                <IconButton
                    key="account popup button"
                    onClick={onAccountButtonClick}
                    sx={{
                        marginLeft: "auto",
                    }}
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
};
