import React from "react";
import { fromJS } from "immutable";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import { Link } from "react-router-dom";
import IconButton from "material-ui/IconButton";
import _AccountDialog from "./AccountDialog";
import { wrapWithIntlProvider, unwrapComponent } from "@app/utils/test-utils";

const NO_OP = () => {};

const AccountDialog = wrapWithIntlProvider(_AccountDialog);

const UnwrappedComponent = unwrapComponent(_AccountDialog);

function mountDialog(props) {
	// Have to wrap in a Router because otherwise it throws warnings about
	// using <Link> components outside a router
	return mount(
		<MemoryRouter>
			<AccountDialog
				onLogin={NO_OP}
				onLogout={NO_OP}
				{...props}
			/>
		</MemoryRouter>
	);
}

describe("AccountDialog component", () => {
	it("should show a login link for each supported provider if no user is logged in", () => {
		const providers = [ "facebook", "google", "twitter" ];

		const wrapper = mountDialog({
			enabledProviders: providers,
		});

		const instance = wrapper.find(UnwrappedComponent).instance();

		const loginButtons = wrapper.find(IconButton).filter(`.${instance.props.classes.loginLink}`);

		expect(loginButtons).toHaveLength(providers.length);
		providers.forEach(
			(provider) => expect(
				loginButtons.filterWhere(
					(el) => el.key() === provider
				)
			).toExist()
		);
	});

	it("should not show a login link for a provider if that provider is not supported", () => {
		const wrapper = mountDialog({
			enabledProviders: [ "facebook" ],
		});

		const instance = wrapper.find(UnwrappedComponent).instance();

		const loginButtons = wrapper.find(IconButton).filter(`.${instance.props.classes.loginLink}`);
		expect(
			loginButtons.filterWhere(
				(el) => el.key() === "twitter"
			)
		).not.toExist();
	});

	it("should show user display name if a user is logged in", () => {
		const displayName = "Test Tester";

		const loggedInUser = fromJS({
			name: {
				display: displayName,
			},
			provider: "facebook",
		});

		const wrapper = mountDialog({
			loggedInUser,
		});

		expect(wrapper.find(Link).filterWhere((el) => el.text() === displayName)).toExist();
	});
});
