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
  this.totalName = "eOne";

  this.input.addEventListener("keyup", this.update.bind(this));
  this.el.addEventListener("calc:change:before", this.beforeChange.bind(this));
  this.el.addEventListener("calc:change", this.change.bind(this));
  this.el.addEventListener("calc:change:after", this.afterChange.bind(this));
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
      var compiled = this.compiled = compiler.compile(parser.parse(exprInput));
      var text = compiled.display.map(this.displayItem.bind(this)).join(" ");
      this.output.innerHTML = text;
    } catch(e) {}

    if(compiled) {
      this.solver = this.buildSolver(compiled);
      this.total = c(this.totalName)[0].value;
    }

    if(exprInput.length > 0){
      var width = measure(exprInput.replace(" ", "&nbsp;"));
      this.answer.style.left = width + "px";
      this.answer.innerHTML = "<span class='op'>=</span> <span class='total number unlocked'>"+this.total+"</span>";
    }
  },

  buildSolver: function(compiled){
    var solver = new c.SimplexSolver();
    solver.addConstraint(c(compiled.expression+"=="+this.totalName)[0]);
    for(var name in compiled.variables){
      var varInfo = compiled.variables[name];
      solver.addConstraint(c(varInfo.token+"=="+varInfo.value)[0]);
    }
    solver.resolve();
    return solver;
  },

  beforeChange: function(e){
    // fixme: escape variable names
    this.editVar = c(e.target.dataset.variable)[0];
    if(this.editVar.stay) this.solver.removeConstraint(this.editVar.stay);
    this.startX = e.detail.x; 
    this.startVal = this.editVar.value || 0;
    this.setCursor();
    this.solver.addEditVar(this.editVar, c.Strength.high).beginEdit(c);
  },

  afterChange: function(){
    this.setCursor();
    this.editVar.stay = new c.StayConstraint(this.editVar, this.editVar.val)
    this.solver.addConstraint(this.editVar.stay);
    this.solver.resolve();
    this.solver.endEdit();
    this.updateForSolver();
    this.editVar = null;
  },

  change: function(e){
    this.solver.suggestValue(this.editVar, this.startVal+e.detail.x-this.startX).resolve();
    this.updateForSolver();
  },

  setCursor: function(e){
    document.body.classList.toggle("dragging");
  },

  updateForSolver: function(){
    for(var token in this.compiled.variables){
      var val = c(token)[0].value;
      var els = [].slice.call(this.el.querySelectorAll("[data-variable="+token+"] .number"));
      els.forEach(function(el){
        el.innerText = val;
      }); 
    }

    document.querySelector(".total.number").innerText = c(this.totalName)[0].value;
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