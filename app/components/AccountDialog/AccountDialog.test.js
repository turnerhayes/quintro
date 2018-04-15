import React from "react";
import { fromJS } from "immutable";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import { Link } from "react-router-dom";
import Icon from "material-ui/Icon";
import Button from "material-ui/Button";
import IconButton from "material-ui/IconButton";
import _AccountDialog from "./index";
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

	it("should call login callback with the appropriate provider when login button is clicked", () => {
		const onLogin = jest.fn();

		const selectedProvider = "facebook";

		const wrapper = mountDialog({
			enabledProviders: [ selectedProvider, "twitter" ],
			onLogin,
		});

		const instance = wrapper.find(UnwrappedComponent).instance();

		const loginButton = wrapper.find(IconButton).filterWhere(
			(el) => el.hasClass(instance.props.classes.loginLink) && el.key() === selectedProvider
		);

		expect(loginButton).toExist();

		loginButton.simulate("click");

		expect(onLogin).toHaveBeenCalledWith({ provider: selectedProvider });
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

	it("should call logout callback when logout button clicked", () => {
		const displayName = "Test Tester";

		const loggedInUser = fromJS({
			name: {
				display: displayName,
			},
			provider: "facebook",
		});

		const onLogout = jest.fn();

		const wrapper = mountDialog({
			loggedInUser,
			onLogout,
		});

		const logoutButton = wrapper.find(Button).filterWhere(
			(button) => button.findWhere(
				(el) => el.is(Icon) && el.text() === "log out"
			)
		);

		expect(logoutButton).toExist();

		logoutButton.simulate("click");

		expect(onLogout).toHaveBeenCalled();
	});
});
