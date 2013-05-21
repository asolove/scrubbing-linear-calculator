var parser = require("./parser/parser");
var compiler = require("./compiler");
var c = require("../lib/cassowary/bin/c");

function Equation(parentEl){
  this.input = parentEl.querySelector(".input");
  this.output = parentEl.querySelector(".output");
  this.answer = parentEl.querySelector(".answer");
  this.model = undefined;
  this.total = 0;

  this.input.addEventListener("keyup", this.update.bind(this));
}

Equation.prototype = {
  constructor: Equation,

  displayItem: function(item){
    if(item[0] == "var") return "<span class='number editable'>" + item[1] + "</span> <span class='name'>" + item[2] + "</span>";
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
      console.log(exprInput, width);
      this.answer.style.left = width + "px";
      this.answer.innerHTML = "<span class='op'>=</span> <span class='total unlocked'>"+this.total+"</span>";
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
  var e1 = new Equation(document.getElementById("equation-1"));
  e1.input.focus();
}

init();