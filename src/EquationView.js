var Backbone = require("backbone");

module.exports = Backbone.View.extend({
	className: "equation",

	events: {
		"keypress .input": "keypress"
	},

	render: function(){
		this.$el.html("<span class='line-number'>"+this.model.get("number")+"</span><input type='text' class='input'><div class='output'></div><div class='answer'></div>");
		return this;
	}, 

	keypress: function(e){
		this.model.set("something", true)
	}
});