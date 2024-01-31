"use client";

import { useCallback, useState } from "react";
import { IconButton, Popover } from "@mui/material";
import AccountCircleIcon    from "@mui/icons-material/AccountCircle";
import AccountDialog from "@app/containers/AccountDialog";
import { User } from "@shared/user";


const AccountPopupButton = ({
}: {
}) => {
	const [accountButtonEl, setAccountButtonEl] = useState<Element|null>(null);

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

    return (
        <>
            <IconButton
                key="account popup button"
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
                />
            </Popover>
        </>
    );
};

export default AccountPopupButton;
