/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { Int32 } from "../../values";

export function gt(a: Int32, b: Int32) {
  return (a | 0) > (b | 0);
}

export function gte(a: Int32, b: Int32) {
  return (a | 0) >= (b | 0);
}

export function lt(a: Int32, b: Int32) {
  return (a | 0) < (b | 0);
}

export function lte(a: Int32, b: Int32) {
  return (a | 0) <= (b | 0);
}

export function eq(a: Int32, b: Int32) {
  return (a | 0) === (b | 0);
}

export function neq(a: Int32, b: Int32) {
  return (a | 0) !== (b | 0);
}

export function add(a: Int32, b: Int32) {
  return ((a | 0) + (b | 0)) | 0;
}

export function sub(a: Int32, b: Int32) {
  return ((a | 0) - (b | 0)) | 0;
}

export function mul(a: Int32, b: Int32) {
  return ((a | 0) * (b | 0)) | 0;
}

export function div(a: Int32, b: Int32) {
  return ((a | 0) / (b | 0)) | 0;
}

export function pow(a: Int32, b: Int32) {
  return ((a | 0) ** (b | 0)) | 0;
}
