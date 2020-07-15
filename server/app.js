import express from 'express';
import path from 'path';
import redis from 'redis';
import cors from 'cors';
import logger from 'morgan';
import bodyParser from 'body-parser';
import routes from './routes/index';
import { promisify } from 'util';

const session = redis.createClient();
const setAsync = promisify(session.set).bind(session);
const getAsync = promisify(session.get).bind(session);

const app = express();

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/../dist/'));

//custom session using redis
app.use(async (req, res, next) => {
	req.setSession = setAsync;
	req.session = {};
	if (req.query.token) {
		req.session.user = await getAsync(req.query.token);
	}
	next();
});

app.use(logger('dev'));
app.use('/', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler: will print stacktrace
// production error handler: no stacktraces leaked to user
app.use((err, req, res, next) => {
	const errorToShow = app.get('env') === 'development' ? {} : err;
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: errorToShow,
	});
});

export default app;
