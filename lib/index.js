var Config = exports.Config = require('./config');
var utils = exports.utils = require('./utils');
var Cli = exports.Cli = require('./cli');
var Logger = exports.Logger = require('./logger').Logger;
var logSymbols = exports.logSymbols = require('./logger').logSymbols;
var Commands = exports.Commands = require('./commands');
var getCommand = exports.getCommand = function (name) {
    return require('./commands/' + name);
};
exports.createApplication = function () {
    var path = require('path');
    var fs = require('fs-extra');
    var pkg = fs.readJSONFileSync(__dirname + '/../package.json');

    var app = {
        path: __dirname,
        fileName: __filename,
        name: pkg.name,
        author: pkg.author,
        version: pkg.version,
        description: pkg.description
    };

    app.config = Config(path.join(__dirname, 'stubs/config.json'), '~/.radic-cli.json');
    app.cli = Cli(app.name);
    app.cli.registerCommands(require('./commands'), app);

    app.getCommand = function (name) {
        return require('./commands/' + name);
    };

    return app;
};