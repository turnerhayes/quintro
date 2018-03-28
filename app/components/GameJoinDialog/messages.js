import { defineMessages } from "react-intl";

export default defineMessages({
	buttons: {
		watchGame: {
			label: {
				id: "quintro.components.GameJoinDialog.buttons.watchGame.label",
			},
		},
		join: {
			label: {
				id: "quintro.components.GameJoinDialog.buttons.join.label",
			},
		},
		cancel: {
			label: {
				id: "quintro.components.GameJoinDialog.buttons.cancel.label",
			},
		},
	},

	cannotJoinReasons: {
		gameIsFull: {
			id: "quintro.components.GameJoinDialog.cannotJoinReasons.gameIsFull",
		},

		gameIsInProgress: {
			id: "quintro.components.GameJoinDialog.cannotJoinReasons.gameIsInProgress",
		},
	},

	color: {
		id: "quintro.components.GameJoinDialog.color",
	},

	joinThisGamePrompt: {
		id: "quintro.components.GameJoinDialog.joinThisGamePrompt",
	},
});
