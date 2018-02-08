import Promise        from "bluebird";
import SocketIOClient from "socket.io-client";
import dbg            from "debug";
import Config         from "@app/config";

let debug = dbg("quintro:socket-client");

let _instance;

let _client;

class SocketClient {
	get isConnectionOpen() {
		return this._ioClient.connected;
	}

	static get instance() {
		if (!_instance) {
			_instance = new SocketClient();
		}

		return _instance;
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

		this._ioClient = _client;

		this._attachListeners();
	}

	_attachListeners = () => {
		if (this._listenersAttached) {
			return;
		}

		this._ioClient.on(
			"connect_error",
			this._handleConnectError.bind(
				this,
				"connect_error"
			)
		);

		this._ioClient.on(
			"connect_timeout",
			this._handleConnectError.bind(
				this,
				"connect_timeout"
			)
		);

		this._ioClient.on(
			"reconnect_error",
			this._handleConnectError
		);

		this._ioClient.on(
			"reconnect_failed",
			this._handleConnectError
		);

		this._ioClient.on(
			"reconnect",
			this._handleReconnect
		);

		window.addEventListener("beforeunload", () => { this._ioClient.close(); });

		this._listenersAttached = true;
	}

	emit(eventName, eventData) {
		return new Promise(
			(resolve, reject) => {
				this._ioClient.emit(eventName, eventData, (result) => {
					if (result.error) {
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
		return this._ioClient.on(...args);
	}

	off(...args) {
		return this._ioClient.off(...args);
	}

	_handleConnectError = (reason, error) => {
		debug("Socket connection failure (" + reason + ")");

		if (this._connectionOpen) {
			this.emit("connection:closed", {
				reason: reason,
				error: error
			});
		}
	}

	_handleReconnect = () => {
		debug("Reconnected to socket server");

		if (!this._connectionOpen) {
			this.emit("connection:restored");
		}
	}
}

/// DEBUG
window._SocketClient = SocketClient;
/// END DEBUG

export default SocketClient;
