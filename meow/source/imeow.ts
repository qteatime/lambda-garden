import * as FS from "fs";
import * as Path from "path";
import * as syntax from "./syntax/parser";
import * as compile from "./compile/lower";
import * as Read from "readline/promises";
import * as VM from "vm";
import { parse } from "./argparse";
import { prelude_code } from "./compile/prelude";
const pkg = require("../package.json");

const { file, options } = parse(`imeow`, `Interactive meow shell`, process.argv.slice(2), {
  allow_null_file: true,
});

async function get_line(rl: Read.Interface) {
  let source = "";
  let prompt = ">>> ";
  while (true) {
    const line = await rl.question(prompt);
    source += line;
    try {
      const ast = syntax.parse_repl(source);
      return ast;
    } catch (error) {
      if (!line.trim()) {
        throw error;
      } else {
        prompt = "...";
      }
    }
  }
}

function load_file(file: string, vm: VmCtx) {
  const source = FS.readFileSync(file, "utf-8");
  const ast = syntax.parse(source);
  const js = compile.lower(ast, { ...options, no_prelude: true, cwd: Path.dirname(file) });
  VM.runInContext(js, vm.vm_ctx, { filename: file });
}

async function evaluate(x: syntax.MRepl, vm: VmCtx) {
  return x.match<any>({
    async Command(x) {
      await do_repl_command(x, vm);
    },
    async Decl(x) {
      const js = compile.lower_decl(x, vm.options, vm.import_context).render(0);
      VM.runInContext(js, vm.vm_ctx, { filename: "(repl)" });
      return null;
    },
    async Expr(x) {
      const ctx = new compile.Ctx([]);
      const v = ctx.fresh();
      const js0 = compile.lower_expr(x, ctx, v);
      const js = `$meow.wait((function* () {let ${v}; ${js0.render(0)}; return ${v}})())`;
      const result = await VM.runInContext(js, vm.vm_ctx, { filename: "(repl)" });
      if (result != null) {
        return VM.runInContext(`((v) => $meow.pprint(v))`, vm.vm_ctx)(result);
      } else {
        return null;
      }
    },
  });
}

async function do_repl_command(x: syntax.MRCommand, vm: VmCtx) {
  x.match({
    Quit() {
      process.exit(0);
    },
    DeclCode(x) {
      const code = compile.lower_decl(x, vm.options, vm.import_context);
      console.log(code.render(0));
      return null;
    },
    ExprCode(x) {
      const code = compile.lower_expr(x, vm.ctx, "$ret");
      console.log(code.render(0));
      return null;
    },
  });
}

type VmCtx = {
  options: compile.Options;
  import_context: compile.ImportContext;
  ctx: compile.Ctx;
  vm_ctx: VM.Context;
};

async function main() {
  const rl = Read.createInterface({ input: process.stdin, output: process.stdout });
  const vm: VmCtx = {
    ctx: new compile.Ctx([]),
    import_context: { pkgs: new Set() },
    options,
    vm_ctx: VM.createContext(
      {
        require: require,
        __dirname: file ? Path.dirname(__dirname) : process.cwd(),
        __filename: file ? file : Path.resolve(process.cwd(), ".meow-repl"),
        module: { exports: {} },
        console: {
          log(...args: any[]) {
            console.log(...args);
          },
        },
      },
      {
        name: "REPL",
      }
    ),
  };

  // Initialise runtime
  VM.runInContext(prelude_code(), vm.vm_ctx, { filename: "<meow-prelude>" });
  VM.runInContext(FS.readFileSync(Path.resolve(__dirname, "../lib/_core.js"), "utf-8"), vm.vm_ctx, {
    filename: "package meow.core",
  });
  if (options.pkg != null) {
    VM.runInContext(`$scope.pkg = ${compile.str(options.pkg)}`, vm.vm_ctx);
    VM.runInContext(`$scope.open_pkg(${compile.str(options.pkg)}, null)`, vm.vm_ctx);
  }

  // Run initial package
  if (file != null) {
    load_file(file, vm);
  }

  console.log(`Meow v${pkg.version} | interactive shell`);
  console.log(`(Type Ctrl+D or :exit to quit)`);
  console.log("");

  while (true) {
    try {
      const ast = await get_line(rl);
      const result = await evaluate(ast, vm);
      if (result != null) {
        console.log(String(result));
      }
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        console.error(error.name + ":", error.message);
      } else {
        console.error(error.stack);
      }
    }
  }
}

main().catch((e) => {
  console.error(e.stack);
  process.exit(1);
});
