"use strict";

process.env.DATA_DB_URI    = process.env.MONGOLAB_URI;
process.env.DATA_DB_NAME   = "quintro";
process.env.SESSION_DB_URI = process.env.DATA_DB_URI;
