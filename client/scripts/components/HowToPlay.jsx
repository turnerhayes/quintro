import React             from "react";
import Config            from "project/scripts/config";
import multiQuintroImage from "project/images/how-to-play/multi-quintro.png";
import                        "project/styles/how-to-play.less";

export default class HowToPlay extends React.Component {
	render() {
		return (
			<section
				className="c_how-to-play"
			>
				<header
					className="c_how-to-play--header"
				>
					<h1>
						How to Play Quintro
					</h1>
				</header>
				<div>
					<p>
					Quintro is a simple game played with marbles on a square board divided into a grid. The goal is to get five or more marbles of your color in a row before any other player.
					</p>
					<h2>
					Turns
					</h2>
					<p>
					Players take turns placing a single marble of their color on any unoccupied square on the board. Play order is determined at the start of the game and remains the same throughout the game.
					</p>
					<h2>
					Winning
					</h2>
					<p>
					Any line of five or more marbles of your color will cause you to win and the game to end. Lines can be horizontal, vertical, or diagonal. It is possible to have multiple &quot;quintros&quot; at once, if the last marble placed would complete multiple lines at once.
					</p>
					<figure
						className="c_how-to-play--figure"
					>
						<img
							src={`${Config.staticContent.url}${multiQuintroImage}`}
						/>
						<figcaption>
						The last marble placed (circled in red) completed two diagonal quintros
						</figcaption>
					</figure>
				</div>
			</section>
		);
	}
}
