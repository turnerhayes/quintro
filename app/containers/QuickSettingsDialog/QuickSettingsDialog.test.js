import React from "react";
import { shallow } from "enzyme";

import createReducer from "@app/reducers";
import {
	changeSetting,
} from "@app/actions";
import { mockStore } from "@app/utils/test-utils";

import QuickSettingsDialog from "./QuickSettingsDialog";

describe("QuickSettingsDialog container", () => {
	it("should pass the correct props", () => {
		const reducer = createReducer();

		let state = reducer(undefined, {});

		let store =  mockStore(state);

		let wrapper = shallow(
			(
				<QuickSettingsDialog
				/>
			),
			{
				context: {
					store,
				},
			},
		);

		expect(wrapper).toHaveProp("enableSoundEffects", false);
		expect(wrapper).toHaveProp("enableNotifications", false);
		// Currently unused; may be used again if we start storing redux state
		// locally again
		expect(wrapper).toHaveProp("isLoadingStoredSettings", false);
		expect(wrapper).toHaveProp("onChangeSetting", expect.any(Function));

		state = [
			changeSetting({
				enableSoundEffects: true,
			}),
		].reduce(reducer, undefined);

		store = mockStore(state);

		wrapper = shallow(
			(
				<QuickSettingsDialog
				/>
			),
			{
				context: {
					store,
				},
			},
		);

		expect(wrapper).toHaveProp("enableSoundEffects", true);
		expect(wrapper).toHaveProp("enableNotifications", false);
		expect(wrapper).toHaveProp("isLoadingStoredSettings", false);
		expect(wrapper).toHaveProp("onChangeSetting", expect.any(Function));

		state = [
			changeSetting({
				enableNotifications: true,
			}),
		].reduce(reducer, undefined);

		store = mockStore(state);

		wrapper = shallow(
			(
				<QuickSettingsDialog
				/>
			),
			{
				context: {
					store,
				},
			},
		);

		expect(wrapper).toHaveProp("enableSoundEffects", false);
		expect(wrapper).toHaveProp("enableNotifications", true);
		expect(wrapper).toHaveProp("isLoadingStoredSettings", false);
		expect(wrapper).toHaveProp("onChangeSetting", expect.any(Function));
	});

	it("should dispatch a changeSetting action", () => {
		const reducer = createReducer();

		let state = reducer(undefined, {});

		let store =  mockStore(state);

		jest.spyOn(store, "dispatch");

		let wrapper = shallow(
			(
				<QuickSettingsDialog
				/>
			),
			{
				context: {
					store,
				},
			},
		);

		wrapper.prop("onChangeSetting")({
			enableSoundEffects: true,
			enableNotifications: true,
		});

		expect(store.dispatch).toHaveBeenCalledWith(changeSetting({
			enableSoundEffects: true,
			enableNotifications: true,
		}));
	});
});
