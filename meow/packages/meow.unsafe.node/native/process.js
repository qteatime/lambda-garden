module.exports = {
  *process__abort() {
    process.abort();
    return null;
  },
  *process__arch() {
    return process.arch;
  },
  *process__argv() {
    return process.argv;
  },
  *process__cwd() {
    return process.cwd();
  },
  *process__env() {
    return new Map(Object.entries(process.env));
  },
  *process__exit(code) {
    process.exit(code);
    return null;
  },
};
