import React from "react";
import { Map } from "immutable";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import { Provider } from "react-redux";
import Loadable from "react-loadable";
import configureStore from "redux-mock-store";
import AccountCircleIcon from "material-ui-icons/AccountCircle";
import SettingsIcon from "material-ui-icons/Settings";

import _TopNavigation from "./index";
import { wrapWithIntlProvider } from "@app/utils/test-utils";

const TopNavigation = wrapWithIntlProvider(_TopNavigation);

const mockStore = configureStore();

describe("TopNavigation component", () => {
	describe("Menu buttons", () => {
		it("should open the account dialog popup when account button clicked", async () => {
			// eslint-disable-next-line no-magic-numbers
			expect.assertions(3);
			
			// The AccountDialog is wrapped in a Loadable, so is not immediately
			// rendered on mount unless we preload them here
			await Loadable.preloadAll();

			const store = mockStore(Map());

			const wrapper = mount(
				<Provider
					store={store}
				>
					<MemoryRouter>
						<TopNavigation
						/>
					</MemoryRouter>
				</Provider>
			);

			wrapper.find("IconButton").filterWhere(
				(button) => button.find(AccountCircleIcon).exists()
			).simulate("click");

			const accountDialog = wrapper.find("AccountDialog");

			expect(accountDialog).toExist();
			expect(accountDialog.closest("Popover")).toHaveProp("open", true);

			wrapper.find("Backdrop").simulate("click");

			expect(wrapper.find("AccountDialog").closest("Popover")).toHaveProp("open", false);
		});

		it("should open the quick settings dialog popup when settings button clicked", async () => {
			// eslint-disable-next-line no-magic-numbers
			expect.assertions(3);
			
			// The QuickSettingsDialog is wrapped in a Loadable, so is not immediately
			// rendered on mount unless we preload them here
			await Loadable.preloadAll();

			const store = mockStore(Map());

			const wrapper = mount(
				<Provider
					store={store}
				>
					<MemoryRouter>
						<TopNavigation
						/>
					</MemoryRouter>
				</Provider>
			);

			wrapper.find("IconButton").filterWhere(
				(button) => button.find(SettingsIcon).exists()
			).simulate("click");

			const settingsDialog = wrapper.find("QuickSettingsDialog");

			expect(settingsDialog).toExist();
			expect(settingsDialog.closest("Popover")).toHaveProp("open", true);

			wrapper.find("Backdrop").simulate("click");

			expect(wrapper.find("QuickSettingsDialog").closest("Popover")).toHaveProp("open", false);
		});
	});

	describe("Links", () => {
		it("should have a link to find a game", () => {
			const wrapper = mount(
				<MemoryRouter>
					<TopNavigation
					/>
				</MemoryRouter>
			);

			expect(wrapper.find("Link[to='/game/find']")).toExist();
		});

		it("should have a link to home", () => {
			const wrapper = mount(
				<MemoryRouter>
					<TopNavigation
					/>
				</MemoryRouter>
			);

			expect(wrapper.find("Link[to='/']")).toExist();
		});

		it("should have a link to the how to play page", () => {
			const wrapper = mount(
				<MemoryRouter>
					<TopNavigation
					/>
				</MemoryRouter>
			);

			expect(wrapper.find("Link[to='/how-to-play']")).toExist();
		});

		it("should have a link to create a game", () => {
			const wrapper = mount(
				<MemoryRouter>
					<TopNavigation
					/>
				</MemoryRouter>
			);

			expect(wrapper.find("Link[to='/game/create']")).toExist();
		});
	});
});
