var parser = require("./parser/parser");
var compiler = require("./compiler");
var c = require("../lib/cassowary/bin/c");
var events = require("./events");

function Equation(parentEl){
  this.el = parentEl;
  this.input = parentEl.querySelector(".input");
  this.output = parentEl.querySelector(".output");
  this.answer = parentEl.querySelector(".answer");
  this.model = undefined;
  this.total = 0;

  this.input.addEventListener("keyup", this.update.bind(this));
  this.el.addEventListener("calc:change:before", this.setCursor);
  this.el.addEventListener("calc:change:after", this.setCursor);
}

Equation.prototype = {
  constructor: Equation,

  displayItem: function(item){
    if(item[0] == "var") return "<span class='variable' data-variable='"+item[2]+"'><span class='number editable'>" + item[1] + "</span> <span class='name'>" + item[2] + "</span></span>";
    if(item[0] == "num") return "<span class='number non-editable'>" + item[1] + "</span>";
    if(item[0] == "op" && item[1] == "*")
      return "<span class='op mult'>&times;</span>";
    if(item[0] == "op")
      return "<span class='op add'>" + item[1] + "</span>"
    
    return item[1];
  },

  update: function(){
    var exprInput = this.input.value;
    this.input.value = exprInput.replace("*", String.fromCharCode(215));

    try {
      var compiled = compiler.compile(parser.parse(exprInput));
      var text = compiled.display.map(this.displayItem.bind(this)).join(" ");
      this.output.innerHTML = text;
    } catch(e) {}

    if(compiled) {
      this.solver = this.buildSolver(compiled);
      this.total = c("eOne")[0].value;
    }

    if(exprInput.length > 0){
      var width = measure(exprInput.replace(" ", "&nbsp;"));
      this.answer.style.left = width + "px";
      this.answer.innerHTML = "<span class='op'>=</span> <span class='total number unlocked'>"+this.total+"</span>";
    }
  },

  buildSolver: function(compiled){
    var solver = new c.SimplexSolver();
    solver.addConstraint(c(compiled.expression+"==eOne")[0]);
    for(var name in compiled.variables){
      var varInfo = compiled.variables[name];
      solver.addConstraint(c(varInfo.token+"=="+varInfo.value)[0]);
    }
    return solver;
  },

  setCursor: function(e){
    document.body.classList.toggle("dragging");
  }
}

var ruler;
function measure (text) {
  if(!ruler) ruler = document.getElementById("width-ruler");
  ruler.innerHTML = text;
  var width = ruler.offsetWidth;
  return width;
}

function init(){
  var eq = new Equation(document.getElementById("equation-1"));
  eq.input.focus();
  events.attach(eq.el);
}

init();