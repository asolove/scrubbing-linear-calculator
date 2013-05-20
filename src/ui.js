var parser = require("./parser/parser");
var compiler = require("./compiler");

var EquationView = function(opts){
  function update(){
    var exprInput = opts.input.value;
    opts.input.value = opts.input.value.replace("*", String.fromCharCode(215));
    try {
      var compiled = compiler.compile(parser.parse(exprInput));
      var text = compiled.display.map(displayItem).join(" ");
      text += "&nbsp;&nbsp;&nbsp;<span class='op'>=</span> <span class='total unlocked'>140</span>"
      opts.output.innerHTML = text;
    } catch (e) {
    }
  }

  opts.input.addEventListener("keydown", function(e){
    setTimeout(update, 1);
  });

  opts.input.focus();
};

function displayItem(item){
  if(item[0] == "var") return "<span class='number editable'>" + item[1] + "</span> <span class='name'>" + item[2] + "</span>";
  if(item[0] == "num") return "<span class='number non-editable'>" + item[1] + "</span>";
  if(item[0] == "op" && item[1] == "*")
    return "<span class='op mult'>&times;</span>";
  if(item[0] == "op")
    return "<span class='op add'>" + item[1] + "</span>"
  
  return item[1];
}

function init(){
  var input = document.getElementById("expression-1-input");
  var output = document.getElementById("expression-1-output");
  new EquationView({ input: input, output: output });
}

init();