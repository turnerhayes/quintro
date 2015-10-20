"use strict";

process.env.DATA_DB_URI               = process.env.DATA_DB_URI || process.env.MONGOLAB_URI;
process.env.SESSION_STORE_URI         = process.env.DATA_DB_URI;
process.env.ENVIRONMENT               = process.env.ENVIRONMENT || process.env.NODE_ENV;
process.env.NODE_ENV                  = process.env.ENVIRONMENT;
process.env.APP_ADDRESS_IS_SECURE     = process.env.APP_ADDRESS_IS_SECURE !== undefined ?
	process.env.APP_ADDRESS_IS_SECURE :
	true;
process.env.APP_ADDRESS_HOST          = process.env.APP_ADDRESS_HOST || "quintro.herokuapp.com";
process.env.USE_ENVIRONMENT_CONFIG    = process.env.USE_ENVIRONMENT_CONFIG !== undefined ?
	process.env.USE_ENVIRONMENT_CONFIG :
	true;
process.env.LOGGING_USE_CONSOLE       = true;
process.env.WEB_SOCKETS_INLINE        = true;
