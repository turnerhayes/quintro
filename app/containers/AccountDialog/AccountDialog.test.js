import React from "react";
import { fromJS } from "immutable";
import { shallow, mount } from "enzyme";
import configureStore from "redux-mock-store";
import * as immutableMatchers from "jest-immutable-matchers";
import { MemoryRouter } from "react-router";
import Icon from "material-ui/Icon";
import Button from "material-ui/Button";

import { wrapWithIntlProvider } from "@app/utils/test-utils";
import { LOGOUT, LOGIN } from "@app/actions";

import AccountDialog from "./AccountDialog";

const WrappedAccountDialog = wrapWithIntlProvider(AccountDialog);

const mockStore = configureStore();

beforeAll(async () => {
	jest.addMatchers(immutableMatchers);
});

describe("AccountDialog container", () => {
	it("should pass the logged in user if user is logged in", () => {
		const user = fromJS({
			id: "1",
			isMe: true,
		});

		const store = mockStore(fromJS({
			users: {
				currentID: user.get("id"),
				items: {
					[user.get("id")]: user,
				},
			},
		}));

		const wrapper = shallow(
			<WrappedAccountDialog
				store={store}
			/>
		);

		expect(wrapper.dive().dive().prop("loggedInUser")).toEqualImmutable(user);
	});

	it("should pass undefined for the logged in user if user is not logged in", () => {
		const store = mockStore(fromJS({
			users: {
			},
		}));

		const wrapper = shallow(
			<WrappedAccountDialog
				store={store}
			/>
		);

		expect(wrapper.dive().prop("loggedInUser")).toBeUndefined();
	});

	it("should dispatch a logout action", () => {
		const user = fromJS({
			id: "1",
			isMe: true,
			provider: "facebook",
		});

		const store = mockStore(fromJS({
			users: {
				currentID: user.get("id"),
				items: {
					[user.get("id")]: user,
				},
			},
		}));

		store.dispatch = jest.fn();

		jest.spyOn(document.location, "assign").mockImplementation(() => {});

		const WrappedAccountDialog = wrapWithIntlProvider(AccountDialog);

		const wrapper = mount(
			<MemoryRouter>
				<WrappedAccountDialog
					store={store}
				/>
			</MemoryRouter>
		);

		const logoutButton = wrapper.find(Button).filterWhere(
			(button) => button.findWhere(
				(el) => el.is(Icon) && el.text() === "log out"
			)
		);

		logoutButton.simulate("click");

		expect(document.location.assign).toHaveBeenCalledWith("/auth/logout?redirectTo=blank");

		expect(store.dispatch).toHaveBeenCalledWith({
			type: LOGOUT,
		});
	});

	it("should dispatch a login action", () => {
		const store = mockStore(fromJS({
			users: {
				items: {},
			},
		}));

		store.dispatch = jest.fn();

		jest.spyOn(document.location, "assign").mockImplementation(() => {});

		const wrapper = mount(
			<MemoryRouter>
				<WrappedAccountDialog
					store={store}
					enabledProviders={[ "facebook" ]}
				/>
			</MemoryRouter>
		);

		const classes = wrapper.find("AccountDialog").prop("classes");

		const loginButton = wrapper.find(`IconButton.${classes.loginLink}`).first();

		loginButton.simulate("click");

		expect(document.location.assign).toHaveBeenCalledWith("/auth/facebook?redirectTo=blank");

		expect(store.dispatch).toHaveBeenCalledWith({
			type: LOGIN,
		});
	});
});
