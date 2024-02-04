const ohm = require("ohm-js");
const ohm_util = require("ohm-js/src/util");
const fs = require("fs");
const path = require("path");
const source = fs.readFileSync(path.join(__dirname, "grammar.ohm"));
const grammar = ohm.grammar(source);
grammar._checkTopDownActionDict = () => {};

const builtin_visitor = {
  _terminal() {
    return this.primitiveValue;
  },
  _iter(children) {
    if (this._node.isOptional()) {
      if (this.numChildren === 0) {
        return null;
      } else {
        return children[0].visit();
      }
    }
    return [...children.map((x) => x.visit())];
  },
  nonemptyListOf(first, _, rest) {
    return [first.visit(), ...rest.visit()];
  },
  emptyListOf() {
    return [];
  },
  NonemptyListOf(first, _, rest) {
    return [first.visit(), ...rest.visit()];
  },
  EmptyListOf() {
    return [];
  },
};

function to_visitor(visitors) {
  const visitor = Object.create(null);
  Object.assign(visitor, builtin_visitor);
  for (const [k, v] of visitors.entries()) {
    visitor[k] = function (...args) {
      const node = this;
      const range = [
        node.source.sourceString,
        node.sourceString,
        node.source.startIdx,
        node.source.endIdx,
      ];
      return $meow.wait_sync(v(range, ...args.map((x) => x.visit())));
    };
  }
  return visitor;
}

module.exports = {
  *parse(source, rule, visitors) {
    const new_source = fs.readFileSync(path.join(__dirname, "../../examples/arith.lingua"));
    const cst = grammar.match(new_source, rule);
    if (cst.failed()) {
      return [false, cst.message];
    }
    const semantics = grammar.createSemantics();
    semantics.addOperation("visit", to_visitor(visitors));
    const ast = semantics(cst).visit();
    return [true, ast];
  },
};
