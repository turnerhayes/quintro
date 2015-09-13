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

	emit(eventName, ...data) {
		var client = this;

		client._ioClient.emit.apply(client._ioClient, [eventName].concat(data));
	}

	on(eventName, cb) {
		var client = this;

		client._ioClient.on.call(client._ioClient, eventName, cb);
	}
}

export default new SocketClient();
