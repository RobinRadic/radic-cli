var child_process = require('child_process');
var util = require('util');
var _ = require('underscore');
var clc = require('cli-color');

var CommandHelper = exports.CommandHelper = require('./command-helper');


_.each(require('./objects'), function (thing, key) {
    //console.log(thing, key);
    exports[thing] = key;
});

exports.exec = function (cmd, callback) {
    child_process.exec(cmd, callback);
};


/**
 * Copies and merges options with defaults.
 *
 * @param {Object} defaults
 * @param {Object} opts Supplied options
 * @return {Object} new (merged) object
 */
function options(defaults, opts) {
    for (var p in opts) {
        if (opts[p] && opts[p].constructor && opts[p].constructor === Object) {
            defaults[p] = defaults[p] || {};
            options(defaults[p], opts[p]);
        } else {
            defaults[p] = opts[p];
        }
    }
    return defaults;
}
exports.options = options;


exports.getWindowWidthPercentage = function (percentage) {
    var width = process.stdout.getWindowSize()[0] - 10;
    return Math.floor((width / 100) * percentage);
};

exports.inspect = function (obj, conf) {
    if (typeof conf === 'undefined') {
        conf = {};
    }
    console.log(util.inspect(obj, options({showHidden: true, depth: null, colors: true}, conf)));
};
exports.getObjectClass = function (obj) {
    if (typeof obj != "object" || obj === null) return false;
    else return /(\w+)\(/.exec(obj.constructor.toString())[1];
}
exports.getMethods = function (obj, delimiter) {
    if (typeof delimiter === 'undefined') {
        delimiter = "\n";
    }
    var methods = [];
    for (var m in obj) {
        if (typeof obj[m] == "function") {
            methods.push(m);
        }
    }
    return methods.join(delimiter);
}
isNumeric =
    exports.isNumeric = function (obj) {
        return !isNaN(parseFloat(obj)) && isFinite(obj);
    };

exports.JSONstringify = function (json) {
    function censor(censor) {
        var i = 0;

        return function (key, value) {
            if (i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value)
                return '[Circular]';

            if (i >= 29) // seems to be a harded maximum of 30 serialized objects?
                return '[Unknown]';

            ++i; // so we know we aren't using the original object anymore

            return value;
        }
    }

    return JSON.stringify(json, censor(json));
}

exports.ucfirst = function (str) {

    str += '';
    var f = str.charAt(0)
        .toUpperCase();
    return f + str.substr(1);
}