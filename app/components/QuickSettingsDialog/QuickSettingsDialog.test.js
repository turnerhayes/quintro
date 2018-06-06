import React from "react";
import { shallow } from "enzyme";

const NO_OP = () => {};

function mockNotify({
	isSupported = true,
	needsPermission = false,
} = {}) {
	const mockedModule = {
		needsPermission,

		requestPermission: jest.fn().mockResolvedValue()
			.mockName("mock_requestPermission"),

		isSupported: jest.fn().mockReturnValue(isSupported)
			.mockName("mock_isSupported"),
	};

	jest.doMock(
		"notifyjs",
		() => mockedModule
	);

	return mockedModule;
}

describe("QuickSettingsDialog component", () => {
	it("should change the notifications enabled setting on toggle", () => {
		expect.assertions(1);
		jest.resetModules();

		mockNotify();

		return import("./index").then(
			(module) => {
				const QuickSettingsDialog = module.default;

				const onChangeSetting = jest.fn();

				const wrapper = shallow(
					<QuickSettingsDialog
						onChangeSetting={onChangeSetting}
						enableSoundEffects={false}
						enableNotifications={false}
						isLoadingStoredSettings={false}
					/>
				);

				return wrapper.find(".notifications-switch")
					.prop("onChange")({ target: { checked: true } })
					// The event handler is asynchronous because it may need
					// to call the async Notify.requestPermission function
					.then(
						() => expect(onChangeSetting).toHaveBeenCalledWith({
							enableNotifications: true,
						})
					);
			}
		);
	});

	it("should request permission to show notifications when notifications enabled", () => {
		expect.assertions(1);
		jest.resetModules();

		const Notify = mockNotify({
			needsPermission: true,
		});

		return import("./index").then(
			(module) => {
				const QuickSettingsDialog = module.default;

				const wrapper = shallow(
					<QuickSettingsDialog
						onChangeSetting={NO_OP}
						enableSoundEffects
						enableNotifications={false}
						isLoadingStoredSettings={false}
					/>
				);

				wrapper.find(".notifications-switch")
					.prop("onChange")({ target: { checked: true } });

				expect(Notify.requestPermission).toHaveBeenCalled();
			}
		);
	});

	it("should disable the notifications switch if browser notifications are not supported", () => {
		expect.assertions(1);
		jest.resetModules();

		mockNotify({
			needsPermission: true,
			isSupported: false,
		});

		return import("./index").then(
			(module) => {
				const QuickSettingsDialog = module.default;
				const wrapper = shallow(
					<QuickSettingsDialog
						onChangeSetting={NO_OP}
						enableSoundEffects
						enableNotifications={false}
						isLoadingStoredSettings={false}
					/>
				);

				expect(wrapper.find(".notifications-switch")).toBeDisabled();
			}
		);
	});

	it("should change the sound effects enabled setting on toggle", () => {
		expect.assertions(1);
		jest.resetModules();

		return import("./index").then(
			(module) => {
				const QuickSettingsDialog = module.default;

				const onChangeSetting = jest.fn();

				const wrapper = shallow(
					<QuickSettingsDialog
						onChangeSetting={onChangeSetting}
						enableSoundEffects={false}
						enableNotifications={false}
						isLoadingStoredSettings={false}
					/>
				);

				wrapper.find(".sound-effects-switch")
					.prop("onChange")({ target: { checked: true } });

				expect(onChangeSetting).toHaveBeenCalledWith({
					enableSoundEffects: true,
				});
			}
		);
	});
});
