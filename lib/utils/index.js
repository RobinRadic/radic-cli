var child_process = require('child_process');
var util = require('util');
var _ = require('underscore');


var CommandHelper = exports.CommandHelper = require('./command-helper');
_.each(require('./objects'), function (thing, key) {
    console.log(thing, key);
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

isNumeric =
    exports.isNumeric = function (obj) {
        return !isNaN(parseFloat(obj)) && isFinite(obj);
    };


exports.ucfirst = function (str) {

    str += '';
    var f = str.charAt(0)
        .toUpperCase();
    return f + str.substr(1);
}