var parser = require("./parser/parser");
var compiler = require("./compiler");
var c = require("../lib/cassowary/bin/c");
var events = require("./events");
var $ = require("jquery-browserify");

var System = require("./System");
var SystemView = require("./SystemView");
var Variable = require("./variable").Variable;
var VariableView = require("./variableView").VariableView;

function init(){
	var $system = $("#system");
	var system = new System();
	var systemView = new SystemView({ el: $system, model: system }).render();
}

init();