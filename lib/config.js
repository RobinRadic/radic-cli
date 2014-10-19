var nconf = require('nconf');
var fs = require('fs-extra');
var path = require('path');

module.exports = Config;

function copyDefaultIfNotExists(destPath) {
    if (!fs.existsSync(destPath)) {
        console.log(destPath + ' did not exist. Creating now');
        fs.copy(path.join(__dirname, '../tpl-config.js', destPath));
    }
}

function Config(stubPath, filePath) {
    if (typeof filePath === 'undefined') {
        filePath = '~/.radic-cli.json';
    }

    copyDefaultIfNotExists(filePath);

    this.filePath = filePath;
    nconf.file(this.filePath);

}

Config.prototype.set = function (path, key) {
    if (nconf.set(path, key) === true) {
        nconf.save();
        return true;
    }
    return false;
};

Config.prototype.get = function (path) {
    return nconf.get(path);
};