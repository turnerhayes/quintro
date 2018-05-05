import React from "react";
import { fromJS } from "immutable";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import EditIcon from "material-ui-icons/Edit";
import CloseIcon from "material-ui-icons/Close";
import _PlayerInfoPopup from "./index";
import { wrapWithIntlProvider } from "@app/utils/test-utils";

const PlayerInfoPopup = wrapWithIntlProvider(_PlayerInfoPopup);

const NO_OP = () => {};

describe("PlayerInfoPopup component", () => {
	it("should show an edit icon if the player is the current user and current user is anonymous", () => {
		const player = fromJS({
			color: "blue",
			userID: "1",
		});

		const playerUser = fromJS({
			id: "1",
			isAnonymous: true,
			isMe: true,
		});

		const wrapper = mount(
			<PlayerInfoPopup
				player={player}
				playerUser={playerUser}
				onDisplayNameChange={NO_OP}
			/>
		);

		expect(wrapper.find(EditIcon)).toExist();
	});

	it("should not show an edit icon if the player is not the current user", () => {
		const player = fromJS({
			color: "blue",
			userID: "1",
		});

		const playerUser = fromJS({
			id: "1",
			isAnonymous: true,
		});

		const wrapper = mount(
			<PlayerInfoPopup
				player={player}
				playerUser={playerUser}
				onDisplayNameChange={NO_OP}
			/>
		);

		expect(wrapper.find(EditIcon)).not.toExist();
	});

	it("should not show an edit icon if the player is not anonymous", () => {
		const player = fromJS({
			color: "blue",
			userID: "1",
		});

		const playerUser = fromJS({
			id: "1",
			isMe: true,
		});

		const wrapper = mount(
			<MemoryRouter>
				<PlayerInfoPopup
					player={player}
					playerUser={playerUser}
					onDisplayNameChange={NO_OP}
				/>
			</MemoryRouter>
		);

		expect(wrapper.find(EditIcon)).not.toExist();
	});

	it("should show an edit form when the edit icon button is clicked", () => {
		const player = fromJS({
			color: "blue",
			userID: "1",
		});

		const playerUser = fromJS({
			id: "1",
			isAnonymous: true,
			isMe: true,
		});

		const wrapper = mount(
			<PlayerInfoPopup
				player={player}
				playerUser={playerUser}
				onDisplayNameChange={NO_OP}
			/>
		);

		wrapper.find("IconButton").filterWhere((button) => button.find(EditIcon).exists()).simulate("click");

		expect(wrapper.find(EditIcon)).not.toExist();

		expect(wrapper.find("form")).toExist();
	});

	it("should hide the edit form when the cancel button is clicked", () => {
		const player = fromJS({
			color: "blue",
			userID: "1",
		});

		const playerUser = fromJS({
			id: "1",
			isAnonymous: true,
			isMe: true,
		});

		const wrapper = mount(
			<PlayerInfoPopup
				player={player}
				playerUser={playerUser}
				onDisplayNameChange={NO_OP}
			/>
		);

		wrapper.find("IconButton").filterWhere((button) => button.find(EditIcon).exists()).simulate("click");

		expect(wrapper.find(EditIcon)).not.toExist();

		expect(wrapper.find("form")).toExist();

		wrapper.find("IconButton").filterWhere((button) => button.find(CloseIcon).exists()).simulate("click");

		expect(wrapper.find(EditIcon)).toExist();

		expect(wrapper.find("form")).not.toExist();
	});

	it("should hide the edit form when the form is submitted", () => {
		const player = fromJS({
			color: "blue",
			userID: "1",
		});

		const playerUser = fromJS({
			id: "1",
			isAnonymous: true,
			isMe: true,
		});

		const wrapper = mount(
			<PlayerInfoPopup
				player={player}
				playerUser={playerUser}
				onDisplayNameChange={NO_OP}
			/>
		);

		wrapper.find("IconButton").filterWhere((button) => button.find(EditIcon).exists()).simulate("click");

		expect(wrapper.find(EditIcon)).not.toExist();

		expect(wrapper.find("form")).toExist();

		wrapper.find("form").simulate("submit");

		expect(wrapper.find(EditIcon)).toExist();

		expect(wrapper.find("form")).not.toExist();
	});

	it("should call the onDisplayNameChange callback when the form is submitted", () => {
		const testName = "Tester Testerson";

		const player = fromJS({
			color: "blue",
			userID: "1",
		});

		const playerUser = fromJS({
			id: "1",
			isAnonymous: true,
			isMe: true,
		});

		const onDisplayNameChange = jest.fn();

		const wrapper = mount(
			<PlayerInfoPopup
				player={player}
				playerUser={playerUser}
				onDisplayNameChange={onDisplayNameChange}
			/>
		);

		wrapper.find("IconButton").filterWhere((button) => button.find(EditIcon).exists()).simulate("click");

		expect(wrapper.find(EditIcon)).not.toExist();

		expect(wrapper.find("form")).toExist();

		wrapper.find("input[name='name']").simulate("change", { target: { value: testName } });

		wrapper.find("form").simulate("submit");

		expect(onDisplayNameChange).toHaveBeenCalledWith({
			displayName: testName,
			player,
		});
	});
});
