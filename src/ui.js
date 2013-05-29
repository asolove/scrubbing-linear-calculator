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
  this.el.addEventListener("calc:unlock", this.unlock.bind(this));
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
      this.total = compiled.variables[this.totalName].value;
    }

    if(exprInput.length > 0){
      var width = measure(exprInput.replace(" ", "&nbsp;"));
      this.answer.style.left = width + "px";
      this.answer.innerHTML = "<span class='op'>=</span> <span class='variable unlocked' data-variable='"+this.totalName+"'><span class='number'>"+this.total+"</span></span>";
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
    compiled.variables[this.totalName] =
      {name: this.totalName, token: this.totalName, value: c(this.totalName)[0].value };
    return solver;
  },

  beforeChange: function(e){
    // fixme: escape variable names
    this.editVar = c(e.target.dataset.variable)[0];
    if(this.editVar.stay) this.solver.removeConstraint(this.editVar.stay);
    this.startX = e.detail.x; 
    this.startVal = this.editVar.value || 0;
    this.markAsMoving(this.editVar, true);
    this.solver.addEditVar(this.editVar, c.Strength.high).beginEdit(c);
  },

  afterChange: function(){
    this.markAsMoving(this.editVar, false);
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

  variable: function(name){
    return c(name)[0];
  },

  unlock: function(e){
    var varName = e.target.dataset.variable;
    var variable = this.variable(varName);

    //fixme" delete unlocked from previoulsy-unlocked var.
    variable.unlocked = true;
    [].slice.call(this.el.querySelectorAll(".unlocked")).forEach(function(el){
      console.log("removing unlocked from", el);
      el.classList.remove("unlocked");
    });
    [].slice.call(this.el.querySelectorAll("[data-variable="+varName+"]")).forEach(function(el){
      console.log("adding unlocked to", el);
      el.classList.add("unlocked");
    });
  },

  markAsMoving: function(variable, moving){
    var method = moving ? "add" : "remove";
    document.body.classList[method]("dragging");
    var els = [].slice.call(this.el.querySelectorAll("[data-variable="+variable.name+"]"));
    els.forEach(function(el){ el.classList[method]("dragging"); });
  },

  updateForSolver: function(){
    for(var token in this.compiled.variables){
      var val = c(token)[0].value;
      var els = [].slice.call(this.el.querySelectorAll("[data-variable="+token+"] .number"));
      els.forEach(function(el){
        el.innerText = val;
      }); 
    }
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