class State {
  constructor(input, offset, rule = "(root)") {
    this.input = input;
    this.offset = offset;
    this.rule = rule;
  }

  clone() {
    return new State(this.input, this.offset, this.rule);
  }

  apply(state) {
    this.offset = state.offset;
    this.rule = state.rule;
  }

  match(re) {
    re.lastIndex = this.offset;
    const match = re.exec(this.input);
    if (re.lastIndex != null && re.lastIndex >= this.offset) {
      this.offset = re.lastIndex;
      return match;
    } else {
      return null;
    }
  }

  expect(text) {
    if (this.input.slice(this.offset, this.offset + text.length) === text) {
      this.offset += text.length;
      return text;
    } else {
      return null;
    }
  }
}

const pfilter = (s0) => {
  s0.rule = "filter";
  const m = s0.match(/:([a-z][a-z0-9\-])/y);
  if (m != null) {
    return m[1];
  } else {
    return null;
  }
};

const many = (s0, p) => {
  s0.rule = "many";
  const result = [];
  while (true) {
    const m = p(s0);
    if (m != null) {
      result.push(m);
    } else {
      break;
    }
  }
  return result;
};

const pvar = (s0) => {
  s0.rule = "var";
  const name = s0.match(/\$([a-z][a-z0-9\-]*(?:\.[a-z][a-z0-9\-]*)*)/y);
  if (name == null) {
    return null;
  }
  const names = name[1].split(".");
  const filters = many(s0, pfilter);
  return ["var", names, filters];
};

const pline = (s0) => {
  s0.rule = "line";
  const m = s0.match(/\r\n|\r|\n/y);
  if (m != null) {
    return ["line"];
  } else {
    return null;
  }
};

const ptext = (s0) => {
  s0.rule = "text";
  const text = /(?:\\\$|\\\{|\{(?!\{)|[^\$\{\r\n])+/y;
  const m = s0.match(text);
  if (m != null) {
    return ["txt", m[0]];
  } else {
    return null;
  }
};

const pterm = (s0) => {
  s0.rule = "term";
  const xs = [pvar, pline, ptext];
  for (const p of xs) {
    const match = p(s0);
    if (match != null) {
      return match;
    }
  }
  return null;
};

const parser = (s0) => many(s0, pterm);

module.exports = {
  *template__parse(template) {
    debugger;
    const state = new State(template, 0);
    const tokens = parser(state);
    if (tokens == null) {
      return $meow.record({
        ok: false,
        reason: $meow.record({
          offset: state.offset,
          message: `Parser failed at ${state.rule} offset ${state.offset} (${template.slice(
            state.offset,
            state.offset + 10
          )})`,
        }),
      });
    }
    return $meow.record({ ok: true, value: $meow.record({ tokens }) });
  },
};
