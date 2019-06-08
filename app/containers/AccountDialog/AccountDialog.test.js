import React from "react";
import { fromJS } from "immutable";
import { mount } from "enzyme";
import * as immutableMatchers from "jest-immutable-matchers";
import Icon from "@material-ui/core/Icon";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";

import { LOGOUT, LOGIN } from "@app/actions";
import { mockStore, wrapWithProviders } from "@app/utils/test-utils";

import AccountDialog from "./AccountDialog";

beforeAll(async () => {
	jest.addMatchers(immutableMatchers);
});

describe("AccountDialog container", () => {
	it("should pass the logged in user if user is logged in", () => {
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

		const wrapper = mount(
			wrapWithProviders(
				(
					<AccountDialog
					/>
				),
				{
					store,
				}
			)
		);

		expect(wrapper.find("AccountDialog").prop("loggedInUser")).toEqualImmutable(user);
	});

	it("should pass undefined for the logged in user if user is not logged in", () => {
		const store = mockStore(fromJS({
			users: {
			},
		}));

		const wrapper = mount(
			wrapWithProviders(
				(
					<AccountDialog
					/>
				),
				{
					store,
				}
			)
		);

		expect(wrapper.find("AccountDialog").prop("loggedInUser")).toBeUndefined();
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

		const wrapper = mount(
			wrapWithProviders(
				(
					<AccountDialog
					/>
				),
				{
					store,
				}
			)
		);

		const logoutButton = wrapper.find(Button).filterWhere(
			(button) => button.findWhere(
				(el) => el.is(Icon) && el.text() === "log out"
			)
		);

		logoutButton.simulate("click");

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

		const wrapper = mount(
			wrapWithProviders(
				(
					<AccountDialog
						enabledProviders={[ "facebook" ]}
					/>
				),
				{
					store,
				}
			)
		);

		const classes = wrapper.find("AccountDialog").prop("classes");
		
		const loginButton = wrapper.find(IconButton).filter(`.${classes.loginLink}`).first();

		loginButton.simulate("click");

		expect(store.dispatch).toHaveBeenCalledWith({
			type: LOGIN,
			payload: {
				provider: "facebook",
			},
		});
	});
});
