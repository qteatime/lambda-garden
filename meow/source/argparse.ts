import * as Path from "path";
import * as Util from "util";
import { find_package, type Options } from "./compile/lower";

export function help(exec: string, description: string) {
  console.log(`Usage: ${exec} [options] <file>
${description}

Compilation options:
  --no-prelude            Don't link the Meow prelude statically
  --no-stdlib             Don't link the core package statically
  --no-test               Don't generate tests
  --no-static-linking     Don't link libraries statically
  --no-cache              Ignore cached package files (always recompile them)

Location options:
  --package <name>        Run the given file in the specified package context
  --include <path>        Add <path> to the Meow package search path

Testing options:
  --test-filter <text>    Runs only tests containing the given text in the name.

Goals:
  --test                  Run tests instead of the main function.
  --build                 Builds a cached version of the package (requires --package)

Other:
  --help                  Show this screen
`);
}

export function parse(
  exec: string,
  description: string,
  argv: string[],
  options: {
    allow_null_file?: boolean;
    compiling?: boolean;
  }
): { file: string | null; options: Options } {
  const {
    positionals: [file0],
    values: args,
  } = Util.parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      "no-prelude": {
        type: "boolean",
        default: false,
      },
      "no-stdlib": {
        type: "boolean",
        default: false,
      },
      "no-test": {
        type: "boolean",
        default: false,
      },
      "no-static-linking": {
        type: "boolean",
        default: false,
      },
      "no-cache": {
        type: "boolean",
        default: false,
      },
      "test-filter": {
        type: "string",
        default: "",
      },
      build: {
        type: "boolean",
        default: false,
      },
      package: {
        type: "string",
        default: "",
        short: "p",
      },
      include: {
        type: "string",
        default: [],
        multiple: true,
      },
      test: {
        type: "boolean",
        default: false,
      },
      help: {
        type: "boolean",
        default: false,
      },
    },
  });

  const search_path = [Path.resolve(__dirname, "../packages"), ...(args.include ?? [])];

  let file = file0;
  if (file == null && args.package?.trim()) {
    file = find_package(args.package, search_path);
  }

  if ((file == null && options.allow_null_file !== true) || args.help) {
    help(exec, description);
    process.exit(1);
  }

  return {
    file,
    options: {
      no_prelude: args["no-prelude"] ?? false,
      no_stdlib: args["no-stdlib"] ?? false,
      no_test: args["no-test"] ?? false,
      no_static_linking: args["no-static-linking"] ?? false,
      no_cache: args["no-cache"] ?? false,
      pkg: args.package?.trim() !== "" ? args.package ?? null : null,
      file: file == null ? "()" : file,
      cwd: file == null ? process.cwd() : Path.resolve(process.cwd(), Path.dirname(file)),
      search_path,
      compiling: options.compiling === true,
      test: args.test ?? false,
      build: args.build ?? false,
    },
  };
}
