start
  = additive

additive
  = left:multiplicative space "+" space right:additive { return ["+", left, right]; }
  / multiplicative

multiplicative
  = left:integer space "*" space right:term { return ["*", left, right]; }
  / term
  / integer

term
  = value:integer space name:varName { return ["var", value, name]; }

integer "integer"
  = digits:[0-9]+ { return parseInt(digits.join(""), 10); }

space 
  = [ \t\n\r]*

varName 
  = chars:[a-zA-Z ]+ { return chars.join("").trim(); }