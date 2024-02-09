module.exports = {
  *cart_fs__read_file(id) {
    return yield $meow.wait_promise(KateAPI.cart_fs.read_file(id));
  },
};
