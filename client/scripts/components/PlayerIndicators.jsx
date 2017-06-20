import React              from "react";
import ImmutablePropTypes from "react-immutable-proptypes";
import PropTypes          from "prop-types";
import PlayerRecord       from "project/scripts/records/player";
import                         "project/styles/player-indicators.less";

export default class PlayerIndicators extends React.Component {
	static propTypes = {
		players: ImmutablePropTypes.mapOf(
			PropTypes.instanceOf(PlayerRecord),
			PropTypes.string
		).isRequired,
		playerLimit: PropTypes.number.isRequired,
		currentPlayerColor: PropTypes.string,
		markCurrent: PropTypes.bool
	}

	render() {
		return (
			<ul
				className={`c_player-indicators ${this.props.markCurrent ? "mark-current" : ""}`}
			>
				{
					this.props.players.map(
						(player) => {
							const active = player.color === this.props.currentPlayerColor;
							return (
								<li
									key={player.color}
									className={`c_player-indicators--item ${active ? "active": ""} ${player.isMe ? "current-player" : ""} ${player.isPresent ? "" : "absent"}`}
									title={`${player.isMe ? "This is you" : "Player " + player.color + (player.isPresent ? "" : " is absent")}`}
								>
									<div
										className={`marble ${player.color}`}
									/>
								</li>
							);
						}
					).toList().sortBy((player) => player.order).toArray()
				}
				{
					[
						...Array(
							Math.max(
								this.props.playerLimit - this.props.players.size,
								0
							)
						)
					].map(
						(val, index) => (
							<li
								key={`not-filled-player-${index}`}
								className={`c_player-indicators--item`}
								title="This spot is open for another player"
							>
								<div
									className={`marble not-filled`}
								/>
							</li>
						)
					)
				}
			</ul>
		);
	}
}
