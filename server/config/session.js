const SESSION_DB_URL = process.env.SESSION_DB_URL || require("./storage").db.url;

module.exports = {
    secret: process.env.SESSION_SECRET,
    cookieName: process.env.SESSION_COOKIE_NAME || "quintro.sid",
    db: {
        url: SESSION_DB_URL,
    },
};
