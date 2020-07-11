'use strict';
import redis from 'redis';

const sub = redis.createClient({prefix: "stream"});
const pub = redis.createClient({prefix: "stream"});
const movieStorage = redis.createClient({prefix: "movie-storage"});
sub.subscribe("redisstream");

export default function(io) {
    io.on('connection', function(socket) {
        /*
         When the user sends a chat message, publish it to everyone (including myself) using
         Redis' 'pub' client we created earlier.
         Notice that we are getting user's name from session.
         */
        socket.on("socketstream", function(data) {
            const msg = JSON.parse(data);
            const reply = JSON.stringify({
                type: 'action',
                user: socket.handshake.session.user,
                msg: "action",
                session_id: msg.session_id,
                moviedata: msg.moviedata
            });
            // saveMovieAction(msg.session_id, msg.moviedata)
            console.log(msg.session_id,"------server-----------",reply)
            pub.publish("redisstream", reply);
        });

        /*
         When a user joins the channel, publish it to everyone (including myself) using
         Redis' 'pub' client we created earlier.
         Notice that we are getting user's name from session.
         */
        socket.on('joinstream', function(data) {
            const msg = JSON.parse(data);
            const reply = JSON.stringify({
                type: 'join',
                user: socket.handshake.session.user,
                msg: ' joined the channel',
                session_id: msg.session_id,
                moviedata: {}
            });
            console.log(msg.session_id,"------join-----------",reply)
            pub.publish("redisstream", reply);
        });

        /*
         Use Redis' 'sub' (subscriber) client to listen to any message from Redis to server.
         When a message arrives, send it back to browser using socket.io
         */
        sub.on('message', function(channel, message) {
            console.log("--channel--",message)
            const msg = JSON.parse(message);
            socket.emit(msg.session_id, message);
        });
    })
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
