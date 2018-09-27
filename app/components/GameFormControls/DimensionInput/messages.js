import { defineMessages } from "react-intl";

export default defineMessages({
	width: {
		label: {
			id: "quintro.components.GameFormControls.DimensionInput.width.label",
		},
	},
	height: {
		label: {
			id: "quintro.components.GameFormControls.DimensionInput.height.label",
		},
	},
	errors: {
		general: {
			isRequired: {
				id: "quintro.general.form.isRequired",
			},
		},
		width: {
			invalid: {
				id: "quintro.components.GameFormControls.DimensionInput.errors.width.invalid",
			},
			tooSmall: {
				id: "quintro.components.GameFormControls.DimensionInput.errors.width.tooSmall",
			},
			tooLarge: {
				id: "quintro.components.GameFormControls.DimensionInput.errors.width.tooLarge",
			},
		},
		height: {
			invalid: {
				id: "quintro.components.GameFormControls.DimensionInput.errors.height.invalid",
			},
			tooSmall: {
				id: "quintro.components.GameFormControls.DimensionInput.errors.height.tooSmall",
			},
			tooLarge: {
				id: "quintro.components.GameFormControls.DimensionInput.errors.height.tooLarge",
			},
		},
	},
	keepRatio: {
		unlock: {
			id: "quintro.components.GameFormControls.DimensionInput.keepRatio.unlock",
		},
		
		lock: {
			id: "quintro.components.GameFormControls.DimensionInput.keepRatio.lock",
		},
	},
});
