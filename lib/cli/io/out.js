'use strict';

var baseCli = require('cli');
var clc = require('cli-color');
var Table = require('cli-table');
var blessed = require('blessed');
var _ = require('underscore');
var Command = require('./command');
var inquirer = require('inquirer');
var util = require('util');
var utils = require('../../utils/index');
var celeri = require('./../celeri/index');
var Q = require('q');
var async = require('async');


var art = require('ascii-art');
art.Figlet.fontPath = __dirname + '/fonts/';


var out = module.exports;
out.table = require('./table');
out.enabled = true;
out.enableLogging = false;
out.logPath = null;

var winston = require('winston');
var _logger = null;
var logger = function (level, messaage) {
    if (out.enableLogging === false) {
        return;
    }
    _logger(level, message);
};

out.setupLogger = function (enabled, dirPath) {
    if (enabled === false) {
        return out.enableLogging = false;
    }

    _logger = new (winston.Logger)({
        transports: [
            //new (winston.transports.Console)({json: false, timestamp: true}),
            new winston.transports.File({filename: path.join(dirPath, '/debug.log'), json: false})
        ],
        exceptionHandlers: [
            //new (winston.transports.Console)({json: false, timestamp: true}),
            new winston.transports.File({filename: path.join(dirPath, '/exceptions.log'), json: false})
        ],
        exitOnError: false
    });

    return out.enableLogging = true;
};

var outputs = {
    ok: ["green", "√ "],
    info: ["cyan", "i "],
    warn: ["yellow", "! "],
    debug: ["blue", "＃"],
    error: ["red", "✖ "],
    fatal: ["red", "\n ☠ FATAL ERROR ☠ \n"]
};

/* Print status messsages */
_.each(outputs, function (opts, type) {
    out[type] = function (msg) {
        logger(type, msg);
        if (out.enabled === false) return;
        var output = outputs[type];
        output = clc[output[0]](clc.bold(output[1].toString()));
        if (type != 'debug') util.print(output + msg + "\n");
        if (type == 'fatal') process.exit();
    };
});

/* Clear console */
out.clear = function () {
    console.log(clc.reset);
};

/* Print ASCII art */
out.art = function (text, font, callback) {
    art.font(text, font || 'doom', function (rendered) {
        t
        w
        console.log(rendered.toString());
        callback();
    });
};


function test() {

    var t = out.table('default', 'default')
        .head('ID', 'Slug', 'Desc', 'icon')
    //.percWidth([10, 30, 30, 30], 200);

    _.each(require('./table').data, function (row) {
        t.push(_.without(_.values(row), 'a'));
    });


    console.log(t.toString());

    console.log('✔');
}