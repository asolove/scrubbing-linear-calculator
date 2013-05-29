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
    if(item[0] == "var") return "<span class='variable' data-variable='"+item[3]+"'><span class='number editable'>" + item[1] + "</span> <span class='name'>" + item[2] + "</span></span>";
    if(item[0] == "num") return "<span class='number non-editable'>" + item[1] + "</span>";
    if(item[0] == "op" && item[1] == "*")
      return "<span class='op mult'>&times;</span>";
    if(item[0] == "op")
      return "<span class='op add'>" + item[1] + "</span>"
    
    return item[1];
  },

  // has something changed about the value of this.compiled in the new compiled?
  valueChanged: function(compiled){
    if(!this.compiled) return true;
    if(compiled.display.length != this.compiled.display.length) return true;

    var lastExpr = compiled.display[compiled.display.length-1];
    var lastOldExpr = this.compiled.display[this.compiled.display.length-1];
    if((lastExpr[0] == "num" || lastExpr[0] == "var") && lastExpr[1] != lastOldExpr[1]) return true;
    return false;
  },

  update: function(){
    var exprInput = this.input.value;
    this.input.value = exprInput.replace("*", String.fromCharCode(215));

    try {
      var compiled = compiler.compile(parser.parse(exprInput));

      if(compiled) {
        if(this.valueChanged(compiled)){
          this.compiled = compiled;
          this.solver = this.buildSolver(compiled);
          this.total = compiled.variables[this.totalName].value;
        }

        var text = compiled.display.map(this.displayItem.bind(this)).join(" ");
        if(exprInput.length > 0){
          this.output.innerHTML  = text + " <span class='op'>=</span> <span class='variable unlocked' data-variable='"+this.totalName+"'><span class='number'>"+this.total+"</span></span>";
        }
      }
    } catch(e) {}
  },

  buildSolver: function(compiled){
    var solver = new c.SimplexSolver();
    var constraint = c(compiled.expression+"=="+this.totalName)[0];
    constraint.strength = c.Strength.required;
    solver.addConstraint(constraint);
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
    this.editVar = this.variable(e.target.dataset.variable);
    this.removeStay(this.editVar);
    this.startX = e.detail.x; 
    this.startVal = this.editVar.value || 0;
    this.markAsMoving(this.editVar, true);
    this.solver.addEditVar(this.editVar, c.Strength.high).beginEdit(c);
  },

  afterChange: function(){
    if(!this.editVar) return;
    this.markAsMoving(this.editVar, false);
    this.addStay(this.editVar);
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

  addStay: function(variable){
    if(variable.stay) return;
    variable.stay = new c.StayConstraint(variable, c.Strength.required, 0);
    this.solver.addConstraint(variable.stay);
  },

  removeStay: function(variable){
    if(!variable.stay) return;
    this.solver.removeConstraint(variable.stay);
    variable.stay = null;
  },

  unlock: function(e){
    var varToken = e.target.dataset.variable;
    var variable = this.variable(varToken);
    this.removeStay(variable);

    //fixme" delete unlocked from previoulsy-unlocked var.
    variable.unlocked = true;
    var self = this;
    [].slice.call(this.el.querySelectorAll(".unlocked")).forEach(function(el){
      el.classList.remove("unlocked");
      var variable = self.variable(el.dataset.variable);
      self.addStay(variable);
      variable.unlocked = false;
    });
    [].slice.call(this.el.querySelectorAll("[data-variable="+varToken+"]")).forEach(function(el){
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
      var val = this.variable(token).value;
      var els = [].slice.call(this.el.querySelectorAll("[data-variable="+token+"] .number"));
      els.forEach(function(el){
        el.innerText = val;
      }); 
    }
  }
};

function init(){
  var eq = new Equation(document.getElementById("equation-1"));
  eq.input.focus();
  events.attach(eq.el);
}

init();