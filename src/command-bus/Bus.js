const commandLineArgs = require('command-line-args')
const winston = require('winston');
const path = require('path');
const moment = require('moment');

const optionDefinitions = [
    { name: 'src', type: String, multiple: true, defaultOption: true },
    { name: 'timeout', alias: 't', type: Number }
];

winston.configure({
    transports: [
        new(winston.transports.File)({
            filename: path.resolve(__dirname, '..', '..', 'logs/cron-logs.log'),
            handleExceptions: true,
            json: false,
            timestamp: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: true,
            prettyPrint: true,
            meta: true,
            humanReadableUnhandledException: true
        })
    ]
});

const options = commandLineArgs(optionDefinitions);
options.timeout = options.timeout || 3000;
winston.info(`These crons were run ${options.src} at ${moment().format('MMM Do YYYY, h:mm:ss a')}`);

let Command;
let promises = [];

options.src.forEach(src => {
    Command = require(`./${src}`);
    let instance = new Command();
    promises.push(instance.execute());
    resolvePromises(promises);
});

function resolvePromises(promises) {
    Promise.all(promises).then(values => {
        values.forEach(value => {
            if (Array.isArray(value)) {
                resolvePromises(value);
            } else {
                // currently it's logging the success messages to the console. Maybe we can do something better with them.
                console.log(value);
            }
        })
        setTimeout(() => {
            console.log(`Max time reached (${options.timeout}) ms, exiting the process`);
            process.exit(0);
        }, options.timeout); // Exit the node process after the timeout specified or 3 second.
    }).catch(error => {
        winston.error(error);
        setTimeout(() => { process.exit(1) }, options.timeout);
    });
}
