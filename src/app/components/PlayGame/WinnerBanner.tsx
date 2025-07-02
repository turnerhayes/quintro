import React from "react";
import { FormattedMessage } from "react-intl";

import Config, { ColorID } from "@root/config";
import * as styles from "./WinnerBanner.module.scss";


export const WinnerBanner = (
    {
        winnerColor,
    }: {
        winnerColor: ColorID;
    }
) => {
	return (
		<div
			className={styles.root}
		>
			<div
				className={styles.winMessage}
			>
				<FormattedMessage
                    id="quintro.components.PlayGame.WinnerBanner.winMessage"
                    defaultMessage="{winnerColor} wins!"
					values={{
						winnerColor: Config.game.colors.get(winnerColor).name,
					}}
				/>
			</div>
		</div>
	);
}
