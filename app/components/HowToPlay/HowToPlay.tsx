import React             from "react";
import PropTypes         from "prop-types";
import { withStyles }    from "@mui/material/styles";
import {
	FormattedMessage
}                        from "react-intl";

import Config            from "@app/config";
import multiQuintroImage from "@app/images/how-to-play/multi-quintro.png";

import messages from "./messages";

const styles = {
	header: {
		textAlign: "center",
	},
	
	figure: {
		textAlign: "center",
	},

	figureImage: {
		maxWidth: "30em",
	},

	figureCaption: {
		fontStyle: "italic",
	},
};

/**
 * Component representing a description of how to play the game.
 *
 * @extends external:React.PureComponent
 *
 * @memberof client.react-components
 */
function HowToPlay({ classes }) {
	return (
		<section
		>
			<header
				className={classes.header}
			>
				<h1>
					<FormattedMessage
						{...messages.header}
					/>
				</h1>
			</header>
			<div>
				<p>
					<FormattedMessage
						{...messages.sections.intro.text}
					/>
				</p>
				<h2>
					<FormattedMessage
						{...messages.sections.turns.header}
					/>
				</h2>
				<p>
					<FormattedMessage
						{...messages.sections.turns.text}
					/>
				</p>
				<h2>
					<FormattedMessage
						{...messages.sections.winning.header}
					/>
				</h2>
				<p>
					<FormattedMessage
						{...messages.sections.winning.text}
					/>
				</p>
				<figure
					className={classes.figure}
				>
					<img
						src={`${Config.staticContent.url}${multiQuintroImage}`}
						className={classes.figureImage}
					/>
					<figcaption
						className={classes.figureCaption}
					>
						<FormattedMessage
							{...messages.figure.caption}
						/>
					</figcaption>
				</figure>
			</div>
		</section>
	);
}

HowToPlay.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(HowToPlay);
