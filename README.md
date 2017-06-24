# Quintro

Classic marble game in HTML

# Game description

The game is quite simple: players go around in a set order, placing marbles of their color onto a board. The goal of the game is to get at least five marbles of your color in a line (vertically, horizontally, or diagonally). As the board gets more and more marbles on it, players have to keep track of more potential wins and decide whether to interfere with them or continue with their own efforts.

# Technical structure

Anyone can create a game, with some configurable parameters like board width/height and maximum number of players. Users connect to a created game and communicate with a [Socket.io](https://socket.io) server that tracks game state, storing it in a [MongoDB](https://mongodb.com) database. The server uses [Express](http://expressjs.com/) and builds its static content (CSS/JS) via [Webpack](https://webpack.github.io/).

The frontend is a [ReactJS](https://facebook.github.io/react/)/[Redux](http://redux.js.org/) web app and uses [Less](http://lesscss.org/) for styling.

The socket server can either be run as a standalone Express app or inline as part of the same server that serves the website. The static content can be served either from a directory on the filesystem that Webpack writes its results into, or via [webpack-dev-server](https://webpack.github.io/docs/webpack-dev-server.html) (the latter is better for development, as it contains some usefule features like hot module reloading, filesystem watching and linting.
