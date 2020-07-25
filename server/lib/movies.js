import async from 'async';
import redis from 'redis';
import createClient from './redis-host';
const movieStorage = createClient({ prefix: 'moviestorage' });
const movieSession = createClient({ prefix: 'moviesession' });

// module.exports = function() {
//     function createDummyData(){
//       movieStorage.set("1", JSON.stringify({movie_name: "Race3", movie_id: 1, session_id: "a12345", user: "Raj"}), redis.print)
//       movieStorage.set("2", JSON.stringify({movie_name: "Thugs of hindustan", movie_id: 2, session_id: "b4567", user: "Raj"}), redis.print)
//       movieStorage.set("3", JSON.stringify({movie_name: "Pineapple express", movie_id: 3, session_id: "c23452", user: "Raj"}), redis.print)
//     }
// }

export const createDummyData = () => {
	movieStorage.set(
		'1',
		JSON.stringify({
			movie_name: 'Race3',
			movie_id: 1,
			session_id: 'a12345',
			user: 'Raj',
		}),
		redis.print,
	);
	movieStorage.set(
		'2',
		JSON.stringify({
			movie_name: 'Thugs of hindustan',
			movie_id: 2,
			session_id: 'b4567',
			user: 'Raj',
		}),
		redis.print,
	);
	movieStorage.set(
		'3',
		JSON.stringify({
			movie_name: 'Pineapple express',
			movie_id: 3,
			session_id: 'c23452',
			user: 'Raj',
		}),
		redis.print,
	);
};

export const fetchMovieSession = (session_id, callback) => {
	movieSession.get(session_id, (err, reply) => {
		if (err) console.log('err------------');
		if (!reply) {
			reply = '{}';
		}
		callback(JSON.parse(reply));
	});
};

export const generateSession = (session_id, moviestorage, user, callback) => {
	movieStorage.get(moviestorage, (error, value) => {
		if (error) {
			return console.log(error);
		}
		const data = JSON.parse(value) || {};
		data.user = user;
		movieSession.set(session_id, JSON.stringify(data), redis.print);
		callback(data);
	});
};

export const get = callback => {
	movieStorage.keys('moviestorage*', (err, keys) => {
		if (err) {
			callback([]);
			return console.log(err);
		}
		if (keys) {
			console.log(keys);
			async.map(
				keys,
				(key, cb) => {
					// keys(*) dont work with prefix https://github.com/NodeRedis/node-redis
					key = key.replace('moviestorage', '');
					movieStorage.get(key, (error, value) => {
						if (error) {
							callback([]);
							return cb(error);
						}
						console.log(value);
						const job = {};
						job['key'] = key;
						job['data'] = JSON.parse(value);
						cb(null, job);
					});
				},
				(error, results) => {
					if (error) {
						callback([]);
						return console.log(err);
					}
					console.log(results);
					callback(results);
				},
			);
		}
	});
};

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
