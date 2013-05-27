exports.attach = function(el){
	var moving;
	el.addEventListener("mousedown", function(e){
		var target = findVariableNode(e.target);
		if(!target) return;

		moving = e.target;
		beforeChange(moving);
	});

	document.body.addEventListener("mousemove", function(e){
		if(moving) change(moving);
	});

	document.body.addEventListener("mouseup", function(e){
		if(moving) afterChange(moving);
		moving = null;
	});
}; 

function findVariableNode(el){
	if(el.dataset.variable) return el;
	if(el.parentNode.dataset.variable) return el.parentNode;
	return null;
}

function beforeChange(el){ return triggerCustomEvent("calc:change:before", el) }
function change(el){ return triggerCustomEvent("calc:change", el); }
function afterChange(el){ return triggerCustomEvent("calc:change:after", el); }

function triggerCustomEvent(name, el, details){
	console.log("triggering", name);
	el.dispatchEvent(new CustomEvent(name, {
		details: details,
		bubbles: true,
		cancelable: true
	}));
}