import { defineMessages } from "react-intl";

export default defineMessages({
	label: {
		id: "quintro.components.GameFormControls.PlayerLimitInput.label",
	},

	errors: {
		general: {
			isRequired: {
				id: "quintro.general.form.isRequired",
			},
		},
		
		invalid: {
			id: "quintro.components.GameFormControls.PlayerLimitInput.errors.invalid",
		},
		tooSmall: {
			id: "quintro.components.GameFormControls.PlayerLimitInput.errors.tooSmall",
		},
		tooLarge: {
			id: "quintro.components.GameFormControls.PlayerLimitInput.errors.tooLarge",
		},
	},
});
