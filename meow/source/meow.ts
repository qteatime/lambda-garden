import * as FS from "fs";
import * as Path from "path";
import * as syntax from "./syntax/parser";
import * as compile from "./compile/lower";
import { parse } from "./argparse";

const { file, options } = parse(`meow`, `Run Meow programs`, process.argv.slice(2), {});

const source = FS.readFileSync(file!, "utf-8");
const ast = syntax.parse(source);
const js = compile.lower(ast, options);
new Function("__dirname", "require", "module", "exports", js + `\n//# sourceURL=${file}`)(
  Path.resolve(Path.dirname(file!)),
  require,
  {},
  {}
);
