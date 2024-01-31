/* global process */

import * as sharedConfig from "@shared/config";

export type {PlayerColor} from "@shared/config";

const config = {...sharedConfig};

export default {
	...config,
	auth: {
		facebook: {
			isEnabled: Boolean(process.env.NEXT_PUBLIC_CREDENTIALS_FACEBOOK_ENABLED),
		},
		google: {
			isEnabled: Boolean(process.env.NEXT_PUBLIC_GOOGLE_CREDENTIALS_ENABLED),
		},
	},
};
