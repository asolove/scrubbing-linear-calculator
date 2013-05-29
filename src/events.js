exports.attach = function(el){
	var moving;
	var startedMoving;
	el.addEventListener("mousedown", function(e){
		var target = findChangeableVariableNode(e.target);
		if(!target) return;

		moving = target;
		startedMoving = false;
	});

	document.body.addEventListener("mousemove", function(e){
		if(!moving) return;
		if(!startedMoving){
			beforeChange(moving, e.clientX);
			startedMoving = true;
		}
		change(moving, e.clientX);
	});

	document.body.addEventListener("mouseup", function(e){
		if(moving) afterChange(moving, e.clientX);
		moving = null;
	});

	document.body.addEventListener("dblclick", function(e){
		var node = findChangeableVariableNode(e.target);
		if(!node) return;
		unlock(node);
	});
}; 

function findChangeableVariableNode(el){
	var variableNode = findVariableNode(el);
	if(variableNode && variableNode.classList.contains("unlocked")) return null;
	return variableNode;
}

function findVariableNode(el){
	if(el.dataset.variable) return el;
	if(el.parentNode.dataset.variable) return el.parentNode;
	return null;
}

function beforeChange(el, x){ return triggerCustomEvent("calc:change:before", el, { x: x }) }
function change(el, x){ return triggerCustomEvent("calc:change", el, { x: x }); }
function afterChange(el, x){ return triggerCustomEvent("calc:change:after", el, { x: x }); }
function unlock(el){ return triggerCustomEvent("calc:unlock", el); }

function triggerCustomEvent(name, el, detail){
	el.dispatchEvent(new CustomEvent(name, {
		detail: detail,
		bubbles: true,
		cancelable: true
	}));
}