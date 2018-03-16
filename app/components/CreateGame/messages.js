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
		errors: {
			general: {
				isRequired: {
					id: "general.form.isRequired",
				},
			},
			nameInUse: {
				id: "quintro.components.CreateGame.form.errors.nameInUse",
			},
			dimensions: {
				invalid: {
					id: "quintro.components.CreateGame.form.errors.dimensions.invalid",
				},
				tooSmall: {
					id: "quintro.components.CreateGame.form.errors.dimensions.tooSmall",
				},
				tooLarge: {
					id: "quintro.components.CreateGame.form.errors.dimensions.tooLarge",
				},
			},
			playerLimit: {
				invalid: {
					id: "quintro.components.CreateGame.form.errors.playerLimit.invalid",
				},
				tooSmall: {
					id: "quintro.components.CreateGame.form.errors.playerLimit.tooSmall",
				},
				tooLarge: {
					id: "quintro.components.CreateGame.form.errors.playerLimit.tooLarge",
				},
			},
		},
	},
});
