# Quintro

Classic marble game in HTML

# Game description

The game is quite simple: players go around in a set order, placing marbles of their color onto a board. The goal of the game is to get at least five marbles of your color in a line (vertically, horizontally, or diagonally). As the board gets more and more marbles on it, players have to keep track of more potential wins and decide whether to interfere with them or continue with their own efforts.

# Technical structure

Anyone can create a game, with some configurable parameters like board width/height and maximum number of players. Users connect to a created game and communicate with a [Socket.io](https://socket.io) server that tracks game state, storing it in a [MongoDB](https://mongodb.com) database. The server uses [Express](http://expressjs.com/) and builds its static content (CSS/JS) via [Webpack](https://webpack.github.io/).

The frontend is a [ReactJS](https://facebook.github.io/react/)/[Redux](http://redux.js.org/) web application and uses [Less](http://lesscss.org/) for styling.

The socket server can either be run as a standalone Express application or inline as part of the same server that serves the website. The static content can be served either from a directory on the filesystem that Webpack writes its results into, or via [webpack-dev-server](https://webpack.github.io/docs/webpack-dev-server.html) (the latter is better for development, as it contains some usefule features like hot module reloading, filesystem watching and linting.

# Installation

Clone this repo and run `npm install` from within its root directory.

# Configuration

The application requires a few things at minimum to run correctly. Configuration values are set via a [.env](https://github.com/motdotla/dotenv) file. A sample file with the relevant keys is available at `.env.example`.

## Database

The app uses a [MongoDB](https://www.mongodb.com/) database to back its sessions, game state, etc. There are a couple of keys in the .env file relevant to the database:

- `CREDENTIALS_DB_URL`: this should be a [MongoDB connection string uri](https://docs.mongodb.com/manual/reference/connection-string/) to the database where the application data is stored (game state, user profiles, etc.)

- `SESSION_DB_URL`: this should be a connection string to the database where the session data is stored. This can be the same as `CREDENTIALS_DB_URL`; if it's not specified, it will default to be the same.


## SSL

The application can be served with or without SSL. To serve it over SSL, specify the following `.env` variables:

- `APP_SSL_KEY`: a file path to an SSL key file
- `APP_SSL_CERT`: a file path to an SSL cert file

See [here](https://devcenter.heroku.com/articles/ssl-certificate-self) for instructions on how to create self-signed SSL keys and certificates--these are fine for development, but not good for production purposes.


## Sessions

In addition to the `SESSION_DB_URL` setting, you must also set the `SESSION_SECRET` setting; this is used to encrypt secure cookies.


## Static content

"Static content" refers to thinks like Javascript files, CSS stylesheets, images, sound files, etc. It can be served from the same server that serves the rest of the application, or from a separate server, such as a CDN. If you don't want to bother with that, you can leave the `STATIC_CONTENT_URL` setting empty. Otherwise, set it to the base URL for your static content server.

### Webpack Dev Server

For the purposes of development, the [Webpack dev server](https://webpack.js.org/guides/development/#using-webpack-dev-server) is very useful. You can start it up by running `npm run dev-server`. This will serve your static content and update it automatically when static content files change, as well as providing neat features like Hot Module Reload. To use it as your static content server, set `STATIC_CONTENT_URL=https://localhost:7200/` (this is assuming you are and the Webpack Dev Server on localhost, which is the default, and serving the application over SSL).


## Other Configuration Values

There are some other configuration options you can set in your `.env` file, including options for logging and social login flows like Facebook and Twitter. For descriptions of these options, look at the [example .env file](.env.example).
