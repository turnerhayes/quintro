import React from "react";
import { mount, shallow } from "enzyme";
import { fromJS } from "immutable";
import { intlShape } from "react-intl";

import BoardRecord from "@shared-lib/board";
import Config from "@app/config";
import { intl } from "@app/utils/test-utils";
import { fetchedGame } from "@app/actions";
import selectors from "@app/selectors";
import createReducer from "@app/reducers";
import AddPlayerPopup from "@app/components/AddPlayerPopup";
import ColorPicker from "@app/components/ColorPicker";

describe("AddPlayerPopup component", () => {
	it("should call onSubmit callback", () => {
		const onSubmit = jest.fn().mockName("mock_onSubmit");

		const reducer = createReducer();

		let game = fromJS({
			name: "test",
			board: new BoardRecord({
				width: 10,
				height: 10,
			}),
			players: [],
			playerLimit: 3,
		});

		const state = reducer(undefined, fetchedGame({
			game,
		}));

		game = selectors.games.getGame(state, { gameName: game.get("name") });

		const wrapper = mount(
			(
				<AddPlayerPopup
					game={game}
					onSubmit={onSubmit}
				/>
			),
			{
				context: {
					intl,
				},

				childContextTypes: {
					intl: intlShape,
				},
			}
		);
		
		wrapper.find("form").simulate("submit");

		expect(onSubmit).toHaveBeenCalledWith({
			color: Config.game.colors[0].id,
		});
	});

	it("should filter colors based on existing players", () => {
		const reducer = createReducer();

		let game = fromJS({
			name: "test",
			board: new BoardRecord({
				width: 10,
				height: 10,
			}),
			players: [
				{
					color: Config.game.colors[0].id,
					user: {
						id: "1",
					},
				},
			],
			playerLimit: 3,
		});

		const state = reducer(undefined, fetchedGame({
			game,
		}));

		game = selectors.games.getGame(state, { gameName: game.get("name") });

		const wrapper = shallow(
			(
				<AddPlayerPopup
					game={game}
					onSubmit={() => {}}
				/>
			),
			{
				context: {
					intl,
				},

				childContextTypes: {
					intl: intlShape,
				},
			}
		);

		expect(
			// Need to dive in from the injectIntl HOC
			wrapper.dive()
		).toHaveState("color", Config.game.colors[1].id);
	});

	it("should update state with the selected color", () => {
		const reducer = createReducer();

		let game = fromJS({
			name: "test",
			board: new BoardRecord({
				width: 10,
				height: 10,
			}),
			players: [],
			playerLimit: 3,
		});

		const state = reducer(undefined, fetchedGame({
			game,
		}));

		game = selectors.games.getGame(state, { gameName: game.get("name") });

		const wrapper = shallow(
			(
				<AddPlayerPopup
					game={game}
					onSubmit={() => {}}
				/>
			),
			{
				context: {
					intl,
				},

				childContextTypes: {
					intl: intlShape,
				},
			}
		).dive();
		
		const color = Config.game.colors[2].id;

		wrapper.find(ColorPicker).prop("onColorChosen")({ color });

		expect(wrapper).toHaveState("color", color);
	});
});
