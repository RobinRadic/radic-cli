var async = require('async');
var inquirer = require('inquirer');
var _ = require('underscore');

module.exports = CH;

function CH(prompts)
{
    this.prompts = prompts;

}


CH.prototype.createInputTask = function()
{
    var self = this;
    var inputs = [];
    _.each(arguments, function (name, i)
    {
        inputs.push(self.prompts[name]);
    });

    return function (options, callback)
    {
        inquirer.prompt(inputs, function (answers)
        {
            callback(null, _.extend(options, answers));
        });
    }
};

CH.prototype.waterfall = function(baseOptions)
{
    var self = this;
    var wf = [function (callback)
    {
        callback(null, baseOptions || {});
    }];
    wf.add = function ()
    {
        wf.push.apply(wf, arguments);
        return wf;
    };
    wf.addIT = function(){
        wf.add(self.createInputTask.apply(self, arguments));
        return wf;
    };
    // do exit cli with message when wf.start callback parameter is NOT DEFINED
    wf.doExit = function(cli, msg, exitCli){
        wf._doExit = { cli: cli, msg: msg, exitCli: exitCli || true };
        return wf;
    };
    wf.start = function (cb)
    {
        if(typeof(wf._doExit) == 'object' && typeof(cb) == 'undefined'){
            wf.add(function(options, callback){
                wf._doExit.cli.out.ok(wf._doExit.msg);
                if(wf._doExit.exitCli == true) wf._doExit.cli.exit(1);
            })
        }
        async.waterfall(wf, function ()
        {
            cb();
        });
    };
    return wf;
};

