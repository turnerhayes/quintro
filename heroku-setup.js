"use strict";

process.env.DATA_DB_URI               = process.env.DATA_DB_URI || process.env.MONGOLAB_URI;
process.env.SESSION_DB_URI            = process.env.DATA_DB_URI;
process.env.ENVIRONMENT               = process.env.ENVIRONMENT || process.env.NODE_ENV;
process.env.APP_ADDRESS_IS_SECURE     = 1;
process.env.APP_ADDRESS_HOST          = "quintro.herokuapp.com";
process.env.APP_ADDRESS_EXTERNAL_PORT = null;
process.env.USE_ENVIRONMENT_CONFIG    = true;
process.env.LOGGING_USE_CONSOLE       = 1;
