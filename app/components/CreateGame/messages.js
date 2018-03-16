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
		width: {
			label: {
				id: "quintro.components.CreateGame.form.width.label",
			},
		},
		height: {
			label: {
				id: "quintro.components.CreateGame.form.height.label",
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
