'use strict';
// exports View constructor


module.exports = View;

function View(name){
    this.name = name;
    this.widgets = {};
}

View.prototype.addWidget = function(widget){
    this.widgets[ widget.name ] = widget;
}


View.prototype.getWidget = function(widget){
    if(typeof(this.widgets[ name ]) == "undefined"){
        throw err;
    }
    return this.widgets[ name ];
}


View.prototype.removeWidget = function(widget){
    this.widgets[ name].destroy();
    delete this.widgets[ name ];
}


View.prototype.destroy = function(){
    this.widgets.forEach(function(widget){
        widget.destroy();
    });
}


View.prototype.create = function(){
    this.widgets.forEach(function(widget){
        widget.create();
    });
}


View.prototype.show = function(){
}


View.prototype.hide = function(){
}

