const environments = {};

environments.development = {
    port: 8000,
    envName: 'development',
    secreteKey: '123456',
    twilio: {
        fromPhone: '+19705399413',
        accountSid: 'AC61b7189b04f40348b3314a2b1e7881a6',
        authToken: '7d1ccf3e1cda1e0774ce30f62e1dfa96',
    },
};

environments.production = {
    port: 5000,
    envName: 'production',
    secreteKey: 'asdfadfga',
    twilio: {
        fromPhone: '+19705399413',
        accountSid: 'AC61b7189b04f40348b3314a2b1e7881a6',
        authToken: '7d1ccf3e1cda1e0774ce30f62e1dfa96',
    },
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
