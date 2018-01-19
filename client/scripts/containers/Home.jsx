import Home from "project/scripts/components/Home";
import { connect } from "react-redux";

const HomeContainer = connect(
	function mapStateToProps(state) {
		const currentUser = state.get("users").currentUser;

		return {
			currentUser,
		};
	}
)(Home);

HomeContainer.displayName = "HomeContainer";

export default HomeContainer;
