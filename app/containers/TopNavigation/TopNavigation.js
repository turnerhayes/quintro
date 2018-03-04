import { connect }      from "react-redux";
import {
	users as userSelectors
}                       from "@app/selectors";
import TopNavigation    from "@app/components/TopNavigation";

const withRedux = connect(
	function mapStateToProps(state) {
		return {
			loggedInUser: userSelectors.getLoggedInUser(state), 
		};
	}
);

const TopNavigationContainer = withRedux(TopNavigation);

TopNavigationContainer.displayName = "TopNavigationContainer";

export default TopNavigationContainer;
