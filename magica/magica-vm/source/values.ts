/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export class Fresh {}

export type Int32 = number;
export const fresh = new Fresh();
export type Value = Int32 | number | bigint | boolean | null | string;
export type QueryValue = Value | Fresh;
