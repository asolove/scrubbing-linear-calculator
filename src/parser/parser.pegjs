start
  = additive

additive
  = left:multiplicative space "+" space right:additive { return { type: "+", l: left, r: right }; }
  / multiplicative

multiplicative
  = left:integer space "*" space right:term { return { type: "*", l: left, r: right }; }
  / left:integer space "×" space right:term { return { type: "*", l: left, r: right }; }
  / term
  / integer

term
  = value:integer space name:varName { return { type: "var", value: value, name: name }; }

integer "integer"
  = digits:[0-9]+ { return parseInt(digits.join(""), 10); }

space 
  = [ \t\n\r]*

varName 
  = chars:[a-zA-Z ]+ { return chars.join("").trim(); }