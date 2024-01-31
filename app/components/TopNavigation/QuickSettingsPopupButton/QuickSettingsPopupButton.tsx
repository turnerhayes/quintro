"use client";

import { useCallback, useState } from "react";
import { Card, CardContent, IconButton, Popover } from "@mui/material";
import SettingsIcon         from "@mui/icons-material/Settings";
import QuickSettingsDialog from "@app/containers/QuickSettingsDialog";

const QuickSettingsPopupButton = () => {
	const [quickSettingsButtonEl, setQuickSettingsButtonEl] = useState<Element|null>(null);


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
        <>
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
        </>
    );
};

export default QuickSettingsPopupButton;
