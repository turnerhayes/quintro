import Promise        from "bluebird";
import SocketIOClient from "socket.io-client";
import dbg            from "debug";
import Config         from "@app/config";

let debug = dbg("quintro:socket-client");

let _client;

const _handleConnectError = (reason, error) => {
	debug(`Socket connection failure (${reason})`);

	_client.emit("connection:closed", {
		reason: reason,
		error: error
	});
};

const _handleReconnect = () => {
	debug("Reconnected to socket server");

	_client.emit("connection:restored");
};

function initClient() {
	_client = new SocketIOClient(
		Config.websockets.url,
		{
			path: Config.websockets.path,
			"sync disconnect on unload": true
		}
	);

	const handlers = {
		connect_error: _handleConnectError.bind(undefined, "connect_error"),
		connect_timeout: _handleConnectError.bind(undefined, "connect_timeout"),
		reconnect_error: _handleConnectError.bind(undefined, "reconnect_error"),
		reconnect_failed: _handleConnectError.bind(undefined, "reconnect_failed"),
		reconnect: _handleReconnect,
	};

	for (let eventName in handlers) {
		// istanbul ignore else
		if (Object.prototype.hasOwnProperty.call(handlers, eventName)) {
			_client.on(eventName, handlers[eventName]);
		}
	}
}

class SocketClient {
	constructor() {
		if (!_client) {
			initClient();
		}

		let _isDisposed = false;

		Object.defineProperty(
			this,
			"isDisposed",
			{
				configurable: true,
				enumerable: true,
				get: () => _isDisposed,
			}
		);

		this.dispose = () => {
			_isDisposed = true;
		};
	}

	emit(eventName, eventData) {
		return new Promise(
			(resolve, reject) => {
				_client.emit(eventName, eventData, (result) => {
					if (result && result.error) {
						reject(new Error(`Socket error: ${result.message}`));
					}
					else {
						resolve(result);
					}
				});
			}
		);
	}

	on(...args) {
		return _client.on(...args);
	}

	off(...args) {
		return _client.off(...args);
	}
}

export default SocketClient;
