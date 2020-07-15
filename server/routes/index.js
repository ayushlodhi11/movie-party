import express from 'express';
import * as movies from '../lib/movies.js';
import path from 'path';
const router = express.Router();

/* GET home page. */
router.get('/', renderPage);
router.get('/party/:session_id', renderPage);
router.get('/base', renderHomePage);
router.get('/stream/:moviestorage', generateStreamLink);
router.get('/:session_id', renderStreamingPage);

/*
 When the user logs in (in our case, does http POST w/ user name), store it
 in Express session (which inturn is stored in Redis)
 */
router.post('/user', async (req, res) => {
	const user = req.body.user; //set username to session
	const token = generate_session_id();
	await req.setSession(token, user);
	res.json({ user, token });
});

// router.get('/logout', function(req, res) {
//     req.session.destroy();
//     res.redirect('/');
// });

function renderPage(req, res) {
	res.sendFile(path.join(__dirname + '../../../dist/index.html'));
}

function generateStreamLink(req, res) {
	const moviestorage = req.params.moviestorage;
	const user = req.session.user;
	const session_id = generate_session_id();
	movies.generateSession(session_id, moviestorage, user, movieSession => {
		res.json({ movieSession, session_id, user: req.session.user });
	});
}

function renderHomePage(req, res) {
	// movies.createDummyData();
	const serverName = getServer();
	movies.get(movies => {
		res.json({
			title: 'Express',
			server: serverName,
			user: req.session.user,
			movies: movies,
		});
	});
}

function renderStreamingPage(req, res) {
	const serverName = getServer();
	const session_id = req.params.session_id;
	//regenerate new session & store user from previous session (if it exists)
	//debugger
	movies.fetchMovieSession(session_id, movieSession => {
		res.json({
			title: 'Express',
			server: serverName,
			user: req.session.user,
			session_id: session_id,
			movieSession: movieSession,
		});
	});
}

function getServer() {
	return process.env.VCAP_APP_HOST
		? process.env.VCAP_APP_HOST + ':' + process.env.VCAP_APP_PORT
		: 'localhost:3000';
}

function generate_session_id() {
	const length = 20;
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghi-----jklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

export default router;
