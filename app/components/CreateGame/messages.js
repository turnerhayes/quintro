import { defineMessages } from "react-intl";

export default defineMessages({
	header: {
		id: "quintro.components.CreateGame.header",
		defaultMessage: "Create A Game",
	},
	form: {
		dimensions: {
			label: {
				id: "quintro.components.CreateGame.form.dimensions.label",
			},
		},
		name: {
			label: {
				id: "quintro.components.CreateGame.form.name.label",
			},
		},
		playerLimit: {
			label: {
				id: "quintro.components.CreateGame.form.playerLimit.label",
			},
		},
		submitButton: {
			label: {
				id: "quintro.components.CreateGame.form.submitButton.label",
			},
		},
		errors: {
			general: {
				isRequired: {
					id: "quintro.general.form.isRequired",
				},
			},
			nameInUse: {
				id: "quintro.components.CreateGame.form.errors.nameInUse",
			},
		},
	},
});
