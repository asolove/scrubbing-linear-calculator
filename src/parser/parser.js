var fs = require("fs");
var peg = require("pegjs");

var grammar = fs.readFileSync(__dirname + "/grammar.pegjs", "utf-8");
var parser = peg.buildParser(grammar);
module.exports = parser;