import * as FS from "fs";
import * as Path from "path";
import * as syntax from "./syntax/parser";
import * as compile from "./compile/lower";
import { parse } from "./argparse";

const { file, options } = parse(`meowc`, `Compile Meow files to JS`, process.argv.slice(2), {
  compiling: true,
});

const source = FS.readFileSync(file!, "utf-8");
const ast = syntax.parse(source);
const js = compile.lower(ast, options);
console.log(js);
