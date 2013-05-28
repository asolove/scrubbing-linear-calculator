var Backbone = require("backbone");

module.exports = Backbone.Collection.extend({
	initialize: function(){
		if(this.length === 0) this.addEmptyEquation();
	},

	addEmptyEquation: function(){
		this.add([{ number: this.length + 1}]);
		this.listenToOnce(this.last(), "change", this.addEmptyEquation.bind(this));
	}
});