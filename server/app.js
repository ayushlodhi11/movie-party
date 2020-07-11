import express from 'express';
import path from 'path';
import redis from 'redis';
import logger from 'morgan';
import CookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import ExpressSession from 'express-session';
import connectRedis from 'connect-redis';
import routes from './routes/index';

const RedisStore = connectRedis(ExpressSession);
const rClient = redis.createClient();
const sessionStore = new RedisStore({client: rClient});
const SECRET = 'hellonihao';
const cookieParser = CookieParser(SECRET);

const app = express();

const session = ExpressSession({
  store: sessionStore,
  secret: SECRET,
  resave: true,
  saveUninitialized: true
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser);
app.use(session);
app.use(express.static(path.join(__dirname, 'public')));
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
  const errorToShow = (app.get('env') === 'development') ? {} : err;
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: errorToShow
  });
});

// passing the session store and cookieParser
app.sessionStore = sessionStore;
app.cookieParser = cookieParser;
app.session = session;

export default app;
