var nconf = require('nconf');
var fs = require('fs-extra');
var path = require('path');

module.exports = Config;

function copyDefaultIfNotExists(stubPath, destPath) {
    if (!fs.existsSync(destPath)) {
        //console.log(destPath + ' did not exist. Creating now');
        fs.copySync(stubPath, destPath);
        return true
    }
    return false
}

function Config(stubPath, filePath) {
    if (typeof filePath === 'undefined') {
        filePath = '~/.radic-cli.json';
    }

    this.hasCopiedDefault = copyDefaultIfNotExists(stubPath, filePath);

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