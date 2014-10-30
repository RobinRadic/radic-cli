var objutils = require('./utils/objects');
var winston = require('winston');
var path = require('path');
var clc = require('cli-color');
var _ = require('underscore');


// LOGGING
var _logSymbols = {
    ok: ["green", "√ "],
    info: ["cyan", "i "],
    warn: ["yellow", "⚠ "],
    debug: ["blue", "＃ "],
    error: ["red", "✖ "],
    fatal: ["red", "\n ☠ FATAL ERROR ☠ \n"]
};
var logSymbols = exports.logSymbols = {};
_.each(_logSymbols, function (opts, type) {
    logSymbols[type] = clc[opts[0]](clc.bold(opts[1].toString()));
});


module.exports.Logger = Logger;
function Logger(crxx) {
    if (typeof crxx === 'undefined') {
        crxx = {};
    }
    var crx = {
        cli: false,
        debug: true,
        fileDir: __dirname,
        levels: {
            debug: 0,
            ok: 1,
            info: 2,
            warn: 3,
            error: 4,
            fatal: 5
        },
        colors: {
            debug: 'blue',
            ok: 'green',
            info: 'cyan',
            warn: 'yellow',
            error: 'red',
            fatal: 'red'

        }
    };
    this.options = _.extend({}, crx, crxx);

    if (this.options.cli === true) {
        winston.cli();
    }

    this.winstonOptions = {
        levels: this.options.levels,
        exitOnError: true,
        transports: [
            new winston.transports.File({
                filename: path.join(this.options.fileDir, 'all.json'),
                colorize: false,
                handleExceptions: true,
                level: this.options.debug ? 'debug' : 'info'
            })
        ],
        exceptionHandlers: [
            new winston.transports.Console({
                filename: path.join(this.options.fileDir, 'exceptions.json'),
                colorize: true
            }),
            new winston.transports.File({
                filename: path.join(this.options.fileDir, 'exceptions.json'),
                colorize: false
            })
        ]
    };


}

Logger.prototype.create = function () {
    return new winston.Logger(this.winstonOptions);
};

var test = function () {
    var logger = (new Logger()).create();


    logger.on('logging', function (transport, level, msg, meta) {
        console.log(logSymbols[level] + msg);
    });

    logger.log('debug', "Will not be logged in either transport!");
    logger.log('info', 'tralalala');
    logger.log('ok', 'tralalala');
    logger.log('warn', 'tralalala');
    logger.log('error', 'tralalala');
    logger.log('fatal', 'tralalala');
}; //.call();