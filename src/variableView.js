var Backbone = require("backbone");

var VariableView = module.exports = Backbone.View.extend({
	render: function(){
		var m = this.model;
		var token = m.get("token");
		var value = m.get("value");
		var name = m.get("name");
		var html = "<span class='variable' data-variable='" + m.get("token") + "'>" +
				"<span class='number editable'>" + m.get("value") + "</span> "+ 
				"<span class='name'>" + m.get("name") + "</span></span>";
		this.$el.html(html);

		return this;
	}
});