var fs = require('fs');

module.exports = function (cli, app) {
    cli.createJsonConfigCommand('config', app.config, 'View and change the configuration file');
    fs.readdirSync(__dirname).forEach(function (file) {
        // exclude this file
        if (file === 'index.js') {
            return;
        }

        require('./' + file)(cli, app);
    });
};