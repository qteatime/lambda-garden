/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { is, is_array, is_int32, is_object, is_string } from "./utils";

export type Schema = {
  version: number;
  relations: RelationSchema[];
  types: TypeSchema[];
};

export type RelationSchema = {
  name: string;
  columns: RelationColumnSchema[];
  indexes: IndexSchema[];
};

export type IndexSchema = {
  name: string;
  columns: IndexColumnSchema[];
};

export type IndexColumnSchema = {
  name: string;
  modality: ModalitySchema;
};

export type RelationColumnSchema = {
  name: string;
  type: string;
  modality: ModalitySchema;
};

export type ModalitySchema = "one" | "many";

export type TypeSchema =
  | {
      tag: PrimitiveTag;
    }
  | {
      tag: "enum";
      name: string;
      values: string[];
    };

type PrimitiveTag = "int32" | "int" | "float64" | "text" | "bool" | "none";

const is_prim_type = (a: unknown) =>
  ["int32", "int", "float64", "text", "bool", "none"].includes(a as any);

const is_modality = (a: unknown) => ["one", "many"].includes(a as any);

const is_type = (a: unknown) =>
  is_object({ tag: is_prim_type })(a) ||
  is_object({ tag: is("enum"), name: is_string, values: is_array(is_string) })(a);

const is_column = (a: unknown) =>
  is_object({ name: is_string, type: is_string, modality: is_modality })(a);

const is_index_column = (a: unknown) => is_object({ name: is_string, modality: is_modality })(a);

const is_index = (a: unknown) =>
  is_object({ name: is_string, columns: is_array(is_index_column) })(a);

const is_relation = (a: unknown) =>
  is_object({ name: is_string, columns: is_array(is_column), indexes: is_array(is_index) })(a);

export const is_schema = (a: unknown) =>
  is_object({
    version: is_int32,
    relations: is_array(is_relation),
    types: is_array(is_type),
  })(a);
