import SocketIOClient from "socket.io-client";
import $ from "jquery";
import WebsocketsConfig from "../../config/websockets";

var websocketsUrl = WebsocketsConfig.domain;

if (WebsocketsConfig.port) {
	websocketsUrl += ':' + WebsocketsConfig.port;
}

if (WebsocketsConfig.path) {
	websocketsUrl += '/' + WebsocketsConfig.path;
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
