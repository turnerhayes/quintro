/* global process */

import * as sharedConfig from "@shared/config";

export type {PlayerColor} from "@shared/config";

const config = {...sharedConfig};

export default {
	...config,
	auth: {
		facebook: {
			isEnabled: process.env.CREDENTIALS_FACEBOOK_IS_ENABLED,
		},
		google: {
			isEnabled: process.env.CREDENTIALS_GOOGLE_IS_ENABLED,
		},
	},
};
