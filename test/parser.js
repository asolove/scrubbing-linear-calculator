var vows = require('vows');
var assert = require('assert');

var parser = require('../src/parser/parser');

// Create a Test Suite
vows.describe('Linear expression parser').addBatch({
  'given a basic expression': {
    topic: "2+2",

    'gets a successful parse': function (topic) {
      assert.deepEqual(parser.parse(topic), { type: "+", l: 2, r: 2 });
    }
  }, 

  'given an expression with a named variable': {
    topic: "3 fig newtons",

    'gets a successful parse': function (topic) {
      assert.deepEqual(parser.parse(topic), { type: "var", value: 3, name: "fig newtons" });
    }
  },

  'given an expression with a named variable multiplied by a constant': {
    topic: "2 × 3 fig newtons",

    'gets a successful parse': function (topic) {
      assert.deepEqual(parser.parse(topic), { 
        type: "*", 
        l: 2, 
        r: { type: "var", value: 3, name: "fig newtons" }
      });
    }
  },
  'given a linear expression with variables': {
    topic: "3 * 40 bar height + 2 * 10 padding",

    'gets a successful parse': function (topic) {
      assert.deepEqual(parser.parse(topic), 
        { type: "+",
          l: { type: "*", l: 3, r: { type: "var", value: 40, name: "bar height" } },
          r: { type: "*", l: 2, r: { type: "var", value: 10, name: "padding" } }
      });
    }
  },

  'given a non-linear expression': {
    topic: "10 people * 30 cookies per person",

    'fails': function (topic) {
      assert.throws(function () {
        parser.parse(topic);
      });
    }
  }
}).export(module);