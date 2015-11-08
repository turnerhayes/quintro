import _              from "lodash";
import $              from "jquery";
import Backbone       from "backbone";
import SocketIOClient from "socket.io-client";
import dbg            from "debug";
import config         from "../../lib/utils/config-manager";

var debug = dbg('quintro:socket-client');

var websocketsUrl;

if (config.websockets.inline) {
	websocketsUrl = '';
}
else {
	websocketsUrl = config.websockets.domain;

	if (config.websockets.externalPort) {
		websocketsUrl += ':' + config.websockets.externalPort;
	}

	if (config.websockets.path) {
		websocketsUrl += '/' + config.websockets.path;
	}
}

var LOCAL_EVENTS = ['connection'];

function _on(eventName) {
	var client = this;

	var colonIndex = eventName.indexOf(':');
	var eventPrefix;

	if (colonIndex) {
		eventPrefix = eventName.substring(0, colonIndex);

		if (_.contains(LOCAL_EVENTS, eventPrefix)) {
			Backbone.Events.on.apply(client, arguments);
			return client;
		}
	}

	client._ensureClient().on.apply(client._ensureClient(), arguments);

	return client;
}

class SocketClient {
	get isConnectionOpen() {
		return this._connectionOpen;
	}

	emit() {
		var client = this;

		return client._ensureClient().emit.apply(client._ensureClient(), arguments);
	}

	_ensureClient() {
		var client = this;

		if (!client._ioClient) {
			client._ioClient = new SocketIOClient(
				websocketsUrl,
				{
					'sync disconnect on unload': true
				}
			);

			client._connectionOpen = true;

			client._ioClient.on(
				'connect_error',
				_.bind(
					client._handleConnectError,
					client,
					'connect_error'
				)
			);

			client._ioClient.on(
				'connect_timeout',
				_.bind(
					client._handleConnectError,
					client,
					'connect_timeout'
				)
			);

			client._ioClient.on(
				'reconnect_error',
				_.bind(
					client._handleConnectError,
					client,
					'reconnect_error'
				)
			);

			client._ioClient.on(
				'reconnect_failed',
				_.bind(
					client._handleConnectError,
					client,
					'reconnect_failed'
				)
			);

			client._ioClient.on(
				'reconnect',
				_.bind(
					client._handleReconnect,
					client
				)
			);

			$(window).on('beforeunload', function() {
				client._ioClient.close();
			});
		}

		return client._ioClient;
	}

	_handleConnectError(reason, error) {
		var client = this;

		debug('Socket connection failure (' + reason + ')');

		if (client._connectionOpen) {
			client.trigger('connection:closed', {
				reason: reason,
				error: error
			});
			client._connectionOpen = false;
		}
	}

	_handleReconnect() {
		var client = this;

		debug('Reconnected to socket server');

		if (!client._connectionOpen) {
			client.trigger('connection:restored');
			client._connectionOpen = true;
		}
	}
}

_.extend(SocketClient.prototype, Backbone.Events, {
	on: _on
});

export default new SocketClient();
