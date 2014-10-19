'use strict';

module.exports = function (cli, app) {

    cli.command('ps1')
        .description('Shows current version')
        .method(function (cmd) {
            if (typeof cmd.type === 'undefined') {
                cli.output(app.version);
            } else {
                var when = cmd.when === 'next' ? 1 : 0; // next or current
                when = cmd.when === 'previous' ? -1 : when; // previous or keep

                var part = cmd.type === 'minor' ? 1 : 2; // minor or patch
                part = cmd.type === 'major' ? 0 : part; // major or keep

                cli.output(parseInt(app.version.split('.')[part]) + when);
            }
        });


};
