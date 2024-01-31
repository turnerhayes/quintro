"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const storage_config_1 = __importDefault(require("./storage-config"));
const SESSION_DB_URL = process.env.SESSION_DB_URL || storage_config_1.default.db.url;
exports.default = {
    secret: process.env.SESSION_SECRET,
    cookieName: process.env.SESSION_COOKIE_NAME || "quintro.sid",
    db: {
        url: SESSION_DB_URL,
    },
};
