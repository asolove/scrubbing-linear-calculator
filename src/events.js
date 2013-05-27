exports.attach = function(el){
	var moving;
	el.addEventListener("mousedown", function(e){
		var target = findVariableNode(e.target);
		if(!target) return;

		moving = target;
		beforeChange(moving, e.clientX);
	});

	document.body.addEventListener("mousemove", function(e){
		if(moving) change(moving, e.clientX);
	});

	document.body.addEventListener("mouseup", function(e){
		if(moving) afterChange(moving, e.clientX);
		moving = null;
	});
}; 

function findVariableNode(el){
	if(el.dataset.variable) return el;
	if(el.parentNode.dataset.variable) return el.parentNode;
	return null;
}

function beforeChange(el, x){ return triggerCustomEvent("calc:change:before", el, { x: x }) }
function change(el, x){ return triggerCustomEvent("calc:change", el, { x: x }); }
function afterChange(el, x){ return triggerCustomEvent("calc:change:after", el, { x: x }); }

function triggerCustomEvent(name, el, detail){
	el.dispatchEvent(new CustomEvent(name, {
		detail: detail,
		bubbles: true,
		cancelable: true
	}));
}