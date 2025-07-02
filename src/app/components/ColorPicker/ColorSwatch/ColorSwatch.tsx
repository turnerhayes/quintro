import React, { CSSProperties } from "react";
import Config, { ColorID } from "@root/config";
import * as styles from "./ColorSwatch.module.scss";
import classNames from "classnames";


export const ColorSwatch = (
	{
		color,
		className,
	}: {
		color: ColorID;
		className?: string;
	}
) => {
	return (
		<span
			className={classNames(
				className,
				styles.root,
			)}
			style={{
				"--color": Config.game.colors.get(color).hex,
			} as CSSProperties}
		/>
	);
};
