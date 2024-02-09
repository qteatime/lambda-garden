import * as FS from "fs";
import * as Path from "path";
import * as syntax from "./syntax/parser";
import * as compile from "./compile/lower";
import { parse } from "./argparse";

const { file, cache_root, options } = parse(`meow`, `Run Meow programs`, process.argv.slice(2), {});

const ast = syntax.parse_file(file!, cache_root);
const js = compile.lower(ast, options, {
  pkgs: new Set(),
  files: new Set(file == null ? [] : [Path.resolve(file)]),
  cache_root: cache_root,
});
new Function("__dirname", "require", "module", "exports", js + `\n//# sourceURL=${file}`)(
  Path.resolve(Path.dirname(file!)),
  require,
  {},
  {}
);
