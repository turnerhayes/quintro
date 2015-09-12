import SocketIOClient from "socket.io-client";
import $ from "jquery";

class SocketClient {
	constructor() {
		var client = this;

		client._ioClient = new SocketIOClient();

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
