import { FormattedMessage } from 'react-intl';

import multiQuintroImage from '@/client/assets/images/how-to-play/multi-quintro.png';
import styles from './HowToPlay.module.css';

export const HowToPlay = () => {
	return (
		<section
		>
			<header
				className={styles.header}
			>
				<h1>
					<FormattedMessage
						id="quintro.components.HowToPlay.header"
						defaultMessage="How to Play Quintro"
					/>
				</h1>
			</header>
			<div>
				<p>
					<FormattedMessage
						id="quintro.components.HowToPlay.sections.intro.text"
						defaultMessage="Quintro is a simple game played with marbles on a square board divided into a grid. The goal is to get five or more marbles of your color in a row before any other player."				
					/>
				</p>
				<h2>
					<FormattedMessage
						id="quintro.components.HowToPlay.sections.turns.header"
						defaultMessage="Turns"
					/>
				</h2>
				<p>
					<FormattedMessage
						id="quintro.components.HowToPlay.sections.turns.text"
						defaultMessage="Players take turns placing a single marble of their color on any unoccupied square on the board. Play order is determined at the start of the game and remains the same throughout the game."				
					/>
				</p>
				<h2>
					<FormattedMessage
						id="quintro.components.HowToPlay.sections.winning.header"
						defaultMessage="Winning"
					/>
				</h2>
				<p>
					<FormattedMessage
						id="quintro.components.HowToPlay.sections.winning.text"
        				defaultMessage={'Any line of five or more marbles of your color will cause you to win and the game to end. Lines can be horizontal, vertical, or diagonal. It is possible to have multiple "quintros" at once, if the last marble placed would complete multiple lines at once.'}
					/>
				</p>
				<figure
					className={styles.figure}
				>
					<img
						src={multiQuintroImage}
						className={styles.figureImage}
					/>
					<figcaption
						className={styles.figureCaption}
					>
						<FormattedMessage
							id="quintro.components.HowToPlay.figure.caption"
							defaultMessage="The last marble placed (circled in red) completed two diagonal quintros"
						/>
					</figcaption>
				</figure>
			</div>
		</section>
	);
};
