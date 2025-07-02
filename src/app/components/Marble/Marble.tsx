import React, { CSSProperties }               from "react";
import classNames from "classnames";
import Config, { ColorID } from "@root/config";

import * as styles from "./Marble.module.scss";


export const Marble = (
	{
		color,
		size = "1em",
		className,
	}: {
		color: ColorID|null;
		size: string;
		className?: string;
	}
) => {
	return (
		<div
			className={classNames(
				className,
				styles.root,
				{
					[styles.empty]: color == null,
					[styles.filled]: color != null,
				}
			)}
			style={{
				"--size": size,
				"--color": color == null ?
					undefined :
					Config.game.colors.get(color).hex,
			} as CSSProperties}
		></div>
	);
}
