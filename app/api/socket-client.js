import Promise        from "bluebird";
import SocketIOClient from "socket.io-client";
import dbg            from "debug";
import Config         from "@app/config";

let debug = dbg("quintro:socket-client");

let _client;

// window.addEventListener("beforeunload", () => { _client && _client.close(); });

class SocketClient {
	get isConnectionOpen() {
		return _client.connected;
	}

	constructor() {
		if (!_client) {
			_client = new SocketIOClient(
				Config.websockets.url,
				{
					path: Config.websockets.path,
					"sync disconnect on unload": true
				}
			);
		}

		const handlers = {
			connect_error: (...args) => this._handleConnectError("connect_error", ...args),
			connect_timeout: (...args) => this._handleConnectError("connect_timeout", ...args),
			reconnect_error: (...args) => this._handleConnectError(...args),
			reconnect_failed: (...args) => this._handleConnectError(...args),
			reconnect: (...args) => this._handleReconnect(...args),
		};

		for (let eventName in handlers) {
			if (Object.prototype.hasOwnProperty.call(handlers, eventName)) {
				_client.on(eventName, handlers[eventName]);
			}
		}

		this.dispose = () => {
			for (let eventName in handlers) {
				if (Object.prototype.hasOwnProperty.call(handlers, eventName)) {
					_client.off(eventName, handlers[eventName]);
				}
			}

			_client = undefined;
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

	_handleConnectError = (reason, error) => {
		debug(`Socket connection failure (${reason})`);

		if (this.isConnectionOpen) {
			this.emit("connection:closed", {
				reason: reason,
				error: error
			});
		}
	}

	_handleReconnect = () => {
		debug("Reconnected to socket server");

		if (!this.isConnectionOpen) {
			this.emit("connection:restored");
		}
	}
}

export default SocketClient;
