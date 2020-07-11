import express from 'express';
import movies from '../lib/movies.js';
const router = express.Router();

/* GET home page. */
router.get('/', renderHomePage);
router.get('/stream/:moviestorage', generateStreamLink);
router.get('/party/:session_id', renderStreamingPage);

/*
 When the user logs in (in our case, does http POST w/ user name), store it
 in Express session (which inturn is stored in Redis)
 */
router.post('/user', function (req, res) {
	req.session.user = req.body.user;//set username to session
	renderHomePage(req, res);
});

// router.get('/logout', function(req, res) {
//     req.session.destroy();
//     res.redirect('/');
// });

function generateStreamLink(req, res){
	const moviestorage = req.params.moviestorage;
	const serverName = getServer();
	const user = req.session.user;
	const session_id = generate_session_id()
	movies.generateSession(session_id, moviestorage, user)
	req.session.regenerate(function (err) {
		req.session.user = user;
		console.log('req.session.user ' + req.session.user);
		res.redirect('/party/'+session_id);
	});
}

function renderHomePage(req, res) {
	// movies.createDummyData()
	const serverName = getServer();
	//save user from previous session (if it exists)
	const user = req.session.user;
	//regenerate new session & store user from previous session (if it exists)
	req.session.regenerate(function (err) {
		req.session.user = user;
		console.log('req.session.user ' + req.session.user);
		movies.get((movies) => {
			res.render('index', { title:'Express', server:serverName, user:req.session.user, session_id: undefined, movies: movies});
		})
	});
}

function renderStreamingPage(req, res) {
	const serverName = getServer();
	const session_id = req.params.session_id;
	//save user from previous session (if it exists)
	const user = req.session.user;
	//regenerate new session & store user from previous session (if it exists)
	movies.fetchMovieSession(session_id, function(movieSession){
		req.session.regenerate(function (err) {
			req.session.user = user;
			console.log('req.session.user ' + req.session.user + ' ------- ' + session_id +"--"+ serverName + "---");
			res.render('index', { title:'Express', server:serverName, user:req.session.user, session_id: session_id, movieSession: movieSession});
		});
	})
}

function getServer(){
	return process.env.VCAP_APP_HOST ? process.env.VCAP_APP_HOST + ":" + process.env.VCAP_APP_PORT : 'localhost:3000';
}

function generate_session_id() {
	const length = 20;
	let result           = '';
	const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghi-----jklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for ( let i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

export default router


