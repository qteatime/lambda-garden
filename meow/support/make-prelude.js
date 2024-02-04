const FS = require("fs");
const Path = require("path");

const root = Path.join(__dirname, "../build/prelude");
const files = FS.readdirSync(root)
  .filter((x) => Path.extname(x) === ".js")
  .sort();

const sources = files.map((x) => FS.readFileSync(Path.join(root, x), "utf-8"));
const prelude = sources.join("\nvoid 0;\n");
FS.writeFileSync(Path.join(__dirname, "../meow-prelude.js"), prelude);
