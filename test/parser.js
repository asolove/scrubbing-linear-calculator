var vows = require('vows');
var assert = require('assert');

var parser = require('../src/parser/parser');

// Create a Test Suite
vows.describe('Linear expression parser').addBatch({
    'given an empty string': {
        topic: "",

        'gets an empty parse': function (topic) {
            assert.deepEqual (parser.parse(topic), []);
        }
    }
}).export(module);