import AccountDialog from "project/scripts/components/AccountDialog";
import { connect }   from "react-redux";
import {
	login,
	logout
}                    from "project/scripts/redux/actions";

const AccountDialogContainer = connect(
	null,
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
