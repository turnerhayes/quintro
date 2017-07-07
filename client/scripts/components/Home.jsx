import React          from "react";
import PropTypes      from "prop-types";
import { connect }    from "react-redux";
import UserGamesList  from "project/scripts/components/UserGamesList";
import UserRecord     from "project/scripts/records/user";

class Home extends React.Component {
	static propTypes = {
		currentUser: PropTypes.instanceOf(UserRecord),
		children: PropTypes.oneOfType([
			PropTypes.arrayOf(PropTypes.node),
			PropTypes.node
		])
	}

	static defaultProps = {
		children: []
	}

	sidebar = (
		<UserGamesList
			user={this.props.currentUser}
		/>
	)

	render() {
		return (
			<div
			>
				
			</div>
		);
	}
}

export default connect(
	function mapStateToProps(state) {
		const currentUser = state.get("users").currentUser;

		return {
			currentUser
		};
	}
)(Home);
