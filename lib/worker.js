const http = require('http');
const https = require('https');
const url = require('url');
const { sendTwilioSms } = require('../helpers/notification');
const { parseJSON } = require('../helpers/utilities');
const dataLib = require('./dataLib');

const worker = {};

worker.gatherAllChecks = () => {
    dataLib.list('checks', (err, checks) => {
        if (!err && checks && checks.length > 0) {
            checks.forEach((check) => {
                dataLib.read('checks', check, (err1, checkData) => {
                    if (!err1 && checkData) {
                        const chechDataObject = parseJSON(checkData);
                        worker.valiDateCheckData(chechDataObject);
                    } else {
                        console.log('An error occured', err1);
                    }
                });
            });
        } else {
            console.log('No checks found');
        }
    });
};

// validate checkdata
worker.valiDateCheckData = (chechDataObject) => {
    if (chechDataObject && chechDataObject.id) {
        // eslint-disable-next-line no-param-reassign
        chechDataObject.state =
            typeof chechDataObject.state === 'string' &&
            ['up', 'down'].indexOf(chechDataObject.state) > -1
                ? chechDataObject.state
                : 'down';
        // eslint-disable-next-line no-param-reassign
        chechDataObject.lastChecked =
            typeof chechDataObject.lastChecked === 'number' && chechDataObject.lastChecked > 0
                ? chechDataObject.lastChecked
                : false;

        worker.performCheck(chechDataObject);
    } else {
        console.log('Checkdata is not valid');
    }
};

// here we will check if the given link is up or down
worker.performCheck = (chechDataObject) => {
    // prepare the initial checkOutcome
    let checkOutCome = {
        error: false,
        responseCode: false,
    };
    // keep a track of outcomeSent or not
    let outcomeSent = false;

    // parse the hostname and full url from the given url
    const parsedUrl = url.parse(`${chechDataObject.protocol}://${chechDataObject.url}`, true);

    const requestDetails = {
        protocol: `${chechDataObject.protocol}:`,
        hostname: parsedUrl.hostname,
        path: parsedUrl.path,
        method: chechDataObject.method,
        timeout: 10000,
    };

    const protocolToUse = chechDataObject.protocol === 'http' ? http : https;
    const req = protocolToUse.request(requestDetails, (res) => {
        const status = res.statusCode;
        // eslint-disable-next-line no-param-reassign
        checkOutCome.responseCode = status;

        if (!outcomeSent) {
            worker.processCheckOutcome(chechDataObject, checkOutCome);
            outcomeSent = true;
        }
    });

    req.on('error', (e) => {
        checkOutCome = {
            error: true,
            value: e,
        };

        if (!outcomeSent) {
            worker.processCheckOutcome(chechDataObject, checkOutCome);
            outcomeSent = true;
        }
    });

    req.on('timeout', () => {
        checkOutCome = {
            error: true,
            value: 'Timeout',
        };
        if (!outcomeSent) {
            worker.processCheckOutcome(chechDataObject, checkOutCome);
            outcomeSent = true;
        }
    });

    req.end();
};

// process the chech out come data and take action
worker.processCheckOutcome = (chechDataObject, checkOutCome) => {
    const status =
        !checkOutCome.error &&
        checkOutCome.responseCode &&
        chechDataObject.successCode.indexOf(checkOutCome.responseCode) > -1
            ? 'up'
            : 'down';

    const alertNeeded = !!(chechDataObject.lastChecked && chechDataObject.state !== status);

    // update the check data
    const newCheckData = chechDataObject;

    newCheckData.state = status;
    newCheckData.lastChecked = Date.now();
    dataLib.update('checks', newCheckData.id, newCheckData, (err, updatedData) => {
        if (!err) {
            if (alertNeeded) {
                // send the checkdata to next process

                worker.alertToProcess(newCheckData);
            } else {
                console.log('Alert is not needed as there is no state change!');
            }
        } else {
            console.log('Error trying to save check data of one of the checks!');
        }
    });
};

// alert the user via SMS and show logs in terminal

worker.alertToProcess = (newCheckData) => {
    const date = new Date().toLocaleDateString();
    const msg = `${newCheckData.url} is ${newCheckData.state} at ${date}`;
    console.log(msg);
    sendTwilioSms(newCheckData.userPhone, msg, (err) => {
        if (!err) {
            console.log(msg);
        } else {
            console.log(err);
        }
    });
};

worker.loopTheProcess = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 5000);
};
worker.init = () => {
    worker.gatherAllChecks();

    // it will run the whole process after an interval
    worker.loopTheProcess();
};

module.exports = worker;
