var Config = exports.Config = require('./config');
var utils = exports.utils = require('./utils');
var Cli = exports.Cli = require('./cli');
var Commands = exports.Commands = require('./commands');

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
    app.cli.registerCommands(require('./commands')(app.cli, app));

    return app;
};