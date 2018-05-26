import {
	eventChannel,
}                     from "redux-saga";
import createDebug    from "debug";

const debug = createDebug("quintro:client:sagas:socket-channel");


export default function createChannel(ClientConstructor) {
	let client;

	const channel = eventChannel(
		(emit) => {
			debug(`Creating a socket event channel for ${ClientConstructor.name}`);
			client = new ClientConstructor({
				dispatch: (action) => emit(action)
			});

			return () => {
				debug(`Closing socket event channel for ${ClientConstructor.name}`);
				channel.client.dispose();
				channel.client = null;
			};
		}
	);

	channel.client = client;

	return channel;
}
