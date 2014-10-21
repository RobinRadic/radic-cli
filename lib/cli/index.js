'use strict';

var baseCli = require('cli');
var clc = require('cli-color');
var Table = require('cli-table');
var blessed = require('blessed');
var _ = require('underscore');
var inquirer = require('inquirer');
var Q = require('q');
var async = require('async');

var art = require('ascii-art');
art.Figlet.fontPath = __dirname + '/fonts/';


var Command = require('./io/command');
var celeri = require('./celeri');
var utils = require('./../utils/index');

module.exports = function (name) {
    var cli = {
        ui: require('./ui'),
        autoexit: true,
        _registeredCommands: [],
        _wizards: {},
        out: require('./io/out'),
        in: {
            prompt: inquirer.prompt
        },
        color: clc.xterm,
        bg: clc.bgXterm,
        cwd: process.cwd()
    };

    ['bold', 'italic', 'underline', 'blink', 'inverse', 'strike', 'black', 'bgBlack', 'red', 'bgRed', 'green', 'bgGreen', 'yellow', 'bgYellow', 'blue', 'bgBlue', 'magenta', 'bgMagenta', 'cyan', 'bgCyan', 'white', 'bgWhite', 'blackBright', 'bgBlackBright', 'redBright', 'bgRedBright', 'greenBright', 'bgGreenBright', 'yellowBright', 'bgYellowBright', 'blueBright', 'bgBlueBright', 'magentaBright', 'bgMagentaBright', 'cyanBright', 'bgCyanBright', 'whiteBright', 'bgWhiteBright'].forEach(function (fn) {
        cli[fn] = clc[fn];
    });

    cli.native = {};
    var define_native = function (module) {
        Object.defineProperty(cli.native, module, {
            enumerable: true,
            configurable: true,
            get: function () {
                delete cli.native[module];
                return (cli.native[module] = require(module));
            }
        });
    };
    var natives = process.binding('natives');
    for (var mod in natives) {
        define_native(mod);
    }
    cli.output = cli.native.util.print;
    cli.exit = process.exit;
    cli.exec = function (cmd, callback, errback) {
        cli.native.child_process.exec(cmd, function (err, stdout, stderr) {
            err = err || stderr;
            if (err) {
                if (errback) {
                    return errback(err, stdout);
                }
                return cli.out.fatal('exec() failed\n' + err);
            }
            if (callback) {
                callback(stdout);
            }
        });
    };


// COMMANDS INPUT
    cli.registerCommands = function (commands, parent) {
        commands(cli, parent);
    };
    cli.command = function (commands) {
        return new Command(commands, cli);
    };
    cli.createJsonConfigCommand = function (commandName, configObject, commandDescription) {
        commandName = commandName || 'config';
        cli.command(commandName + ' :action :path OR ' + commandName + ' :action :path :value')
            .usage({
                'config get :path ': ' Get a configuration node. Shows single nodes and objects',
                'config set :path :value ': ' Set a configuration node. Use single quotes for json objects',
                'config set :path \'{ "url": "some random shit" }\' --json ': ' Sets json object as new value for key git'
            })
            .optional({
                '--json': 'Parses the set value to json'
            })
            .description(commandDescription || 'View and alter the configuration')
            .method(function (cmd) {
                var cliToJsonConfig = function (val) {
                    val = isNumeric(val) ? parseInt(val) : val;
                    val = String(val).toLowerCase() == 'true' || String(val).toLowerCase() == 'false' ? String(val).toLowerCase() == 'true' : val;
                    return val;
                };


                //utils.inspect(cmd);
                cli.autoexit = false;
                if (cmd.action == 'set') {
                    cli.out.info('Altering config value of: ' + cmd.path);
                    var val = cmd.value;
                    if (typeof(cmd.json) == 'boolean' && cmd.json == true) {
                        val = JSON.parse(cmd.value)
                    } else {
                        val = cliToJsonConfig(cmd.value);
                    }

                    var success = configObject.set(cmd.path, val);
                    if (success) {
                        cli.out.ok('Configuration has been altered');
                    } else {
                        cli.out.warn('The was an error altering the configuration');
                    }
                }
                else if (cmd.action == 'get') {
                    cli.out.info('Config value for ' + cmd.path + ':');
                    var val = configObject.get(cmd.path);
                    if (typeof(val) == 'object') {
                        utils.inspect(val);
                    } else {
                        cli.output(val + "\n");
                    }
                }
            });
    };
    cli.parse = function (argv) {

        cli._registeredCommands.forEach(function (command) {
            var option = {
                command: command.command,
                description: command.description,
                optional: command.optional
            };

            if (typeof(command.usage) == 'object') {
                var table = cli.out.table('default', 'default')
                    .head('Command', 'Description');
                //.percWidth([33, 66], 100);

                //t.push([cli.bold(cli.cyan('Command')), cli.bold('Description')]);

                _.each(command.usage, function (val, key) {
                    table.push([key, val]);
                });

                option.usage = "\n" + 'parameters: ' + "[required] {optional}\n" + table.toString();
            }
            else if (typeof(command.usage) == 'string') {
                option.usage = command.usage;
            }

            if (typeof(command.optional) == 'object') {
                var optionalTable = cli.out.table('default', 'borderless');
                _.each(command.optional, function (val, key) {
                    optionalTable.push([key, val]);
                });
                option.usage += "\n\n" + cli.bold('Optional flags') + ":\n" + optionalTable.toString();
            }
            celeri.option(option, command.method);


        });

        //console.log(utils.logSymbols.warn + 'asdf');
        celeri.usage(name + ' [command] --optional=value');

        //_.contains(_.toArray(arg))
        celeri.parse(argv);

        if (cli.autoexit === true) {
            process.exit(1);
        }
    };

// Wizzards

    cli.registerWizard = function (name, closure) {
        cli._wizards[name] = closure;
    };

    cli.registerWizards = function (closure) {
        var wizards = closure();
        _.each(wizards, function (wizardClosure, name) {
            cli._wizards[name] = wizardClosure;
        });
    };


    cli.startWizard = function (name, callback) {
        cli._wizards[name](callback);
    };


    return cli;
};

