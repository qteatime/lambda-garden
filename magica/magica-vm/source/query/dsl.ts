/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { Value } from "../values";
import { QueryExpr } from "./compiler";

export function value(x: Value): QueryExpr {
  return { op: "get-const", value: x };
}

export function search(relation: string, args: QueryExpr[]): QueryExpr {
  return { op: "search", relation, args };
}

export function v(name: string): QueryExpr {
  return { op: "get-var", name };
}

export function any(): QueryExpr {
  return { op: "get-fresh" };
}

export function unify(left: QueryExpr, right: QueryExpr): QueryExpr {
  return { op: "unify", left, right };
}

export function conj(...xs: QueryExpr[]): QueryExpr {
  return { op: "conj", exprs: xs };
}

export function disj(...xs: QueryExpr[]): QueryExpr {
  return { op: "disj", exprs: xs };
}

export function not(x: QueryExpr): QueryExpr {
  return { op: "not", expr: x };
}

export function prim(name: string, args: QueryExpr[]): QueryExpr {
  return { op: "call-prim", name, args };
}
