var vows = require('vows');
var assert = require('assert');

var parser = require('../src/parser/parser');

// Create a Test Suite
vows.describe('Linear expression parser').addBatch({
    'given a basic expression': {
        topic: "2+2",

        'gets a successful parse': function (topic) {
            assert.deepEqual (parser.parse(topic), ["+", 2, 2]);
        }
    }
}).export(module);