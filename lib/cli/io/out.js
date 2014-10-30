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
var path = require('path');

var art = require('ascii-art');
art.Figlet.fontPath = __dirname + '/fonts/';


var out = module.exports;
out.table = require('./table');
out.enabled = true;
out.debugging = false;

var outputs = {
    ok: ["green", "√ "],
    info: ["cyan", "i "],
    warn: ["yellow", "! "],
    debug: ["blue", "＃ "],
    error: ["red", "✖ "],
    fatal: ["red", "\n ☠ FATAL ERROR ☠ \n"]
};

/* Print status messsages */
_.each(outputs, function (opts, type) {
    out[type] = function (msg) {

        if (out.enabled === false) return;
        var output = outputs[type];
        output = clc[output[0]](clc.bold(output[1].toString()));
        if (type === 'debug') {
            if (out.debugging === true) {
                util.print(output + msg + "\n");
            }
        } else {
            util.print(output + msg + "\n");
        }
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
        console.log(rendered.toString());
        callback();
    });
};


