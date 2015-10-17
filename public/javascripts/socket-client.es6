import SocketIOClient from "socket.io-client";
import $ from "jquery";
import config from "../../lib/utils/config-manager";

var websocketsUrl = config.websockets.domain;

if (config.websockets.externalPort) {
	websocketsUrl += ':' + config.websockets.externalPort;
}

if (config.websockets.path) {
	websocketsUrl += '/' + config.websockets.path;
}

class SocketClient {
	constructor() {
		var client = this;

		client._ioClient = new SocketIOClient(websocketsUrl);

		$(window).on('beforeunload', function() {
			client._ioClient.close();
		});
	}

	emit() {
		var client = this;

		return client._ioClient.emit.apply(client._ioClient, arguments);
	}

	on() {
		var client = this;

		return client._ioClient.on.apply(client._ioClient, arguments);
	}
}

export default new SocketClient();
