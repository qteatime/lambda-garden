/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/
 */
import * as assert from "node:assert/strict";

export const eq = <T1, T2>(actual: T1, expected: T2, msg?: string) =>
  assert.deepStrictEqual(actual, expected, msg);

export const is = <T1, T2>(actual: T1, expected: T2, msg?: string) =>
  assert.strictEqual(actual, expected, msg);
