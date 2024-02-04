const transcript_log = (x: $Value) => console.log($pprint(x));

const transcript_write = (x: string) => console.log(x);

const transcript_trace = (x: $Value, tag: string) =>
  console.trace(`(${tag}) ${$pprint(x)}\n\nStack:\n${$stack.format()}\n---`);
