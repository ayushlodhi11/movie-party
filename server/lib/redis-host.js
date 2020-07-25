import redis from 'redis';

export default function(options) {
	const host = process.env.REDIS_HOST || '127.0.0.1';
	const port = process.env.REDIS_PORT || '6379';
	const password = process.env.REDIS_PASSWORD;
	let prefix = null;
	if (options && options.prefix) {
		prefix = options.prefix;
	}
	return redis.createClient({ prefix: prefix, host: host, port: port, password: password });
}
