import React from "react";
import { Map } from "immutable";
import { shallow, mount } from "enzyme";
import { MemoryRouter } from "react-router";
import Loadable from "react-loadable";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import SimpleBackdrop from "@mui/material/Modal/SimpleBackdrop";

import AccountDialog from "@app/components/AccountDialog";
import { intl, mockStore, wrapWithProviders } from "@app/utils/test-utils";

import { Unwrapped as TopNavigation } from "./TopNavigation";


describe("TopNavigation component", () => {
	describe("Menu buttons", () => {
		it("should open the account dialog popup when account button clicked", async () => {
			// eslint-disable-next-line no-magic-numbers
			expect.assertions(3);
			
			// The AccountDialog is wrapped in a Loadable, so is not immediately
			// rendered on mount unless we preload them here
			await Loadable.preloadAll();

			const store = mockStore();

			const wrapper = mount(
				wrapWithProviders(
					(
						<TopNavigation
							classes={{}}
							intl={intl}
							store={store}
						/>
					),
					{
						store,
					}
				)
			);

			const iconButton = wrapper.find(IconButton).filterWhere(
				(button) => button.key() === "account popup button"
			);

			iconButton.simulate("click");

			wrapper.update();

			const accountDialog = wrapper.find(AccountDialog);

			expect(accountDialog).toExist();
			expect(accountDialog.closest("Popover")).toHaveProp("open", true);

			wrapper.find(SimpleBackdrop).simulate("click");

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
				wrapWithProviders(
					(
						<TopNavigation
							classes={{}}
							intl={intl}
						/>
					),
					{
						store,
					}
				)
			);

			wrapper.find(IconButton).filterWhere(
				(button) => button.key() === "quick settings button"
			).simulate("click");

			const settingsDialog = wrapper.find("QuickSettingsDialog");

			expect(settingsDialog).toExist();
			expect(settingsDialog.closest("Popover")).toHaveProp("open", true);

			wrapper.find(SimpleBackdrop).simulate("click");

			expect(wrapper.find("QuickSettingsDialog").closest("Popover")).toHaveProp("open", false);
		});
	});

	describe("Links", () => {
		it("should have a link to find a game", () => {
			const wrapper = shallow(
				<MemoryRouter>
					<TopNavigation
						classes={{}}
						intl={intl}
					/>
				</MemoryRouter>
			);

			expect(
				wrapper.find(TopNavigation).shallow()
					.find(Button).filter("[to='/game/find']")
			).toExist();
		});

		it("should have a link to home", () => {
			const wrapper = shallow(
				<MemoryRouter>
					<TopNavigation
						classes={{}}
						intl={intl}
					/>
				</MemoryRouter>
			);

			expect(wrapper.find(TopNavigation).shallow().find("Link[to='/']")).toExist();
		});

		it("should have a link to the how to play page", () => {
			const wrapper = shallow(
				<MemoryRouter>
					<TopNavigation
						classes={{}}
						intl={intl}
					/>
				</MemoryRouter>
			);

			expect(
				wrapper.find(TopNavigation).shallow()
					.find(Button).filter("[to='/how-to-play']")
			).toExist();
		});

		it("should have a link to create a game", () => {
			const wrapper = shallow(
				<MemoryRouter>
					<TopNavigation
						classes={{}}
						intl={intl}
					/>
				</MemoryRouter>
			);

			expect(
				wrapper.find(TopNavigation).shallow()
					.find(Button).filter("[to='/game/create']")
			).toExist();
		});
	});
});
