import { FormattedMessage } from "react-intl";
import classNames from "classnames";

import Config, { type ColorID } from "@/config";
import styles from "./WinnerBanner.module.css";


export const WinnerBanner = (
    {
        winnerColor,
		className,
    }: {
        winnerColor: ColorID;
		className?: string;
    }
) => {
	return (
		<div
			className={classNames(
				styles.root,
				className
			)}
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
