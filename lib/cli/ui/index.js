'use strict';
// Exports Ui instance

/*
 ui only interacts with views that has been added to ui.
 ui initializes, creates, shows, hides and destroys them.

 ui does NOT interact with widgets in views
 */


var radic = require('../../../index.js'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter;


// Private
var views = {};


module.exports = new Ui();

// Public
function Ui(){
    EventEmitter.call(this);
};

util.inherits(Ui, EventEmitter);


Ui.prototype.getView = function(name){
    if(typeof(views[name]) === "undefined"){
        throw err;
    }
    return views[ name ];
};


// Views can be: added, created, showed, hidden, destroyed, removed
Ui.prototype.addView = function(name, view){
    views[ name ] = view;
    this.emit('view.added', { name: name, view: view });
};

Ui.prototype.removeView = function(name){
    this.emit('view.created', name);
};

Ui.prototype.showView = function(name){
    this.emit('view.shown', name);
};

Ui.prototype.hideView = function(name){
    this.emit('view.hidden', name);
};

Ui.prototype.destroyView = function(name){
    this.emit('view.destroyed', name);
};

Ui.prototype.removeView = function(name){
    this.emit('view.removed', name);
};


