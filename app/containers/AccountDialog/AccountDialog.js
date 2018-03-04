import AccountDialog from "@app/components/AccountDialog";
import { connect }   from "react-redux";
import {
	login,
	logout
}                    from "@app/actions";
import {
	users as userSelectors
}                    from "@app/selectors";

const AccountDialogContainer = connect(
	function mapStateToProps(state) {
		const loggedInUser = userSelectors.getLoggedInUser(state);

		return {
			loggedInUser
		};
	},

	function mapDisaptchToProps(dispatch) {
		return {
			onLogout() {
				dispatch(logout());
			},

			onLogin({ provider }) {
				dispatch(login({ provider }));
			},
		};
	}
)(AccountDialog);

AccountDialogContainer.displayName = "AccountDialogContainer";

export default AccountDialogContainer;