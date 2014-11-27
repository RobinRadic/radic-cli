var Table = require('cli-table');
var util = require('util');
var utils = require('../../utils/index');

module.exports = function (style, design, options) {
    return new RadicTable(style, design, options);
};

/* Tables */
var _tables = {
    styles: {
        default: {
            'padding-left': 1, 'padding-right': 1, head: ['cyan', 'bold'], border: ['grey'], compact: false
        }
    },
    designs: {
        default: {
            'top': '─',
            'top-mid': '┬',
            'top-left': '┌',
            'top-right': '┐',
            'bottom': '─',
            'bottom-mid': '┴',
            'bottom-left': '└',
            'bottom-right': '┘',
            'left': '│',
            'left-mid': '├',
            'mid': '─',
            'mid-mid': '┼',
            'right': '│',
            'right-mid': '┤',
            'middle': '│'
        },
        double: {
            'top': '═',
            'top-mid': '╤',
            'top-left': '╔',
            'top-right': '╗',
            'bottom': '═',
            'bottom-mid': '╧',
            'bottom-left': '╚',
            'bottom-right': '╝',
            'left': '║',
            'left-mid': '╟',
            'mid': '─',
            'mid-mid': '┼',
            'right': '║',
            'right-mid': '╢',
            'middle': '│'
        },
        borderless: {
            'top': '',
            'top-mid': '',
            'top-left': '',
            'top-right': '',
            'bottom': '',
            'bottom-mid': '',
            'bottom-left': '',
            'bottom-right': '',
            'left': '',
            'left-mid': '',
            'mid': '',
            'mid-mid': '',
            'right': '',
            'right-mid': '',
            'middle': ' '
        }
    }
};
function RadicTable(style, design, options) {
    this.options = utils.options({
        chars: _tables.designs[design || 'default'],
        truncate: '…',
        colWidths: [],
        colAligns: [],
        style: _tables.styles[style || 'default'],
        head: []
    }, options);
    //   Table.call(this, options);
}
util.inherits(RadicTable, Table);

RadicTable.prototype.row = function () {
    var args = _.toArray(arguments);
    this.push(args);
    return this;
};

RadicTable.prototype.head = function () {
    this.options.head = _.toArray(arguments);
    return this;
};
RadicTable.prototype.autoWidth = function (columns, percentage) {
    columns = columns || this.options.head.length;
    percentage = percentage || 100;
    var width = utils.getWindowWidthPercentage(percentage);
    var colWidth = width / columns;
    for (var i = 0; i < columns; i++) {
        this.options.colWidths.push(colWidth);
    }
    return this;
};

RadicTable.prototype.percWidth = function (colPercs, widthPerc) {

    widthPerc = widthPerc || process.stdout.getWindowSize()[0] - 10;

    var self = this;

    _.each(colPercs, function (perc, i) {
        var colWidth = (widthPerc / 100) * perc;
        self.options.colWidths.push(colWidth);
    });
    return this;
};

RadicTable.prototype.show = function () {
    console.log(this.toString());
};