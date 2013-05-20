var vows = require('vows');
var assert = require('assert');

var compiler = require('../src/compiler');

// Create a Test Suite
vows.describe('Compiling a linear expression').addBatch({
  'given a basic expression': {
    topic: compiler.compile(["+", 1, 1]),

    'compiles back to the expression': function (topic) {
      assert.deepEqual(topic, { 
        expression: "1+1", 
        variables: [], 
        constraints: [],
        display: [
          ["num", 1],
          ["op", "+"],
          ["num", 1]
        ]
      });
    }
  },
  'given an expression with a variable': {
    topic: compiler.compile(["*", 3, ["var", 40, "bar height"]]),

    'compiles to correct relations': function (topic) {
      assert.deepEqual(topic, {
        expression: "3*bar-height",
        variables: [{name: "bar height", token: "bar-height"}],
        constraints: [["bar-height==40", "medium"]],
        display: [
          ["num", 3],
          ["op", "*"],
          ["var", 40, "bar height"]
        ]
      });
    }
  }
}).export(module);