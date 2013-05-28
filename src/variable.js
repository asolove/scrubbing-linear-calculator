var Backbone = require("backbone");

var Variable = module.exports = Backbone.Model.extend({
	defaults: {
		locked: false,
		name: "",
		token: "",
		value: 0
	}
});

