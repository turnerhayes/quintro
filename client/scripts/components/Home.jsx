import React          from "react";
import PropTypes      from "prop-types";

class Home extends React.Component {
	static propTypes = {
		children: PropTypes.oneOfType([
			PropTypes.arrayOf(PropTypes.node),
			PropTypes.node
		])
	}

	static defaultProps = {
		children: []
	}

	render() {
		return (
			<div className="tab-content">
				<div className="tab-pane active" id="game-search" role="tabpanel">
					<div className="panel panel-default">
						<div className="panel-body">
						</div>
					</div>
				</div>
				<div className="tab-pane" id="game-create" role="tabpanel">
					<div className="panel panel-default">
						<div className="panel-body">
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Home;
