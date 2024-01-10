import * as Path from "path";
import * as Util from "util";
import type { Options } from "./compile/lower";

export function help(exec: string, description: string) {
  console.log(`Usage: ${exec} [options] <file>
${description}

Options:
  --no-prelude            Don't link the Meow prelude statically
  --no-stdlib             Don't link the core package statically
  --no-test               Don't generate tests
  --package <name>        Run the given file in the specified package context
  --include <path>        Add <path> to the Meow package search path
  --test                  Run tests instead of the main function.
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
    positionals: [file],
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

  if ((file == null && options.allow_null_file !== true) || args.help) {
    help(exec, description);
    process.exit(1);
  }

  const search_path = [Path.resolve(__dirname, "../packages"), ...(args.include ?? [])];
  return {
    file,
    options: {
      no_prelude: args["no-prelude"] ?? false,
      no_stdlib: args["no-stdlib"] ?? false,
      no_test: args["no-test"] ?? false,
      pkg: args.package?.trim() !== "" ? args.package ?? null : null,
      cwd: file == null ? process.cwd() : Path.resolve(process.cwd(), Path.dirname(file)),
      search_path,
      compiling: options.compiling === true,
    },
  };
}
