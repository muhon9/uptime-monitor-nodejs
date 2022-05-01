const environments = {};

environments.development = {
    port: 8000,
    envName: 'development',
};

environments.production = {
    port: 5000,
    envName: 'production',
};

// get current environment from env variable
// eslint-disable-next-line operator-linebreak
const currentEnvironment =
    typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'development';

// export the environments to use in other files
// eslint-disable-next-line operator-linebreak
const environmentToExport =
    typeof environments[currentEnvironment] === 'object'
        ? environments[currentEnvironment]
        : environments.development;

module.exports = environmentToExport;
