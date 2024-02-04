import * as FS from "fs";
import * as Path from "path";
import * as syntax from "./syntax/parser";
import * as compile from "./compile/lower";
import { parse } from "./argparse";

const { file, options } = parse(`meowc`, `Compile Meow files to JS`, process.argv.slice(2), {
  compiling: true,
  allow_null_file: true,
});

function build_package(name: string, entry: string) {
  console.log(`--> ${name} (from ${entry})`);
  const pkgs = new Set<string>();
  const code = compile.pkg_from_file(
    entry,
    name,
    {
      ...options,
      no_prelude: true,
      no_stdlib: true,
      no_static_linking: true,
      no_test: true,
      no_cache: true,
    },
    { pkgs: pkgs, files: new Set() }
  );

  const cache: compile.PkgCache = {
    name: name,
    created_at: new Date().getTime(),
    deps: [...pkgs],
    code: code,
  };
  FS.writeFileSync(Path.join(Path.dirname(entry), ".pkg.meowc"), JSON.stringify(cache));
}

if (options.build) {
  if (!options.pkg) {
    console.log(`Rebuilding all packages in search path: (${options.search_path.join(", ")})`);
    for (const dir of options.search_path) {
      const pkgs = FS.readdirSync(dir);
      for (const pkg of pkgs) {
        const entry = Path.resolve(dir, pkg, "main.meow");
        if (FS.existsSync(entry)) {
          build_package(pkg, entry);
        }
      }
    }
  } else {
    const entry = compile.find_package(options.pkg, options.search_path);
    build_package(options.pkg, entry);
  }
} else if (options.file != null) {
  const source = FS.readFileSync(file!, "utf-8");
  const ast = syntax.parse(source);
  const js = compile.lower(ast, options, {
    pkgs: new Set(),
    files: new Set(file == null ? [] : [Path.resolve(file)]),
  });
  console.log(js);
} else {
  console.error(`
Usage: meowc --build [--package <name>]
       meowc <file>
       meow --help`);
  process.exit(1);
}
