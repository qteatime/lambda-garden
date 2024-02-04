class $ShadowStack {
  private entries: (null | string)[] = new Array(2 ** 16).fill(null);
  private length = 0;

  push(entry: string) {
    if (this.length === this.entries.length) {
      this.gc();
    }
    this.entries[this.length] = entry;
    this.length += 1;
  }

  pop() {
    this.length = Math.max(this.length - 1, 0);
  }

  gc() {
    const len = this.entries.length;
    for (let i = 0; i < 10; ++i) {
      this.entries[i] = this.entries[len - 11 + i];
    }
    this.length = 10;
  }

  *all_entries(): Generator<string> {
    for (let i = Math.max(0, this.length - 10); i < this.length; ++i) {
      const entry = this.entries[i];
      if (entry == null) {
        break;
      }
      yield entry;
    }
  }

  current(): string {
    if (this.length === 0) {
      return `(root)`;
    } else {
      return this.entries[this.length - 1]!;
    }
  }

  format() {
    const result = [];
    for (const name of this.all_entries()) {
      result.push(`  At ${name}`);
    }
    return result.join("\n");
  }
}

const $stack = new $ShadowStack();

const $t = (data: string) => $stack.push(data);
