var merge = require("merge");

function compile (parseTree) {
  if (typeof parseTree == "number")
    return number(parseTree);
  else if (parseTree.type == "+" || parseTree.type == "*")
    return expression(parseTree);
  else if (parseTree.type == "var")
    return variable(parseTree);
  else
    throw new Error("Could not compile expression" + JSON.stringify(parseTree));
};

function number (num) {
  return {
    expression: num,
    variables: {},
    display: [["num", num]]
  };
}

function expression (expr) {
  var l = compile(expr.l);
  var r = compile(expr.r);
  return {
    expression: l.expression + expr.type + r.expression,
    variables: merge(l.variables, r.variables),
    display: [].concat.apply(l.display, [[["op", expr.type]], r.display])
  };
}

function variable (varInfo) {
  var token = escapeVarName(varInfo.name);
  var variables = {};
  variables[token] = {
    name: varInfo.name,
    token: token,
    value: varInfo.value
  };

  return {
    expression: token,
    variables: variables,
    display: [["var", varInfo.value, varInfo.name, token]]
  };
}

function escapeVarName (name) {
  return name.replace(/\s/g, "-");
}

exports.compile = compile;