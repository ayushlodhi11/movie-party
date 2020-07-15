import yenv from 'yenv';
import path from 'path';

const getEnv = env => {
	console.log('environment in session varialbe', env);
	const sessionVariables = yenv(path.resolve(__dirname, 'settings.yaml'), { env });
	return sessionVariables;
};

export default getEnv;
