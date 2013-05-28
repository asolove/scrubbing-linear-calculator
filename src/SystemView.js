var Backbone = require("backbone");

var EquationView = require("./EquationView");

module.exports = Backbone.View.extend({
	className: "system",

	initialize: function(){
		this.listenTo(this.model, "add", this.createView);
	},

	createView: function(model){
		this.addView(new EquationView({ model: model }));
	},

	addView: function(view){
		view.render().$el.appendTo(this.$el);
	},

	render: function(){
		this.model.models.forEach(this.createView.bind(this));
		return this;
	}
});