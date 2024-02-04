/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Value } from "./values";

export abstract class Type {
  abstract name: string;
  abstract check(x: Value): boolean;
  abstract reify_unchecked(x: Value): Value;
}

export const int32 = new (class TInt32 extends Type {
  readonly name = "int32";

  check(x: Value) {
    return typeof x === "number" && (x | 0) === x;
  }

  reify_unchecked(x: Value) {
    return x;
  }
})();

export const int = new (class TInt extends Type {
  readonly name = "int";

  check(x: Value): boolean {
    return typeof x === "bigint";
  }

  reify_unchecked(x: Value): Value {
    return x;
  }
})();

export const float64 = new (class TFloat64 extends Type {
  readonly name = "float64";

  check(x: Value): boolean {
    return typeof x === "number";
  }

  reify_unchecked(x: Value): Value {
    return x;
  }
})();

export const text = new (class TText extends Type {
  readonly name = "text";

  check(x: Value): boolean {
    return typeof x === "string";
  }

  reify_unchecked(x: Value): Value {
    return x;
  }
})();

export const bool = new (class TBool extends Type {
  readonly name = "bool";

  check(x: Value): boolean {
    return typeof x === "boolean";
  }

  reify_unchecked(x: Value): Value {
    return x;
  }
})();

export const none = new (class TNone extends Type {
  readonly name = "none";

  check(x: Value): boolean {
    return x === null;
  }

  reify_unchecked(x: Value): Value {
    return x;
  }
})();

export class TEnum extends Type {
  constructor(readonly tag: string, readonly values: string[]) {
    super();
  }

  get name() {
    return `${this.tag}`;
  }

  check(x: Value): boolean {
    return typeof x === "number" && x >= 0 && x < this.values.length;
  }

  intern(x: string): number {
    const id = this.values.indexOf(x);
    if (id === -1) {
      throw new Error(`Invalid ${this.tag} enum: ${x}`);
    }
    return id;
  }

  reify_unchecked(x: Value): Value {
    return this.values[x as number];
  }
}
