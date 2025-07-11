import { type CSSProperties } from "react";
import Config, { type ColorID } from "@/config";
import styles from "./ColorSwatch.module.css";
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
