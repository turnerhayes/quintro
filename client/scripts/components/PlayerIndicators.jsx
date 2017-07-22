import React              from "react";
import ImmutablePropTypes from "react-immutable-proptypes";
import PropTypes          from "prop-types";
import PlayerRecord       from "project/scripts/records/player";
import PlayerInfoPopup    from "project/scripts/components/PlayerInfoPopup";
import                         "project/styles/player-indicators.less";

export default class PlayerIndicators extends React.Component {
	static propTypes = {
		players: ImmutablePropTypes.listOf(
			PropTypes.instanceOf(PlayerRecord)
		).isRequired,

		playerLimit: PropTypes.number.isRequired,

		currentPlayerColor: PropTypes.string,

		markCurrent: PropTypes.bool,

		onDisplayNameChange: PropTypes.func,
	}

	state = {
		selectedPlayerColor: null
	}

	togglePopoverOpened = (color) => {
		if (this.state.selectedPlayerColor && this.state.selectedPlayerColor === color) {
			this.setState({ selectedPlayerColor: null });
		}
		else {
			this.setState({ selectedPlayerColor: color });
		}
	}

	handlePlayerIndicatorClicked = (selectedPlayer) => {
		this.togglePopoverOpened((selectedPlayer && selectedPlayer.color) || null);
	}

	render() {
		return (
			<div
				className={`c_player-indicators ${this.props.markCurrent ? "mark-current" : ""}`}
			>
				<ul
					className="c_player-indicators--list"
				>
					{
						this.props.players.map(
							(player) => {
								const active = player.color === this.props.currentPlayerColor;

								const label = player.user.isMe ?
									"This is you" :
									(
										(player.user.name && player.user.name.get("display")) || `Player ${player.color}`  +
										(player.isPresent ? "" : " is absent")
									);

								return (
									<li
										key={player.color}
										id={`c_player-indicators--item--${player.color}`}
										className={`c_player-indicators--item ${active ? "active": ""} ${player.user.isMe ? "current-player" : ""} ${player.isPresent ? "" : "absent"}`}
										title={label}
										onClick={() => this.handlePlayerIndicatorClicked(player)}
									>
										<PlayerInfoPopup
											player={player}
											target={`c_player-indicators--item--${player.color}`}
											isOpen={this.state.selectedPlayerColor === player.color}
											toggle={() => this.togglePopoverOpened(player.color)}
											onDisplayNameChange={this.props.onDisplayNameChange}
										/>
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
			</div>
		);
	}
}
