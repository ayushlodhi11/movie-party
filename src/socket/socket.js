import io from 'socket.io-client';
import * as SOC_TYPES from './socket-event-types';

export const connect_to_socket = channel => {
	const socket = io.connect(channel, { reconnectionDelay: 1000, reconectionDelayMax: 5000 });

	socket.on('connect', body => {
		console.log('socket connected...................', body);
	});

	socket.on('disconnect', () => {
		console.log('socket disconnected..............');
	});

	socket.on(SOC_TYPES.RedisStream, data => {
		console.log('loaded', data);
	});

	return socket;
};

export const disconnect = socket => {
	socket.close();
};
