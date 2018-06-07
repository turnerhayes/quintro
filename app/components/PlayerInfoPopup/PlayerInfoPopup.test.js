import React from "react";
import { fromJS } from "immutable";
import { shallow, mount } from "enzyme";
import { CardHeader } from "material-ui/Card";
import IconButton from "material-ui/IconButton";
import EditIcon from "material-ui-icons/Edit";
import CloseIcon from "material-ui-icons/Close";

import { intl } from "@app/utils/test-utils";

import { Unwrapped as PlayerInfoPopup } from "./PlayerInfoPopup";

const NO_OP = () => {};

function getEditIconFromShallowWrapper(wrapper) {
	return wrapper.find(CardHeader)
		.shallow().dive().find(IconButton)
		.filterWhere(
			(button) => button.find(EditIcon).exists()
		);
}

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

		const wrapper = shallow(
			<PlayerInfoPopup
				player={player}
				playerUser={playerUser}
				onDisplayNameChange={NO_OP}
				intl={intl}
			/>
		).find(CardHeader).shallow().dive();

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

		const wrapper = shallow(
			<PlayerInfoPopup
				player={player}
				playerUser={playerUser}
				onDisplayNameChange={NO_OP}
				intl={intl}
			/>
		).find(CardHeader).shallow().dive();

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

		const wrapper = shallow(
			<PlayerInfoPopup
				player={player}
				playerUser={playerUser}
				onDisplayNameChange={NO_OP}
				intl={intl}
			/>
		).find(CardHeader).shallow().dive();

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

		const wrapper = shallow(
			<PlayerInfoPopup
				player={player}
				playerUser={playerUser}
				onDisplayNameChange={NO_OP}
				intl={intl}
			/>
		);

		getEditIconFromShallowWrapper(wrapper).simulate("click", {});

		wrapper.update();

		expect(wrapper.find(CardHeader).shallow().dive().find(EditIcon)).not.toExist();

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

		// Need to mount this because the CloseIcon (all the endAdornment stuff)
		// doesn't seem to show up with shallow() (or at least it's not easy to
		// make it do so)
		const wrapper = mount(
			<PlayerInfoPopup
				player={player}
				playerUser={playerUser}
				onDisplayNameChange={NO_OP}
				intl={intl}
			/>
		);

		wrapper.find(IconButton)
			.filterWhere(
				(button) => button.find(EditIcon).exists()
			).simulate("click", {});

		wrapper.update();

		expect(wrapper.find(EditIcon)).not.toExist();

		expect(wrapper.find("form")).toExist();

		wrapper.find(
			IconButton).filterWhere((button) => button.find(CloseIcon).exists()
		).simulate("click");

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

		const wrapper = shallow(
			<PlayerInfoPopup
				player={player}
				playerUser={playerUser}
				onDisplayNameChange={NO_OP}
				intl={intl}
			/>
		);

		getEditIconFromShallowWrapper(wrapper).simulate("click");

		wrapper.update();

		expect(wrapper.find(EditIcon)).not.toExist();

		expect(wrapper.find("form")).toExist();

		wrapper.find("form").simulate("submit", {
			preventDefault() {},
		});

		expect(getEditIconFromShallowWrapper(wrapper)).toExist();

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

		const wrapper = shallow(
			<PlayerInfoPopup
				player={player}
				playerUser={playerUser}
				onDisplayNameChange={onDisplayNameChange}
				intl={intl}
			/>
		);

		getEditIconFromShallowWrapper(wrapper).simulate("click");

		wrapper.update();

		expect(getEditIconFromShallowWrapper(wrapper)).not.toExist();

		expect(wrapper.find("form")).toExist();

		wrapper.find("TextField[name='name']").simulate("change", { target: { value: testName } });

		wrapper.find("form").simulate("submit", {
			preventDefault() {},
		});

		expect(onDisplayNameChange).toHaveBeenCalledWith({
			displayName: testName,
			player,
		});
	});
});
