'use strict';
import createClient from '../lib/redis-host';

const sub = createClient({ prefix: 'stream' });
const pub = createClient({ prefix: 'stream' });
sub.subscribe('redisstream');

export default function(io) {
	io.on('connection', function(socket) {
		/*
         When the user sends a chat message, publish it to everyone (including myself) using
         Redis' 'pub' client we created earlier.
         Notice that we are getting user's name from session.
         */
		socket.on('socketstream', function(msg) {
			const message = JSON.parse(msg);
			const reply = {
				type: 'action',
				user: message.user,
				msg: 'action',
				session_id: message.session_id,
				moviedata: message.moviedata,
			};
			pub.publish('redisstream', JSON.stringify(reply));
		});

		/*
         When a user joins the channel, publish it to everyone (including myself) using
         Redis' 'pub' client we created earlier.
         Notice that we are getting user's name from session.
         */
		socket.on('joinstream', function(data) {
			const msg = JSON.parse(data);
			const reply = {
				type: 'join',
				user: msg.user,
				msg: ' joined the channel',
				session_id: msg.session_id,
				moviedata: {},
			};
			pub.publish('redisstream', JSON.stringify(reply));
		});

		/*
         Use Redis' 'sub' (subscriber) client to listen to any message from Redis to server.
         When a message arrives, send it back to browser using socket.io
         */
		sub.on('message', function(channel, message) {
			const msg = JSON.parse(message);
			socket.emit(msg.session_id, message);
		});
	});
}

// function fetchMovieAction(session_id, callback){
//     const a =  movieStorage.get(session_id, function(err, reply) {
//       if(!reply) { reply = "{}" }
//       callback(JSON.parse(reply));
//     });
// }

// function saveMovieAction(session_id, moviedata){
//     console.log(moviedata,"moviedata")
//     fetchMovieAction(session_id, function(old_movie_data){
//         if(!old_movie_data) { old_movie_data = moviedata}
//         old_movie_data.pause = moviedata.pause;
//         old_movie_data.time = moviedata.time;
//         old_movie_data = JSON.stringify(old_movie_data)
//         movieStorage.set(session_id, old_movie_data, redis.print)
//     })
// }
