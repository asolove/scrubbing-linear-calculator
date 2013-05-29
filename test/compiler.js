var vows = require('vows');
var assert = require('assert');

var compiler = require('../src/compiler');

// Create a Test Suite
vows.describe('Compiling a linear expression').addBatch({
  'given a basic expression': {
    topic: compiler.compile({ type: "+", l: 1, r: 1 }),

    'compiles back to the expression': function (topic) {
      assert.deepEqual(topic, { 
        expression: "1+1", 
        variables: {},
        display: [
          ["num", 1],
          ["op", "+"],
          ["num", 1]
        ]
      });
    }
  },
  'given an expression with a variable': {
    topic: compiler.compile({ type: "*", l: 3, r: { type: "var", value: 40, name: "bar height" }}),

    'compiles to correct relations': function (topic) {
      assert.deepEqual(topic, {
        expression: "3*bar-height",
        variables: {
          "bar-height": { token: "bar-height", value: 40, name: "bar height" }
        },
        display: [
          ["num", 3],
          ["op", "*"],
          ["var", 40, "bar height", "bar-height"]
        ]
      });
    }
  }
}).export(module);