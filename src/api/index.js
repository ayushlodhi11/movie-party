import { SERVER_URL, SERVER_PORT, TOKEN_NAME } from '../consts/app-config';
import configs from './fetch-configs';

export const get = (path, params = {}) => {
	const promise = new Promise((resolve, reject) => {
		const serverPath = new URL(`${SERVER_URL}:${SERVER_PORT}${path}`);
		params.token = window.localStorage.getItem(TOKEN_NAME);
		const fetchConfigs = configs('get', null, false);
		Object.keys(params).forEach(key => serverPath.searchParams.append(key, params[key]));
		fetch(serverPath, fetchConfigs)
			.then(response => {
				if (!response.ok) {
					console.log('fetch error');
				} else {
					return response.json();
				}
			})
			.then(data => {
				console.log(data, 'api data');

				return resolve(data);
			})
			.catch(err => {
				return reject(err);
			});
	});
	return promise;
};

export const post = (path, payload, params = {}, isMultipart = false) => {
	const promise = new Promise((resolve, reject) => {
		const serverPath = new URL(`${SERVER_URL}:${SERVER_PORT}${path}`);
		const fetchConfigs = configs('post', payload, isMultipart);
		params.token = window.localStorage.getItem(TOKEN_NAME);
		Object.keys(params).forEach(key => serverPath.searchParams.append(key, params[key]));
		fetch(serverPath, fetchConfigs)
			.then(response => {
				if (!response.ok) {
					if (response.status == 404) {
						const newResponse = { status: false, msg: 'Requested api not found' };
						return newResponse;
					} else if (response.status === 400) {
						throw response;
					}
				} else {
					return response.json();
				}
			})
			.then(data => {
				return resolve(data);
			})
			.catch(err => {
				err.text().then(errMsg => {
					reject(JSON.parse(errMsg));
				});
			});
	});
	return promise;
};

export const request = (method, path, payload, isMultipart) => {
	const newPromise = new Promise((resolve, reject) => {
		_request(method, path, payload, isMultipart, (err, response) => {
			if (err) {
				return reject(err);
			}
			return resolve(response);
		});
	});
	return newPromise;
};

async function _request(method, path, payload, isMultipart, cb) {
	const serverPath = `${SERVER_URL}:${SERVER_PORT}${path}`;
	const fetchConfigs = configs(method, payload, isMultipart);
	try {
		const response = await fetch(serverPath, fetchConfigs);
		if (!response.ok) {
			if (response.status == 404) {
				return cb(new Error('Request api not found'));
			}
		}
		return cb(null, response.json());
	} catch (err) {
		return cb(err);
	}
}
