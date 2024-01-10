
  // This file is generated from Linguist
  import * as Ohm from "ohm-js";
  const OhmUtil = require("ohm-js/src/util");
  import { inspect as $inspect } from "util";

  
const inspect = Symbol.for('nodejs.util.inspect.custom');

type Result<A> =
  { ok: true, value: A }
| { ok: false, error: string };

export abstract class Node {}

export class Meta {
  constructor(readonly interval: Ohm.Interval) {}

  static has_instance(x: any) {
    return x instanceof Meta;
  }

  get position() {
    const { lineNum, colNum } = OhmUtil.getLineAndColumn(
      (this.interval as any).sourceString,
      this.interval.startIdx
    );
    return {
      line: lineNum,
      column: colNum,
    };
  }

  get range() {
    return {
      start: this.interval.startIdx,
      end: this.interval.endIdx,
    };
  }

  get source_slice() {
    return this.interval.contents;
  }

  get formatted_position_message() {
    return this.interval.getLineAndColumnMessage();
  }

  [inspect]() {
    return this.position;
  }
}

const $primitive = {
  parse_json(x: string) {
    return JSON.parse(x);
  },
 parse_string(x: string) { return JSON.parse(x.replace(/\r\n|\r|\n/g, `\\n`)) },   parse_integer(x: string) {
    return BigInt(x.replace(/_/g, ""));
  },
  parse_float(x: string) {
    return Number(x.replace(/_/g, ""));
  },
  parse_boolean(x: string) {
    switch (x) {
      case "true": return true;
      case "false": return false;
      default: throw new Error(`Not a boolean ${x}`);
    }
  },
  flatten_list<A>(xs: A[]) {
    return xs.flat();
  }
};

function $meta(x: Ohm.Node): Meta {
  return new Meta(x.source);
}

type Typed =
  ((_: any) => boolean)
| { has_instance(x: any): boolean };

function $check_type(f: Typed) {
  return (x: any) => {
    if (typeof (f as any).has_instance === "function") {
      return (f as any).has_instance(x);
    } else {
      return (f as any)(x);
    }
  }
}

function $is_type(t: string) {
  return (x: any) => {
    return typeof x === t;
  };
}

function $is_array(f: Typed) {
  return (x: any) => {
    return Array.isArray(x) && x.every($check_type(f));
  };
}

function $is_maybe(f: Typed) {
  return (x: any) => {
    return x === null || $check_type(f)(x);
  };
}

function $is_null(x: any) {
  return x === null;
}

function $assert_type<T>(x: any, t: string, f: Typed): asserts x is T {
  if (!$check_type(f)(x)) {
    throw new TypeError(`Expected ${t}, but got ${$inspect(x)}`);
  }
}
  

  // == Type definitions ==============================================
  
  export class MModule extends Node {
    readonly tag!: "MModule"

    constructor(readonly info: (Meta | null), readonly declarations: MDecl[]) {
      super();
      Object.defineProperty(this, "tag", { value: "MModule" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MDecl[]>(declarations, "MDecl[]", $is_array(MDecl)))
    }

    static has_instance(x: any) {
      return x instanceof MModule;
    }
  }
  


      type $p_MRepl<$T> = {
        
  Decl(x: MDecl): $T;
  
  Expr(x: MExpr): $T;
  
  Command(x: MRCommand): $T;
  
      }

      export abstract class MRepl extends Node {
        abstract tag: "Decl" | "Expr" | "Command";
        abstract match<$T>(p: $p_MRepl<$T>): $T;
        
  static get Decl() {
    return $$MRepl$_Decl
  }
  

  static get Expr() {
    return $$MRepl$_Expr
  }
  

  static get Command() {
    return $$MRepl$_Command
  }
  

        static has_instance(x: any) {
          return x instanceof MRepl;
        }
      }
 
      
  export class $$MRepl$_Decl extends MRepl {
    readonly tag!: "Decl";

    constructor(readonly x: MDecl) {
      super();
      Object.defineProperty(this, "tag", { value: "Decl" });
      ($assert_type<MDecl>(x, "MDecl", MDecl))
    }

    match<$T>(p: $p_MRepl<$T>): $T {
      return p.Decl(this.x);
    }

    static has_instance(x: any) {
      return x instanceof $$MRepl$_Decl;
    }
  }
  


  export class $$MRepl$_Expr extends MRepl {
    readonly tag!: "Expr";

    constructor(readonly x: MExpr) {
      super();
      Object.defineProperty(this, "tag", { value: "Expr" });
      ($assert_type<MExpr>(x, "MExpr", MExpr))
    }

    match<$T>(p: $p_MRepl<$T>): $T {
      return p.Expr(this.x);
    }

    static has_instance(x: any) {
      return x instanceof $$MRepl$_Expr;
    }
  }
  


  export class $$MRepl$_Command extends MRepl {
    readonly tag!: "Command";

    constructor(readonly x: MRCommand) {
      super();
      Object.defineProperty(this, "tag", { value: "Command" });
      ($assert_type<MRCommand>(x, "MRCommand", MRCommand))
    }

    match<$T>(p: $p_MRepl<$T>): $T {
      return p.Command(this.x);
    }

    static has_instance(x: any) {
      return x instanceof $$MRepl$_Command;
    }
  }
  
      


      type $p_MRCommand<$T> = {
        
  Quit(): $T;
  
  ExprCode(x: MExpr): $T;
  
  DeclCode(x: MDecl): $T;
  
      }

      export abstract class MRCommand extends Node {
        abstract tag: "Quit" | "ExprCode" | "DeclCode";
        abstract match<$T>(p: $p_MRCommand<$T>): $T;
        
  static get Quit() {
    return $$MRCommand$_Quit
  }
  

  static get ExprCode() {
    return $$MRCommand$_ExprCode
  }
  

  static get DeclCode() {
    return $$MRCommand$_DeclCode
  }
  

        static has_instance(x: any) {
          return x instanceof MRCommand;
        }
      }
 
      
  export class $$MRCommand$_Quit extends MRCommand {
    readonly tag!: "Quit";

    constructor() {
      super();
      Object.defineProperty(this, "tag", { value: "Quit" });
      
    }

    match<$T>(p: $p_MRCommand<$T>): $T {
      return p.Quit();
    }

    static has_instance(x: any) {
      return x instanceof $$MRCommand$_Quit;
    }
  }
  


  export class $$MRCommand$_ExprCode extends MRCommand {
    readonly tag!: "ExprCode";

    constructor(readonly x: MExpr) {
      super();
      Object.defineProperty(this, "tag", { value: "ExprCode" });
      ($assert_type<MExpr>(x, "MExpr", MExpr))
    }

    match<$T>(p: $p_MRCommand<$T>): $T {
      return p.ExprCode(this.x);
    }

    static has_instance(x: any) {
      return x instanceof $$MRCommand$_ExprCode;
    }
  }
  


  export class $$MRCommand$_DeclCode extends MRCommand {
    readonly tag!: "DeclCode";

    constructor(readonly x: MDecl) {
      super();
      Object.defineProperty(this, "tag", { value: "DeclCode" });
      ($assert_type<MDecl>(x, "MDecl", MDecl))
    }

    match<$T>(p: $p_MRCommand<$T>): $T {
      return p.DeclCode(this.x);
    }

    static has_instance(x: any) {
      return x instanceof $$MRCommand$_DeclCode;
    }
  }
  
      


      type $p_MDecl<$T> = {
        
  Fun(info: (Meta | null), name: string, params: MParam[], ret: MType, body: MExpr, test: (MExpr | null)): $T;
  
  SFun(info: (Meta | null), name: string, self: MParam, params: MParam[], ret: MType, body: MExpr, test: (MExpr | null)): $T;
  
  Struct(info: (Meta | null), name: string, fields: Field[]): $T;
  
  Union(info: (Meta | null), name: string, variants: Variant[]): $T;
  
  Singleton(info: (Meta | null), name: string): $T;
  
  Def(info: (Meta | null), name: string, typ: MType, body: MExpr): $T;
  
  Test(info: (Meta | null), name: string, body: MExpr): $T;
  
  Import(info: (Meta | null), id: string): $T;
  
  ImportForeign(info: (Meta | null), path: string): $T;
  
  Trait(info: (Meta | null), name: string, reqs: (TraitReq | null)[]): $T;
  
  Implement(info: (Meta | null), name: string, typ: MType, decls: MDecl[]): $T;
  
  OpenPkg(info: (Meta | null), name: string, alias: (string | null)): $T;
  
  DeclareType(info: (Meta | null), name: string): $T;
  
      }

      export abstract class MDecl extends Node {
        abstract tag: "Fun" | "SFun" | "Struct" | "Union" | "Singleton" | "Def" | "Test" | "Import" | "ImportForeign" | "Trait" | "Implement" | "OpenPkg" | "DeclareType";
        abstract match<$T>(p: $p_MDecl<$T>): $T;
        
  static get Fun() {
    return $$MDecl$_Fun
  }
  

  static get SFun() {
    return $$MDecl$_SFun
  }
  

  static get Struct() {
    return $$MDecl$_Struct
  }
  

  static get Union() {
    return $$MDecl$_Union
  }
  

  static get Singleton() {
    return $$MDecl$_Singleton
  }
  

  static get Def() {
    return $$MDecl$_Def
  }
  

  static get Test() {
    return $$MDecl$_Test
  }
  

  static get Import() {
    return $$MDecl$_Import
  }
  

  static get ImportForeign() {
    return $$MDecl$_ImportForeign
  }
  

  static get Trait() {
    return $$MDecl$_Trait
  }
  

  static get Implement() {
    return $$MDecl$_Implement
  }
  

  static get OpenPkg() {
    return $$MDecl$_OpenPkg
  }
  

  static get DeclareType() {
    return $$MDecl$_DeclareType
  }
  

        static has_instance(x: any) {
          return x instanceof MDecl;
        }
      }
 
      
  export class $$MDecl$_Fun extends MDecl {
    readonly tag!: "Fun";

    constructor(readonly info: (Meta | null), readonly name: string, readonly params: MParam[], readonly ret: MType, readonly body: MExpr, readonly test: (MExpr | null)) {
      super();
      Object.defineProperty(this, "tag", { value: "Fun" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(name, "string", $is_type("string"))); ($assert_type<MParam[]>(params, "MParam[]", $is_array(MParam))); ($assert_type<MType>(ret, "MType", MType)); ($assert_type<MExpr>(body, "MExpr", MExpr)); ($assert_type<(MExpr | null)>(test, "(MExpr | null)", $is_maybe(MExpr)))
    }

    match<$T>(p: $p_MDecl<$T>): $T {
      return p.Fun(this.info, this.name, this.params, this.ret, this.body, this.test);
    }

    static has_instance(x: any) {
      return x instanceof $$MDecl$_Fun;
    }
  }
  


  export class $$MDecl$_SFun extends MDecl {
    readonly tag!: "SFun";

    constructor(readonly info: (Meta | null), readonly name: string, readonly self: MParam, readonly params: MParam[], readonly ret: MType, readonly body: MExpr, readonly test: (MExpr | null)) {
      super();
      Object.defineProperty(this, "tag", { value: "SFun" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(name, "string", $is_type("string"))); ($assert_type<MParam>(self, "MParam", MParam)); ($assert_type<MParam[]>(params, "MParam[]", $is_array(MParam))); ($assert_type<MType>(ret, "MType", MType)); ($assert_type<MExpr>(body, "MExpr", MExpr)); ($assert_type<(MExpr | null)>(test, "(MExpr | null)", $is_maybe(MExpr)))
    }

    match<$T>(p: $p_MDecl<$T>): $T {
      return p.SFun(this.info, this.name, this.self, this.params, this.ret, this.body, this.test);
    }

    static has_instance(x: any) {
      return x instanceof $$MDecl$_SFun;
    }
  }
  


  export class $$MDecl$_Struct extends MDecl {
    readonly tag!: "Struct";

    constructor(readonly info: (Meta | null), readonly name: string, readonly fields: Field[]) {
      super();
      Object.defineProperty(this, "tag", { value: "Struct" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(name, "string", $is_type("string"))); ($assert_type<Field[]>(fields, "Field[]", $is_array(Field)))
    }

    match<$T>(p: $p_MDecl<$T>): $T {
      return p.Struct(this.info, this.name, this.fields);
    }

    static has_instance(x: any) {
      return x instanceof $$MDecl$_Struct;
    }
  }
  


  export class $$MDecl$_Union extends MDecl {
    readonly tag!: "Union";

    constructor(readonly info: (Meta | null), readonly name: string, readonly variants: Variant[]) {
      super();
      Object.defineProperty(this, "tag", { value: "Union" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(name, "string", $is_type("string"))); ($assert_type<Variant[]>(variants, "Variant[]", $is_array(Variant)))
    }

    match<$T>(p: $p_MDecl<$T>): $T {
      return p.Union(this.info, this.name, this.variants);
    }

    static has_instance(x: any) {
      return x instanceof $$MDecl$_Union;
    }
  }
  


  export class $$MDecl$_Singleton extends MDecl {
    readonly tag!: "Singleton";

    constructor(readonly info: (Meta | null), readonly name: string) {
      super();
      Object.defineProperty(this, "tag", { value: "Singleton" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(name, "string", $is_type("string")))
    }

    match<$T>(p: $p_MDecl<$T>): $T {
      return p.Singleton(this.info, this.name);
    }

    static has_instance(x: any) {
      return x instanceof $$MDecl$_Singleton;
    }
  }
  


  export class $$MDecl$_Def extends MDecl {
    readonly tag!: "Def";

    constructor(readonly info: (Meta | null), readonly name: string, readonly typ: MType, readonly body: MExpr) {
      super();
      Object.defineProperty(this, "tag", { value: "Def" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(name, "string", $is_type("string"))); ($assert_type<MType>(typ, "MType", MType)); ($assert_type<MExpr>(body, "MExpr", MExpr))
    }

    match<$T>(p: $p_MDecl<$T>): $T {
      return p.Def(this.info, this.name, this.typ, this.body);
    }

    static has_instance(x: any) {
      return x instanceof $$MDecl$_Def;
    }
  }
  


  export class $$MDecl$_Test extends MDecl {
    readonly tag!: "Test";

    constructor(readonly info: (Meta | null), readonly name: string, readonly body: MExpr) {
      super();
      Object.defineProperty(this, "tag", { value: "Test" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(name, "string", $is_type("string"))); ($assert_type<MExpr>(body, "MExpr", MExpr))
    }

    match<$T>(p: $p_MDecl<$T>): $T {
      return p.Test(this.info, this.name, this.body);
    }

    static has_instance(x: any) {
      return x instanceof $$MDecl$_Test;
    }
  }
  


  export class $$MDecl$_Import extends MDecl {
    readonly tag!: "Import";

    constructor(readonly info: (Meta | null), readonly id: string) {
      super();
      Object.defineProperty(this, "tag", { value: "Import" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(id, "string", $is_type("string")))
    }

    match<$T>(p: $p_MDecl<$T>): $T {
      return p.Import(this.info, this.id);
    }

    static has_instance(x: any) {
      return x instanceof $$MDecl$_Import;
    }
  }
  


  export class $$MDecl$_ImportForeign extends MDecl {
    readonly tag!: "ImportForeign";

    constructor(readonly info: (Meta | null), readonly path: string) {
      super();
      Object.defineProperty(this, "tag", { value: "ImportForeign" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(path, "string", $is_type("string")))
    }

    match<$T>(p: $p_MDecl<$T>): $T {
      return p.ImportForeign(this.info, this.path);
    }

    static has_instance(x: any) {
      return x instanceof $$MDecl$_ImportForeign;
    }
  }
  


  export class $$MDecl$_Trait extends MDecl {
    readonly tag!: "Trait";

    constructor(readonly info: (Meta | null), readonly name: string, readonly reqs: (TraitReq | null)[]) {
      super();
      Object.defineProperty(this, "tag", { value: "Trait" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(name, "string", $is_type("string"))); ($assert_type<(TraitReq | null)[]>(reqs, "(TraitReq | null)[]", $is_array($is_maybe(TraitReq))))
    }

    match<$T>(p: $p_MDecl<$T>): $T {
      return p.Trait(this.info, this.name, this.reqs);
    }

    static has_instance(x: any) {
      return x instanceof $$MDecl$_Trait;
    }
  }
  


  export class $$MDecl$_Implement extends MDecl {
    readonly tag!: "Implement";

    constructor(readonly info: (Meta | null), readonly name: string, readonly typ: MType, readonly decls: MDecl[]) {
      super();
      Object.defineProperty(this, "tag", { value: "Implement" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(name, "string", $is_type("string"))); ($assert_type<MType>(typ, "MType", MType)); ($assert_type<MDecl[]>(decls, "MDecl[]", $is_array(MDecl)))
    }

    match<$T>(p: $p_MDecl<$T>): $T {
      return p.Implement(this.info, this.name, this.typ, this.decls);
    }

    static has_instance(x: any) {
      return x instanceof $$MDecl$_Implement;
    }
  }
  


  export class $$MDecl$_OpenPkg extends MDecl {
    readonly tag!: "OpenPkg";

    constructor(readonly info: (Meta | null), readonly name: string, readonly alias: (string | null)) {
      super();
      Object.defineProperty(this, "tag", { value: "OpenPkg" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(name, "string", $is_type("string"))); ($assert_type<(string | null)>(alias, "(string | null)", $is_maybe($is_type("string"))))
    }

    match<$T>(p: $p_MDecl<$T>): $T {
      return p.OpenPkg(this.info, this.name, this.alias);
    }

    static has_instance(x: any) {
      return x instanceof $$MDecl$_OpenPkg;
    }
  }
  


  export class $$MDecl$_DeclareType extends MDecl {
    readonly tag!: "DeclareType";

    constructor(readonly info: (Meta | null), readonly name: string) {
      super();
      Object.defineProperty(this, "tag", { value: "DeclareType" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(name, "string", $is_type("string")))
    }

    match<$T>(p: $p_MDecl<$T>): $T {
      return p.DeclareType(this.info, this.name);
    }

    static has_instance(x: any) {
      return x instanceof $$MDecl$_DeclareType;
    }
  }
  
      


      type $p_TraitReq<$T> = {
        
  Required(name: string, params: MParam[]): $T;
  
  Provided(fn: MDecl): $T;
  
      }

      export abstract class TraitReq extends Node {
        abstract tag: "Required" | "Provided";
        abstract match<$T>(p: $p_TraitReq<$T>): $T;
        
  static get Required() {
    return $$TraitReq$_Required
  }
  

  static get Provided() {
    return $$TraitReq$_Provided
  }
  

        static has_instance(x: any) {
          return x instanceof TraitReq;
        }
      }
 
      
  export class $$TraitReq$_Required extends TraitReq {
    readonly tag!: "Required";

    constructor(readonly name: string, readonly params: MParam[]) {
      super();
      Object.defineProperty(this, "tag", { value: "Required" });
      ($assert_type<string>(name, "string", $is_type("string"))); ($assert_type<MParam[]>(params, "MParam[]", $is_array(MParam)))
    }

    match<$T>(p: $p_TraitReq<$T>): $T {
      return p.Required(this.name, this.params);
    }

    static has_instance(x: any) {
      return x instanceof $$TraitReq$_Required;
    }
  }
  


  export class $$TraitReq$_Provided extends TraitReq {
    readonly tag!: "Provided";

    constructor(readonly fn: MDecl) {
      super();
      Object.defineProperty(this, "tag", { value: "Provided" });
      ($assert_type<MDecl>(fn, "MDecl", MDecl))
    }

    match<$T>(p: $p_TraitReq<$T>): $T {
      return p.Provided(this.fn);
    }

    static has_instance(x: any) {
      return x instanceof $$TraitReq$_Provided;
    }
  }
  
      


  export class Variant extends Node {
    readonly tag!: "Variant"

    constructor(readonly info: (Meta | null), readonly name: string, readonly fields: (Field[] | null)) {
      super();
      Object.defineProperty(this, "tag", { value: "Variant" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(name, "string", $is_type("string"))); ($assert_type<(Field[] | null)>(fields, "(Field[] | null)", $is_maybe($is_array(Field))))
    }

    static has_instance(x: any) {
      return x instanceof Variant;
    }
  }
  


  export class MParam extends Node {
    readonly tag!: "MParam"

    constructor(readonly info: (Meta | null), readonly keyword: (string | null), readonly name: (string | null), readonly typ: MType) {
      super();
      Object.defineProperty(this, "tag", { value: "MParam" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<(string | null)>(keyword, "(string | null)", $is_maybe($is_type("string")))); ($assert_type<(string | null)>(name, "(string | null)", $is_maybe($is_type("string")))); ($assert_type<MType>(typ, "MType", MType))
    }

    static has_instance(x: any) {
      return x instanceof MParam;
    }
  }
  


  export class Field extends Node {
    readonly tag!: "Field"

    constructor(readonly info: (Meta | null), readonly name: string, readonly typ: MType) {
      super();
      Object.defineProperty(this, "tag", { value: "Field" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(name, "string", $is_type("string"))); ($assert_type<MType>(typ, "MType", MType))
    }

    static has_instance(x: any) {
      return x instanceof Field;
    }
  }
  


      type $p_MType<$T> = {
        
  Ref(info: (Meta | null), ref: MRef): $T;
  
  Static(info: (Meta | null), ref: MRef): $T;
  
  Variant(info: (Meta | null), ref: MRef, variant: string): $T;
  
  Trait(info: (Meta | null), ref: MRef): $T;
  
  Var(info: (Meta | null), name: string): $T;
  
  Fun(info: (Meta | null), input: MType[], output: MType): $T;
  
  Record(info: (Meta | null), fields: TPair[]): $T;
  
  Infer(info: (Meta | null)): $T;
  
      }

      export abstract class MType extends Node {
        abstract tag: "Ref" | "Static" | "Variant" | "Trait" | "Var" | "Fun" | "Record" | "Infer";
        abstract match<$T>(p: $p_MType<$T>): $T;
        
  static get Ref() {
    return $$MType$_Ref
  }
  

  static get Static() {
    return $$MType$_Static
  }
  

  static get Variant() {
    return $$MType$_Variant
  }
  

  static get Trait() {
    return $$MType$_Trait
  }
  

  static get Var() {
    return $$MType$_Var
  }
  

  static get Fun() {
    return $$MType$_Fun
  }
  

  static get Record() {
    return $$MType$_Record
  }
  

  static get Infer() {
    return $$MType$_Infer
  }
  

        static has_instance(x: any) {
          return x instanceof MType;
        }
      }
 
      
  export class $$MType$_Ref extends MType {
    readonly tag!: "Ref";

    constructor(readonly info: (Meta | null), readonly ref: MRef) {
      super();
      Object.defineProperty(this, "tag", { value: "Ref" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MRef>(ref, "MRef", MRef))
    }

    match<$T>(p: $p_MType<$T>): $T {
      return p.Ref(this.info, this.ref);
    }

    static has_instance(x: any) {
      return x instanceof $$MType$_Ref;
    }
  }
  


  export class $$MType$_Static extends MType {
    readonly tag!: "Static";

    constructor(readonly info: (Meta | null), readonly ref: MRef) {
      super();
      Object.defineProperty(this, "tag", { value: "Static" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MRef>(ref, "MRef", MRef))
    }

    match<$T>(p: $p_MType<$T>): $T {
      return p.Static(this.info, this.ref);
    }

    static has_instance(x: any) {
      return x instanceof $$MType$_Static;
    }
  }
  


  export class $$MType$_Variant extends MType {
    readonly tag!: "Variant";

    constructor(readonly info: (Meta | null), readonly ref: MRef, readonly variant: string) {
      super();
      Object.defineProperty(this, "tag", { value: "Variant" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MRef>(ref, "MRef", MRef)); ($assert_type<string>(variant, "string", $is_type("string")))
    }

    match<$T>(p: $p_MType<$T>): $T {
      return p.Variant(this.info, this.ref, this.variant);
    }

    static has_instance(x: any) {
      return x instanceof $$MType$_Variant;
    }
  }
  


  export class $$MType$_Trait extends MType {
    readonly tag!: "Trait";

    constructor(readonly info: (Meta | null), readonly ref: MRef) {
      super();
      Object.defineProperty(this, "tag", { value: "Trait" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MRef>(ref, "MRef", MRef))
    }

    match<$T>(p: $p_MType<$T>): $T {
      return p.Trait(this.info, this.ref);
    }

    static has_instance(x: any) {
      return x instanceof $$MType$_Trait;
    }
  }
  


  export class $$MType$_Var extends MType {
    readonly tag!: "Var";

    constructor(readonly info: (Meta | null), readonly name: string) {
      super();
      Object.defineProperty(this, "tag", { value: "Var" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(name, "string", $is_type("string")))
    }

    match<$T>(p: $p_MType<$T>): $T {
      return p.Var(this.info, this.name);
    }

    static has_instance(x: any) {
      return x instanceof $$MType$_Var;
    }
  }
  


  export class $$MType$_Fun extends MType {
    readonly tag!: "Fun";

    constructor(readonly info: (Meta | null), readonly input: MType[], readonly output: MType) {
      super();
      Object.defineProperty(this, "tag", { value: "Fun" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MType[]>(input, "MType[]", $is_array(MType))); ($assert_type<MType>(output, "MType", MType))
    }

    match<$T>(p: $p_MType<$T>): $T {
      return p.Fun(this.info, this.input, this.output);
    }

    static has_instance(x: any) {
      return x instanceof $$MType$_Fun;
    }
  }
  


  export class $$MType$_Record extends MType {
    readonly tag!: "Record";

    constructor(readonly info: (Meta | null), readonly fields: TPair[]) {
      super();
      Object.defineProperty(this, "tag", { value: "Record" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<TPair[]>(fields, "TPair[]", $is_array(TPair)))
    }

    match<$T>(p: $p_MType<$T>): $T {
      return p.Record(this.info, this.fields);
    }

    static has_instance(x: any) {
      return x instanceof $$MType$_Record;
    }
  }
  


  export class $$MType$_Infer extends MType {
    readonly tag!: "Infer";

    constructor(readonly info: (Meta | null)) {
      super();
      Object.defineProperty(this, "tag", { value: "Infer" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta)))
    }

    match<$T>(p: $p_MType<$T>): $T {
      return p.Infer(this.info);
    }

    static has_instance(x: any) {
      return x instanceof $$MType$_Infer;
    }
  }
  
      


  export class TPair extends Node {
    readonly tag!: "TPair"

    constructor(readonly name: string, readonly typ: MType) {
      super();
      Object.defineProperty(this, "tag", { value: "TPair" });
      ($assert_type<string>(name, "string", $is_type("string"))); ($assert_type<MType>(typ, "MType", MType))
    }

    static has_instance(x: any) {
      return x instanceof TPair;
    }
  }
  


      type $p_MRef<$T> = {
        
  Named(info: (Meta | null), names: string[]): $T;
  
  Qualified(info: (Meta | null), pkg: string, names: string[]): $T;
  
      }

      export abstract class MRef extends Node {
        abstract tag: "Named" | "Qualified";
        abstract match<$T>(p: $p_MRef<$T>): $T;
        
  static get Named() {
    return $$MRef$_Named
  }
  

  static get Qualified() {
    return $$MRef$_Qualified
  }
  

        static has_instance(x: any) {
          return x instanceof MRef;
        }
      }
 
      
  export class $$MRef$_Named extends MRef {
    readonly tag!: "Named";

    constructor(readonly info: (Meta | null), readonly names: string[]) {
      super();
      Object.defineProperty(this, "tag", { value: "Named" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string[]>(names, "string[]", $is_array($is_type("string"))))
    }

    match<$T>(p: $p_MRef<$T>): $T {
      return p.Named(this.info, this.names);
    }

    static has_instance(x: any) {
      return x instanceof $$MRef$_Named;
    }
  }
  


  export class $$MRef$_Qualified extends MRef {
    readonly tag!: "Qualified";

    constructor(readonly info: (Meta | null), readonly pkg: string, readonly names: string[]) {
      super();
      Object.defineProperty(this, "tag", { value: "Qualified" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(pkg, "string", $is_type("string"))); ($assert_type<string[]>(names, "string[]", $is_array($is_type("string"))))
    }

    match<$T>(p: $p_MRef<$T>): $T {
      return p.Qualified(this.info, this.pkg, this.names);
    }

    static has_instance(x: any) {
      return x instanceof $$MRef$_Qualified;
    }
  }
  
      


      type $p_MExpr<$T> = {
        
  Const(info: (Meta | null), value: MConst): $T;
  
  Var(info: (Meta | null), name: string): $T;
  
  Self(info: (Meta | null)): $T;
  
  Hole(info: (Meta | null)): $T;
  
  Let(info: (Meta | null), name: string, typ: MType, value: MExpr): $T;
  
  Block(info: (Meta | null), exprs: MExpr[]): $T;
  
  If(info: (Meta | null), clauses: MIfClause[]): $T;
  
  Invoke(info: (Meta | null), name: string, args: MInvokeArg[]): $T;
  
  InvokeSelf(info: (Meta | null), name: string, self: MExpr, args: MInvokeArg[]): $T;
  
  Primitive(info: (Meta | null), name: string, args: MExpr[]): $T;
  
  IntrinsicEq(info: (Meta | null), left: MExpr, right: MExpr): $T;
  
  Project(info: (Meta | null), value: MExpr, field: string): $T;
  
  New(info: (Meta | null), ref: MRef, fields: EPair[]): $T;
  
  NewPos(info: (Meta | null), ref: MRef, values: MExpr[]): $T;
  
  NewVariant(info: (Meta | null), ref: MRef, variant: string, fields: EPair[]): $T;
  
  NewVariantPos(info: (Meta | null), ref: MRef, variant: string, args: MExpr[]): $T;
  
  GetVariant(info: (Meta | null), ref: MRef, variant: string): $T;
  
  Static(info: (Meta | null), ref: MRef): $T;
  
  GetGlobal(info: (Meta | null), ref: MRef): $T;
  
  List(info: (Meta | null), items: ListItem[]): $T;
  
  Lazy(info: (Meta | null), expr: MExpr): $T;
  
  Force(info: (Meta | null), thunk: MExpr): $T;
  
  Map(info: (Meta | null), pairs: MapItem[]): $T;
  
  Assert(info: (Meta | null), expr: MExpr, atag: (string | null)): $T;
  
  Is(info: (Meta | null), expr: MExpr, typ: MRef): $T;
  
  IsVariant(info: (Meta | null), expr: MExpr, typ: MRef, variant: string): $T;
  
  Lambda(info: (Meta | null), params: string[], body: MExpr): $T;
  
  Apply(info: (Meta | null), callee: MExpr, args: MExpr[]): $T;
  
  Record(info: (Meta | null), fields: EPair[]): $T;
  
  Pipe(info: (Meta | null), left: MExpr, right: MExpr): $T;
  
  Foreign(info: (Meta | null), name: string, args: MExpr[]): $T;
  
  Repeat(info: (Meta | null), bindings: EBind[], body: MExpr): $T;
  
  Continue(info: (Meta | null), bindings: EPair[]): $T;
  
  Break(info: (Meta | null), value: MExpr): $T;
  
  Binary(info: (Meta | null), elements: EBinElement[]): $T;
  
      }

      export abstract class MExpr extends Node {
        abstract tag: "Const" | "Var" | "Self" | "Hole" | "Let" | "Block" | "If" | "Invoke" | "InvokeSelf" | "Primitive" | "IntrinsicEq" | "Project" | "New" | "NewPos" | "NewVariant" | "NewVariantPos" | "GetVariant" | "Static" | "GetGlobal" | "List" | "Lazy" | "Force" | "Map" | "Assert" | "Is" | "IsVariant" | "Lambda" | "Apply" | "Record" | "Pipe" | "Foreign" | "Repeat" | "Continue" | "Break" | "Binary";
        abstract match<$T>(p: $p_MExpr<$T>): $T;
        
  static get Const() {
    return $$MExpr$_Const
  }
  

  static get Var() {
    return $$MExpr$_Var
  }
  

  static get Self() {
    return $$MExpr$_Self
  }
  

  static get Hole() {
    return $$MExpr$_Hole
  }
  

  static get Let() {
    return $$MExpr$_Let
  }
  

  static get Block() {
    return $$MExpr$_Block
  }
  

  static get If() {
    return $$MExpr$_If
  }
  

  static get Invoke() {
    return $$MExpr$_Invoke
  }
  

  static get InvokeSelf() {
    return $$MExpr$_InvokeSelf
  }
  

  static get Primitive() {
    return $$MExpr$_Primitive
  }
  

  static get IntrinsicEq() {
    return $$MExpr$_IntrinsicEq
  }
  

  static get Project() {
    return $$MExpr$_Project
  }
  

  static get New() {
    return $$MExpr$_New
  }
  

  static get NewPos() {
    return $$MExpr$_NewPos
  }
  

  static get NewVariant() {
    return $$MExpr$_NewVariant
  }
  

  static get NewVariantPos() {
    return $$MExpr$_NewVariantPos
  }
  

  static get GetVariant() {
    return $$MExpr$_GetVariant
  }
  

  static get Static() {
    return $$MExpr$_Static
  }
  

  static get GetGlobal() {
    return $$MExpr$_GetGlobal
  }
  

  static get List() {
    return $$MExpr$_List
  }
  

  static get Lazy() {
    return $$MExpr$_Lazy
  }
  

  static get Force() {
    return $$MExpr$_Force
  }
  

  static get Map() {
    return $$MExpr$_Map
  }
  

  static get Assert() {
    return $$MExpr$_Assert
  }
  

  static get Is() {
    return $$MExpr$_Is
  }
  

  static get IsVariant() {
    return $$MExpr$_IsVariant
  }
  

  static get Lambda() {
    return $$MExpr$_Lambda
  }
  

  static get Apply() {
    return $$MExpr$_Apply
  }
  

  static get Record() {
    return $$MExpr$_Record
  }
  

  static get Pipe() {
    return $$MExpr$_Pipe
  }
  

  static get Foreign() {
    return $$MExpr$_Foreign
  }
  

  static get Repeat() {
    return $$MExpr$_Repeat
  }
  

  static get Continue() {
    return $$MExpr$_Continue
  }
  

  static get Break() {
    return $$MExpr$_Break
  }
  

  static get Binary() {
    return $$MExpr$_Binary
  }
  

        static has_instance(x: any) {
          return x instanceof MExpr;
        }
      }
 
      
  export class $$MExpr$_Const extends MExpr {
    readonly tag!: "Const";

    constructor(readonly info: (Meta | null), readonly value: MConst) {
      super();
      Object.defineProperty(this, "tag", { value: "Const" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MConst>(value, "MConst", MConst))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Const(this.info, this.value);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Const;
    }
  }
  


  export class $$MExpr$_Var extends MExpr {
    readonly tag!: "Var";

    constructor(readonly info: (Meta | null), readonly name: string) {
      super();
      Object.defineProperty(this, "tag", { value: "Var" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(name, "string", $is_type("string")))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Var(this.info, this.name);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Var;
    }
  }
  


  export class $$MExpr$_Self extends MExpr {
    readonly tag!: "Self";

    constructor(readonly info: (Meta | null)) {
      super();
      Object.defineProperty(this, "tag", { value: "Self" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta)))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Self(this.info);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Self;
    }
  }
  


  export class $$MExpr$_Hole extends MExpr {
    readonly tag!: "Hole";

    constructor(readonly info: (Meta | null)) {
      super();
      Object.defineProperty(this, "tag", { value: "Hole" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta)))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Hole(this.info);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Hole;
    }
  }
  


  export class $$MExpr$_Let extends MExpr {
    readonly tag!: "Let";

    constructor(readonly info: (Meta | null), readonly name: string, readonly typ: MType, readonly value: MExpr) {
      super();
      Object.defineProperty(this, "tag", { value: "Let" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(name, "string", $is_type("string"))); ($assert_type<MType>(typ, "MType", MType)); ($assert_type<MExpr>(value, "MExpr", MExpr))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Let(this.info, this.name, this.typ, this.value);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Let;
    }
  }
  


  export class $$MExpr$_Block extends MExpr {
    readonly tag!: "Block";

    constructor(readonly info: (Meta | null), readonly exprs: MExpr[]) {
      super();
      Object.defineProperty(this, "tag", { value: "Block" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MExpr[]>(exprs, "MExpr[]", $is_array(MExpr)))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Block(this.info, this.exprs);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Block;
    }
  }
  


  export class $$MExpr$_If extends MExpr {
    readonly tag!: "If";

    constructor(readonly info: (Meta | null), readonly clauses: MIfClause[]) {
      super();
      Object.defineProperty(this, "tag", { value: "If" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MIfClause[]>(clauses, "MIfClause[]", $is_array(MIfClause)))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.If(this.info, this.clauses);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_If;
    }
  }
  


  export class $$MExpr$_Invoke extends MExpr {
    readonly tag!: "Invoke";

    constructor(readonly info: (Meta | null), readonly name: string, readonly args: MInvokeArg[]) {
      super();
      Object.defineProperty(this, "tag", { value: "Invoke" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(name, "string", $is_type("string"))); ($assert_type<MInvokeArg[]>(args, "MInvokeArg[]", $is_array(MInvokeArg)))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Invoke(this.info, this.name, this.args);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Invoke;
    }
  }
  


  export class $$MExpr$_InvokeSelf extends MExpr {
    readonly tag!: "InvokeSelf";

    constructor(readonly info: (Meta | null), readonly name: string, readonly self: MExpr, readonly args: MInvokeArg[]) {
      super();
      Object.defineProperty(this, "tag", { value: "InvokeSelf" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(name, "string", $is_type("string"))); ($assert_type<MExpr>(self, "MExpr", MExpr)); ($assert_type<MInvokeArg[]>(args, "MInvokeArg[]", $is_array(MInvokeArg)))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.InvokeSelf(this.info, this.name, this.self, this.args);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_InvokeSelf;
    }
  }
  


  export class $$MExpr$_Primitive extends MExpr {
    readonly tag!: "Primitive";

    constructor(readonly info: (Meta | null), readonly name: string, readonly args: MExpr[]) {
      super();
      Object.defineProperty(this, "tag", { value: "Primitive" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(name, "string", $is_type("string"))); ($assert_type<MExpr[]>(args, "MExpr[]", $is_array(MExpr)))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Primitive(this.info, this.name, this.args);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Primitive;
    }
  }
  


  export class $$MExpr$_IntrinsicEq extends MExpr {
    readonly tag!: "IntrinsicEq";

    constructor(readonly info: (Meta | null), readonly left: MExpr, readonly right: MExpr) {
      super();
      Object.defineProperty(this, "tag", { value: "IntrinsicEq" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MExpr>(left, "MExpr", MExpr)); ($assert_type<MExpr>(right, "MExpr", MExpr))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.IntrinsicEq(this.info, this.left, this.right);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_IntrinsicEq;
    }
  }
  


  export class $$MExpr$_Project extends MExpr {
    readonly tag!: "Project";

    constructor(readonly info: (Meta | null), readonly value: MExpr, readonly field: string) {
      super();
      Object.defineProperty(this, "tag", { value: "Project" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MExpr>(value, "MExpr", MExpr)); ($assert_type<string>(field, "string", $is_type("string")))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Project(this.info, this.value, this.field);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Project;
    }
  }
  


  export class $$MExpr$_New extends MExpr {
    readonly tag!: "New";

    constructor(readonly info: (Meta | null), readonly ref: MRef, readonly fields: EPair[]) {
      super();
      Object.defineProperty(this, "tag", { value: "New" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MRef>(ref, "MRef", MRef)); ($assert_type<EPair[]>(fields, "EPair[]", $is_array(EPair)))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.New(this.info, this.ref, this.fields);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_New;
    }
  }
  


  export class $$MExpr$_NewPos extends MExpr {
    readonly tag!: "NewPos";

    constructor(readonly info: (Meta | null), readonly ref: MRef, readonly values: MExpr[]) {
      super();
      Object.defineProperty(this, "tag", { value: "NewPos" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MRef>(ref, "MRef", MRef)); ($assert_type<MExpr[]>(values, "MExpr[]", $is_array(MExpr)))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.NewPos(this.info, this.ref, this.values);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_NewPos;
    }
  }
  


  export class $$MExpr$_NewVariant extends MExpr {
    readonly tag!: "NewVariant";

    constructor(readonly info: (Meta | null), readonly ref: MRef, readonly variant: string, readonly fields: EPair[]) {
      super();
      Object.defineProperty(this, "tag", { value: "NewVariant" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MRef>(ref, "MRef", MRef)); ($assert_type<string>(variant, "string", $is_type("string"))); ($assert_type<EPair[]>(fields, "EPair[]", $is_array(EPair)))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.NewVariant(this.info, this.ref, this.variant, this.fields);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_NewVariant;
    }
  }
  


  export class $$MExpr$_NewVariantPos extends MExpr {
    readonly tag!: "NewVariantPos";

    constructor(readonly info: (Meta | null), readonly ref: MRef, readonly variant: string, readonly args: MExpr[]) {
      super();
      Object.defineProperty(this, "tag", { value: "NewVariantPos" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MRef>(ref, "MRef", MRef)); ($assert_type<string>(variant, "string", $is_type("string"))); ($assert_type<MExpr[]>(args, "MExpr[]", $is_array(MExpr)))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.NewVariantPos(this.info, this.ref, this.variant, this.args);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_NewVariantPos;
    }
  }
  


  export class $$MExpr$_GetVariant extends MExpr {
    readonly tag!: "GetVariant";

    constructor(readonly info: (Meta | null), readonly ref: MRef, readonly variant: string) {
      super();
      Object.defineProperty(this, "tag", { value: "GetVariant" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MRef>(ref, "MRef", MRef)); ($assert_type<string>(variant, "string", $is_type("string")))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.GetVariant(this.info, this.ref, this.variant);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_GetVariant;
    }
  }
  


  export class $$MExpr$_Static extends MExpr {
    readonly tag!: "Static";

    constructor(readonly info: (Meta | null), readonly ref: MRef) {
      super();
      Object.defineProperty(this, "tag", { value: "Static" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MRef>(ref, "MRef", MRef))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Static(this.info, this.ref);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Static;
    }
  }
  


  export class $$MExpr$_GetGlobal extends MExpr {
    readonly tag!: "GetGlobal";

    constructor(readonly info: (Meta | null), readonly ref: MRef) {
      super();
      Object.defineProperty(this, "tag", { value: "GetGlobal" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MRef>(ref, "MRef", MRef))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.GetGlobal(this.info, this.ref);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_GetGlobal;
    }
  }
  


  export class $$MExpr$_List extends MExpr {
    readonly tag!: "List";

    constructor(readonly info: (Meta | null), readonly items: ListItem[]) {
      super();
      Object.defineProperty(this, "tag", { value: "List" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<ListItem[]>(items, "ListItem[]", $is_array(ListItem)))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.List(this.info, this.items);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_List;
    }
  }
  


  export class $$MExpr$_Lazy extends MExpr {
    readonly tag!: "Lazy";

    constructor(readonly info: (Meta | null), readonly expr: MExpr) {
      super();
      Object.defineProperty(this, "tag", { value: "Lazy" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MExpr>(expr, "MExpr", MExpr))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Lazy(this.info, this.expr);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Lazy;
    }
  }
  


  export class $$MExpr$_Force extends MExpr {
    readonly tag!: "Force";

    constructor(readonly info: (Meta | null), readonly thunk: MExpr) {
      super();
      Object.defineProperty(this, "tag", { value: "Force" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MExpr>(thunk, "MExpr", MExpr))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Force(this.info, this.thunk);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Force;
    }
  }
  


  export class $$MExpr$_Map extends MExpr {
    readonly tag!: "Map";

    constructor(readonly info: (Meta | null), readonly pairs: MapItem[]) {
      super();
      Object.defineProperty(this, "tag", { value: "Map" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MapItem[]>(pairs, "MapItem[]", $is_array(MapItem)))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Map(this.info, this.pairs);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Map;
    }
  }
  


  export class $$MExpr$_Assert extends MExpr {
    readonly tag!: "Assert";

    constructor(readonly info: (Meta | null), readonly expr: MExpr, readonly atag: (string | null)) {
      super();
      Object.defineProperty(this, "tag", { value: "Assert" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MExpr>(expr, "MExpr", MExpr)); ($assert_type<(string | null)>(atag, "(string | null)", $is_maybe($is_type("string"))))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Assert(this.info, this.expr, this.atag);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Assert;
    }
  }
  


  export class $$MExpr$_Is extends MExpr {
    readonly tag!: "Is";

    constructor(readonly info: (Meta | null), readonly expr: MExpr, readonly typ: MRef) {
      super();
      Object.defineProperty(this, "tag", { value: "Is" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MExpr>(expr, "MExpr", MExpr)); ($assert_type<MRef>(typ, "MRef", MRef))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Is(this.info, this.expr, this.typ);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Is;
    }
  }
  


  export class $$MExpr$_IsVariant extends MExpr {
    readonly tag!: "IsVariant";

    constructor(readonly info: (Meta | null), readonly expr: MExpr, readonly typ: MRef, readonly variant: string) {
      super();
      Object.defineProperty(this, "tag", { value: "IsVariant" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MExpr>(expr, "MExpr", MExpr)); ($assert_type<MRef>(typ, "MRef", MRef)); ($assert_type<string>(variant, "string", $is_type("string")))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.IsVariant(this.info, this.expr, this.typ, this.variant);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_IsVariant;
    }
  }
  


  export class $$MExpr$_Lambda extends MExpr {
    readonly tag!: "Lambda";

    constructor(readonly info: (Meta | null), readonly params: string[], readonly body: MExpr) {
      super();
      Object.defineProperty(this, "tag", { value: "Lambda" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string[]>(params, "string[]", $is_array($is_type("string")))); ($assert_type<MExpr>(body, "MExpr", MExpr))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Lambda(this.info, this.params, this.body);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Lambda;
    }
  }
  


  export class $$MExpr$_Apply extends MExpr {
    readonly tag!: "Apply";

    constructor(readonly info: (Meta | null), readonly callee: MExpr, readonly args: MExpr[]) {
      super();
      Object.defineProperty(this, "tag", { value: "Apply" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MExpr>(callee, "MExpr", MExpr)); ($assert_type<MExpr[]>(args, "MExpr[]", $is_array(MExpr)))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Apply(this.info, this.callee, this.args);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Apply;
    }
  }
  


  export class $$MExpr$_Record extends MExpr {
    readonly tag!: "Record";

    constructor(readonly info: (Meta | null), readonly fields: EPair[]) {
      super();
      Object.defineProperty(this, "tag", { value: "Record" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<EPair[]>(fields, "EPair[]", $is_array(EPair)))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Record(this.info, this.fields);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Record;
    }
  }
  


  export class $$MExpr$_Pipe extends MExpr {
    readonly tag!: "Pipe";

    constructor(readonly info: (Meta | null), readonly left: MExpr, readonly right: MExpr) {
      super();
      Object.defineProperty(this, "tag", { value: "Pipe" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MExpr>(left, "MExpr", MExpr)); ($assert_type<MExpr>(right, "MExpr", MExpr))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Pipe(this.info, this.left, this.right);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Pipe;
    }
  }
  


  export class $$MExpr$_Foreign extends MExpr {
    readonly tag!: "Foreign";

    constructor(readonly info: (Meta | null), readonly name: string, readonly args: MExpr[]) {
      super();
      Object.defineProperty(this, "tag", { value: "Foreign" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(name, "string", $is_type("string"))); ($assert_type<MExpr[]>(args, "MExpr[]", $is_array(MExpr)))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Foreign(this.info, this.name, this.args);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Foreign;
    }
  }
  


  export class $$MExpr$_Repeat extends MExpr {
    readonly tag!: "Repeat";

    constructor(readonly info: (Meta | null), readonly bindings: EBind[], readonly body: MExpr) {
      super();
      Object.defineProperty(this, "tag", { value: "Repeat" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<EBind[]>(bindings, "EBind[]", $is_array(EBind))); ($assert_type<MExpr>(body, "MExpr", MExpr))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Repeat(this.info, this.bindings, this.body);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Repeat;
    }
  }
  


  export class $$MExpr$_Continue extends MExpr {
    readonly tag!: "Continue";

    constructor(readonly info: (Meta | null), readonly bindings: EPair[]) {
      super();
      Object.defineProperty(this, "tag", { value: "Continue" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<EPair[]>(bindings, "EPair[]", $is_array(EPair)))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Continue(this.info, this.bindings);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Continue;
    }
  }
  


  export class $$MExpr$_Break extends MExpr {
    readonly tag!: "Break";

    constructor(readonly info: (Meta | null), readonly value: MExpr) {
      super();
      Object.defineProperty(this, "tag", { value: "Break" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MExpr>(value, "MExpr", MExpr))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Break(this.info, this.value);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Break;
    }
  }
  


  export class $$MExpr$_Binary extends MExpr {
    readonly tag!: "Binary";

    constructor(readonly info: (Meta | null), readonly elements: EBinElement[]) {
      super();
      Object.defineProperty(this, "tag", { value: "Binary" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<EBinElement[]>(elements, "EBinElement[]", $is_array(EBinElement)))
    }

    match<$T>(p: $p_MExpr<$T>): $T {
      return p.Binary(this.info, this.elements);
    }

    static has_instance(x: any) {
      return x instanceof $$MExpr$_Binary;
    }
  }
  
      


  export class EBind extends Node {
    readonly tag!: "EBind"

    constructor(readonly name: string, readonly typ: MType, readonly value: MExpr) {
      super();
      Object.defineProperty(this, "tag", { value: "EBind" });
      ($assert_type<string>(name, "string", $is_type("string"))); ($assert_type<MType>(typ, "MType", MType)); ($assert_type<MExpr>(value, "MExpr", MExpr))
    }

    static has_instance(x: any) {
      return x instanceof EBind;
    }
  }
  


      type $p_ListItem<$T> = {
        
  Item(value: MExpr): $T;
  
  Spread(value: MExpr): $T;
  
      }

      export abstract class ListItem extends Node {
        abstract tag: "Item" | "Spread";
        abstract match<$T>(p: $p_ListItem<$T>): $T;
        
  static get Item() {
    return $$ListItem$_Item
  }
  

  static get Spread() {
    return $$ListItem$_Spread
  }
  

        static has_instance(x: any) {
          return x instanceof ListItem;
        }
      }
 
      
  export class $$ListItem$_Item extends ListItem {
    readonly tag!: "Item";

    constructor(readonly value: MExpr) {
      super();
      Object.defineProperty(this, "tag", { value: "Item" });
      ($assert_type<MExpr>(value, "MExpr", MExpr))
    }

    match<$T>(p: $p_ListItem<$T>): $T {
      return p.Item(this.value);
    }

    static has_instance(x: any) {
      return x instanceof $$ListItem$_Item;
    }
  }
  


  export class $$ListItem$_Spread extends ListItem {
    readonly tag!: "Spread";

    constructor(readonly value: MExpr) {
      super();
      Object.defineProperty(this, "tag", { value: "Spread" });
      ($assert_type<MExpr>(value, "MExpr", MExpr))
    }

    match<$T>(p: $p_ListItem<$T>): $T {
      return p.Spread(this.value);
    }

    static has_instance(x: any) {
      return x instanceof $$ListItem$_Spread;
    }
  }
  
      


      type $p_MapItem<$T> = {
        
  Pair(key: MExpr, value: MExpr): $T;
  
  Spread(value: MExpr): $T;
  
      }

      export abstract class MapItem extends Node {
        abstract tag: "Pair" | "Spread";
        abstract match<$T>(p: $p_MapItem<$T>): $T;
        
  static get Pair() {
    return $$MapItem$_Pair
  }
  

  static get Spread() {
    return $$MapItem$_Spread
  }
  

        static has_instance(x: any) {
          return x instanceof MapItem;
        }
      }
 
      
  export class $$MapItem$_Pair extends MapItem {
    readonly tag!: "Pair";

    constructor(readonly key: MExpr, readonly value: MExpr) {
      super();
      Object.defineProperty(this, "tag", { value: "Pair" });
      ($assert_type<MExpr>(key, "MExpr", MExpr)); ($assert_type<MExpr>(value, "MExpr", MExpr))
    }

    match<$T>(p: $p_MapItem<$T>): $T {
      return p.Pair(this.key, this.value);
    }

    static has_instance(x: any) {
      return x instanceof $$MapItem$_Pair;
    }
  }
  


  export class $$MapItem$_Spread extends MapItem {
    readonly tag!: "Spread";

    constructor(readonly value: MExpr) {
      super();
      Object.defineProperty(this, "tag", { value: "Spread" });
      ($assert_type<MExpr>(value, "MExpr", MExpr))
    }

    match<$T>(p: $p_MapItem<$T>): $T {
      return p.Spread(this.value);
    }

    static has_instance(x: any) {
      return x instanceof $$MapItem$_Spread;
    }
  }
  
      


      type $p_EBinElement<$T> = {
        
  Byte(value: bigint): $T;
  
  Int(value: bigint, size: bigint, endianess: Endianess, signed: Signed): $T;
  
      }

      export abstract class EBinElement extends Node {
        abstract tag: "Byte" | "Int";
        abstract match<$T>(p: $p_EBinElement<$T>): $T;
        
  static get Byte() {
    return $$EBinElement$_Byte
  }
  

  static get Int() {
    return $$EBinElement$_Int
  }
  

        static has_instance(x: any) {
          return x instanceof EBinElement;
        }
      }
 
      
  export class $$EBinElement$_Byte extends EBinElement {
    readonly tag!: "Byte";

    constructor(readonly value: bigint) {
      super();
      Object.defineProperty(this, "tag", { value: "Byte" });
      ($assert_type<bigint>(value, "bigint", $is_type("bigint")))
    }

    match<$T>(p: $p_EBinElement<$T>): $T {
      return p.Byte(this.value);
    }

    static has_instance(x: any) {
      return x instanceof $$EBinElement$_Byte;
    }
  }
  


  export class $$EBinElement$_Int extends EBinElement {
    readonly tag!: "Int";

    constructor(readonly value: bigint, readonly size: bigint, readonly endianess: Endianess, readonly signed: Signed) {
      super();
      Object.defineProperty(this, "tag", { value: "Int" });
      ($assert_type<bigint>(value, "bigint", $is_type("bigint"))); ($assert_type<bigint>(size, "bigint", $is_type("bigint"))); ($assert_type<Endianess>(endianess, "Endianess", Endianess)); ($assert_type<Signed>(signed, "Signed", Signed))
    }

    match<$T>(p: $p_EBinElement<$T>): $T {
      return p.Int(this.value, this.size, this.endianess, this.signed);
    }

    static has_instance(x: any) {
      return x instanceof $$EBinElement$_Int;
    }
  }
  
      


      type $p_Endianess<$T> = {
        
  Le(): $T;
  
  Be(): $T;
  
      }

      export abstract class Endianess extends Node {
        abstract tag: "Le" | "Be";
        abstract match<$T>(p: $p_Endianess<$T>): $T;
        
  static get Le() {
    return $$Endianess$_Le
  }
  

  static get Be() {
    return $$Endianess$_Be
  }
  

        static has_instance(x: any) {
          return x instanceof Endianess;
        }
      }
 
      
  export class $$Endianess$_Le extends Endianess {
    readonly tag!: "Le";

    constructor() {
      super();
      Object.defineProperty(this, "tag", { value: "Le" });
      
    }

    match<$T>(p: $p_Endianess<$T>): $T {
      return p.Le();
    }

    static has_instance(x: any) {
      return x instanceof $$Endianess$_Le;
    }
  }
  


  export class $$Endianess$_Be extends Endianess {
    readonly tag!: "Be";

    constructor() {
      super();
      Object.defineProperty(this, "tag", { value: "Be" });
      
    }

    match<$T>(p: $p_Endianess<$T>): $T {
      return p.Be();
    }

    static has_instance(x: any) {
      return x instanceof $$Endianess$_Be;
    }
  }
  
      


      type $p_Signed<$T> = {
        
  Signed(): $T;
  
  Unsigned(): $T;
  
      }

      export abstract class Signed extends Node {
        abstract tag: "Signed" | "Unsigned";
        abstract match<$T>(p: $p_Signed<$T>): $T;
        
  static get Signed() {
    return $$Signed$_Signed
  }
  

  static get Unsigned() {
    return $$Signed$_Unsigned
  }
  

        static has_instance(x: any) {
          return x instanceof Signed;
        }
      }
 
      
  export class $$Signed$_Signed extends Signed {
    readonly tag!: "Signed";

    constructor() {
      super();
      Object.defineProperty(this, "tag", { value: "Signed" });
      
    }

    match<$T>(p: $p_Signed<$T>): $T {
      return p.Signed();
    }

    static has_instance(x: any) {
      return x instanceof $$Signed$_Signed;
    }
  }
  


  export class $$Signed$_Unsigned extends Signed {
    readonly tag!: "Unsigned";

    constructor() {
      super();
      Object.defineProperty(this, "tag", { value: "Unsigned" });
      
    }

    match<$T>(p: $p_Signed<$T>): $T {
      return p.Unsigned();
    }

    static has_instance(x: any) {
      return x instanceof $$Signed$_Unsigned;
    }
  }
  
      


  export class EPair extends Node {
    readonly tag!: "EPair"

    constructor(readonly name: string, readonly value: MExpr) {
      super();
      Object.defineProperty(this, "tag", { value: "EPair" });
      ($assert_type<string>(name, "string", $is_type("string"))); ($assert_type<MExpr>(value, "MExpr", MExpr))
    }

    static has_instance(x: any) {
      return x instanceof EPair;
    }
  }
  


  export class MInvokeArg extends Node {
    readonly tag!: "MInvokeArg"

    constructor(readonly info: (Meta | null), readonly keyword: (string | null), readonly value: MExpr) {
      super();
      Object.defineProperty(this, "tag", { value: "MInvokeArg" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<(string | null)>(keyword, "(string | null)", $is_maybe($is_type("string")))); ($assert_type<MExpr>(value, "MExpr", MExpr))
    }

    static has_instance(x: any) {
      return x instanceof MInvokeArg;
    }
  }
  


  export class MIfClause extends Node {
    readonly tag!: "MIfClause"

    constructor(readonly info: (Meta | null), readonly guard: MExpr, readonly body: MExpr) {
      super();
      Object.defineProperty(this, "tag", { value: "MIfClause" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<MExpr>(guard, "MExpr", MExpr)); ($assert_type<MExpr>(body, "MExpr", MExpr))
    }

    static has_instance(x: any) {
      return x instanceof MIfClause;
    }
  }
  


      type $p_MConst<$T> = {
        
  True(info: (Meta | null)): $T;
  
  False(info: (Meta | null)): $T;
  
  Int32(info: (Meta | null), value: bigint): $T;
  
  Int(info: (Meta | null), value: bigint): $T;
  
  Float(info: (Meta | null), value: number): $T;
  
  Text(info: (Meta | null), value: string): $T;
  
  Nothing(info: (Meta | null)): $T;
  
      }

      export abstract class MConst extends Node {
        abstract tag: "True" | "False" | "Int32" | "Int" | "Float" | "Text" | "Nothing";
        abstract match<$T>(p: $p_MConst<$T>): $T;
        
  static get True() {
    return $$MConst$_True
  }
  

  static get False() {
    return $$MConst$_False
  }
  

  static get Int32() {
    return $$MConst$_Int32
  }
  

  static get Int() {
    return $$MConst$_Int
  }
  

  static get Float() {
    return $$MConst$_Float
  }
  

  static get Text() {
    return $$MConst$_Text
  }
  

  static get Nothing() {
    return $$MConst$_Nothing
  }
  

        static has_instance(x: any) {
          return x instanceof MConst;
        }
      }
 
      
  export class $$MConst$_True extends MConst {
    readonly tag!: "True";

    constructor(readonly info: (Meta | null)) {
      super();
      Object.defineProperty(this, "tag", { value: "True" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta)))
    }

    match<$T>(p: $p_MConst<$T>): $T {
      return p.True(this.info);
    }

    static has_instance(x: any) {
      return x instanceof $$MConst$_True;
    }
  }
  


  export class $$MConst$_False extends MConst {
    readonly tag!: "False";

    constructor(readonly info: (Meta | null)) {
      super();
      Object.defineProperty(this, "tag", { value: "False" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta)))
    }

    match<$T>(p: $p_MConst<$T>): $T {
      return p.False(this.info);
    }

    static has_instance(x: any) {
      return x instanceof $$MConst$_False;
    }
  }
  


  export class $$MConst$_Int32 extends MConst {
    readonly tag!: "Int32";

    constructor(readonly info: (Meta | null), readonly value: bigint) {
      super();
      Object.defineProperty(this, "tag", { value: "Int32" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<bigint>(value, "bigint", $is_type("bigint")))
    }

    match<$T>(p: $p_MConst<$T>): $T {
      return p.Int32(this.info, this.value);
    }

    static has_instance(x: any) {
      return x instanceof $$MConst$_Int32;
    }
  }
  


  export class $$MConst$_Int extends MConst {
    readonly tag!: "Int";

    constructor(readonly info: (Meta | null), readonly value: bigint) {
      super();
      Object.defineProperty(this, "tag", { value: "Int" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<bigint>(value, "bigint", $is_type("bigint")))
    }

    match<$T>(p: $p_MConst<$T>): $T {
      return p.Int(this.info, this.value);
    }

    static has_instance(x: any) {
      return x instanceof $$MConst$_Int;
    }
  }
  


  export class $$MConst$_Float extends MConst {
    readonly tag!: "Float";

    constructor(readonly info: (Meta | null), readonly value: number) {
      super();
      Object.defineProperty(this, "tag", { value: "Float" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<number>(value, "number", $is_type("number")))
    }

    match<$T>(p: $p_MConst<$T>): $T {
      return p.Float(this.info, this.value);
    }

    static has_instance(x: any) {
      return x instanceof $$MConst$_Float;
    }
  }
  


  export class $$MConst$_Text extends MConst {
    readonly tag!: "Text";

    constructor(readonly info: (Meta | null), readonly value: string) {
      super();
      Object.defineProperty(this, "tag", { value: "Text" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta))); ($assert_type<string>(value, "string", $is_type("string")))
    }

    match<$T>(p: $p_MConst<$T>): $T {
      return p.Text(this.info, this.value);
    }

    static has_instance(x: any) {
      return x instanceof $$MConst$_Text;
    }
  }
  


  export class $$MConst$_Nothing extends MConst {
    readonly tag!: "Nothing";

    constructor(readonly info: (Meta | null)) {
      super();
      Object.defineProperty(this, "tag", { value: "Nothing" });
      ($assert_type<(Meta | null)>(info, "(Meta | null)", $is_maybe(Meta)))
    }

    match<$T>(p: $p_MConst<$T>): $T {
      return p.Nothing(this.info);
    }

    static has_instance(x: any) {
      return x instanceof $$MConst$_Nothing;
    }
  }
  
      

  // == Grammar definition ============================================
  export const grammar = Ohm.grammar("\r\n  Meow_Grammar {\r\n    Module  = header Declaration* end  -- alt1\n\n\nDeclaration  = DFun  -- alt1\n | DDeclare  -- alt2\n | DStruct  -- alt3\n | DUnion  -- alt4\n | DDefine  -- alt5\n | DTest  -- alt6\n | DImport  -- alt7\n | DOpen  -- alt8\n | DTrait  -- alt9\n | DImplement  -- alt10\n\n\nDFun  = def_ DFPParam name \"(\" CommaList<DFParam> \")\" DFRet DFBody DFTest  -- alt1\n | def_ name \"(\" CommaList<DFParam> \")\" DFRet DFBody DFTest  -- alt2\n | def_ DFPParam any_binary_op DFPParam DFRet DFBody DFTest  -- alt3\n | def_ prefix_op DFPParam DFRet DFBody DFTest  -- alt4\n | def_ DFPParam as_ Ref DFBody DFTest  -- alt5\n\n\nDFBody  = \"=\" ESimple \";\"  -- alt1\n | EBlock  -- alt2\n\n\nDFTest  = test_ EBlock  -- alt1\n |   -- alt2\n\n\nDFParam  = atom variable \":\" Type  -- alt1\n | variable \":\" Type  -- alt2\n | atom \":\" Type  -- alt3\n | variable  -- alt4\n | Type  -- alt5\n\n\nDFPParam  = variable  -- alt1\n | Type  -- alt2\n | \"(\" variable \":\" Type \")\"  -- alt3\n\n\nDFRet  = \"->\" Type  -- alt1\n |   -- alt2\n\n\nDDefine  = def_ name \":\" Type \"=\" ESimple \";\"  -- alt1\n | def_ name \"=\" ESimple \";\"  -- alt2\n\n\nDTest  = test_ text EBlock  -- alt1\n\n\nDDeclare  = declare_ name \";\"  -- alt1\n\n\nDStruct  = struct_ name \"(\" CommaList<DSField> \")\" \";\"  -- alt1\n | singleton_ name \";\"  -- alt2\n\n\nDUnion  = union_ name \"{\" DUVariant+ \"}\"  -- alt1\n\n\nDUVariant  = name \"(\" CommaList<DSField> \")\" \";\"  -- alt1\n | name \";\"  -- alt2\n\n\nDSField  = name \":\" Type  -- alt1\n | name  -- alt2\n\n\nTTop  = Type  -- alt1\n\n\nType  = \"(\" CommaList<Type> \")\" \"->\" Type  -- alt1\n | TApply  -- alt2\n\n\nTApply  = TApply \"<\" CommaList1<TTop> \">\"  -- alt1\n | TPrim  -- alt2\n\n\nTPrim  = \"#\" \"(\" CommaList<TPair> \")\"  -- alt1\n | \"#\" Ref  -- alt2\n | \"&\" Ref  -- alt3\n | Ref \"..\" atom  -- alt4\n | Ref  -- alt5\n | variable  -- alt6\n | \"(\" TTop \")\"  -- alt7\n\n\nTPair  = name \":\" TTop  -- alt1\n\n\nRef  = foreign_name \"/\" Ns  -- alt1\n | Ns  -- alt2\n | nothing_  -- alt3\n\n\nNs  = NonemptyListOf<name, \".\">  -- alt1\n\n\nDTrait  = trait_ name \"{\" DTReq* \"}\"  -- alt1\n\n\nDImplement  = implement_ name for_ Type \"{\" DTFun+ \"}\"  -- alt1\n\n\nDTReq  = requires_ trait_ Ref  -- alt1\n | def_ Type name \"(\" CommaList<DTParam> \")\" DFRet \";\"  -- alt2\n | DTFun  -- alt3\n\n\nDTFun  = def_ Type name \"(\" CommaList<DFParam> \")\" DFRet DFBody DFTest  -- alt1\n\n\nDTParam  = name \":\" Type  -- alt1\n | Type  -- alt2\n\n\nDImport  = import_ foreign_ text \";\"  -- alt1\n | import_ text \";\"  -- alt2\n\n\nDOpen  = open_ package_ foreign_name as_ name \";\"  -- alt1\n | open_ package_ foreign_name \";\"  -- alt2\n\n\nExpr  = EBasic  -- alt1\n\n\nEBasic  = EBlock  -- alt1\n | EIf  -- alt2\n | ERepeat  -- alt3\n | ESimple  -- alt4\n\n\nEBlock  = \"{\" Exprs \"}\"  -- alt1\n\n\nETrail  = ESimple \";\"  -- alt1\n | EBasic  -- alt2\n\n\nExprs  = ETrail*  -- alt1\n\n\nExprs1  = ETrail+  -- alt1\n\n\nEIf  = when_ \"{\" EIClause+ \"}\"  -- alt1\n\n\nERepeat  = repeat_ with_ CommaList1<EBind> EBlock  -- alt1\n | repeat_ EBlock  -- alt2\n\n\nEBind  = variable \":\" Type \"=\" ETop  -- alt1\n | variable \"=\" ETop  -- alt2\n\n\nEIClause  = otherwise_ \"=>\" ETrail  -- alt1\n | ESimple \"=>\" ETrail  -- alt2\n\n\nESimple  = ELet  -- alt1\n | EAssert  -- alt2\n | EStructControl  -- alt3\n | ETop  -- alt4\n\n\nELet  = let_ variable \":\" Type \"=\" ETop  -- alt1\n | let_ variable \"=\" ETop  -- alt2\n\n\nEAssert  = assert_ ETop \"::\" name  -- alt1\n | assert_ ETop  -- alt2\n\n\nEStructControl  = continue_ with_ CommaList1<EVPair>  -- alt1\n | continue_  -- alt2\n | break_ with_ ETop  -- alt3\n | break_  -- alt4\n\n\nETop  = ELazy  -- alt1\n\n\nELazy  = lazy_ EInvokeInfix  -- alt1\n | EInvokeInfix  -- alt2\n\n\nEInvokeInfix  = EInvokeInfix1 assign_op EInvokeInfix1  -- alt1\n | EInvokeInfix1  -- alt2\n\n\nEInvokeInfix1  = EInvokeInfix1 imply_op EPipe  -- alt1\n | EPipe  -- alt2\n\n\nEPipe  = EPipe \"|>\" EInvokeInfix2  -- alt1\n | EInvokeInfix2  -- alt2\n\n\nEInvokeInfix2  = EInvokePre binary_op EInvokeInfix2  -- alt1\n | EInvokePre \"=:=\" EInvokeInfix2  -- alt2\n | EInvokePre as_ Ref  -- alt3\n | EInvokePre is_ Ref \"..\" atom  -- alt4\n | EInvokePre is_ Ref  -- alt5\n | EInvokePre  -- alt6\n\n\nEInvokePre  = prefix_op EInvokePost  -- alt1\n | EInvokePost  -- alt2\n\n\nEInvokePost  = EInvokePost name \"(\" CommaList<EInvokeArg> \")\"  -- alt1\n | name \"(\" CommaList<EInvokeArg> \")\"  -- alt2\n | primitive_ foreign_name \"(\" CommaList<ETop> \")\"  -- alt3\n | foreign_ foreign_name \"(\" CommaList<ETop> \")\"  -- alt4\n | EForce  -- alt5\n\n\nEVPair  = variable \"=\" ETop  -- alt1\n\n\nEForce  = force_ EApply  -- alt1\n | EApply  -- alt2\n\n\nEApply  = EApply \"(\" CommaList<ETop> \")\"  -- alt1\n | ENew  -- alt2\n\n\nEInvokeArg  = atom \":\" Expr  -- alt1\n | Expr  -- alt2\n\n\nENew  = new_ Ref \"..\" atom \"(\" CommaList<EPair> \")\"  -- alt1\n | new_ Ref \"..\" atom \"(\" CommaList<ETop> \")\"  -- alt2\n | new_ Ref \"(\" CommaList<EPair> \")\"  -- alt3\n | new_ Ref \"(\" CommaList<ETop> \")\"  -- alt4\n | Ref \"..\" atom  -- alt5\n | EMember  -- alt6\n\n\nEPair  = name \":\" Expr  -- alt1\n\n\nEMember  = EMember \".\" name  -- alt1\n | EPrim  -- alt2\n\n\nEPrim  = \"_\"  -- alt1\n | ERecord  -- alt2\n | \"#\" Ref  -- alt3\n | variable  -- alt4\n | Const  -- alt5\n | self_  -- alt6\n | Ref  -- alt7\n | EList  -- alt8\n | EBinary  -- alt9\n | EMap  -- alt10\n | ELambda  -- alt11\n | \"(\" Expr \")\"  -- alt12\n\n\nEList  = \"\\x5b\" CommaList<ELItem> \"\\x5d\"  -- alt1\n\n\nELItem  = \"...\" ETop  -- alt1\n | ETop  -- alt2\n\n\nEMap  = \"\\x5b\" \":\" \"\\x5d\"  -- alt1\n | \"\\x5b\" CommaList1<EMItem> \"\\x5d\"  -- alt2\n\n\nEMItem  = \"...\" ETop  -- alt1\n | ETop \":\" ETop  -- alt2\n\n\nELambda  = \"{\" CommaList1<variable> in_ LExprs \"}\"  -- alt1\n | \"{\" LExprs \"}\"  -- alt2\n\n\nLExprs  = Exprs1  -- alt1\n\n\nERecord  = \"#\" \"(\" CommaList<EPair> \")\"  -- alt1\n\n\nEBinary  = \"<<\" CommaList<EBinElement> \">>\"  -- alt1\n\n\nEBinElement  = integer \":\" Signed integer Endianess  -- alt1\n | integer  -- alt2\n\n\nEndianess  = \"le\"  -- alt1\n | \"be\"  -- alt2\n |   -- alt3\n\n\nSigned  = \"s\"  -- alt1\n | \"u\"  -- alt2\n |   -- alt3\n\n\nConst  = float #\"f\"  -- alt1\n | integer #\"n\"  -- alt2\n | integer  -- alt3\n | true_  -- alt4\n | false_  -- alt5\n | text  -- alt6\n | nothing_  -- alt7\n\n\nCommaList<T>  = ListOf<T, \",\"> \",\"?  -- alt1\n\n\nCommaList1<T>  = NonemptyListOf<T, \",\"> \",\"?  -- alt1\n\n\nheader (a file header) = \"%\" hs* \"meow/1\"  -- alt1\n\n\nline  = (~newline any)*  -- alt1\n\n\nhs  = \" \"  -- alt1\n | \"\\t\"  -- alt2\n\n\nnewline  = \"\\r\\n\"  -- alt1\n | \"\\r\"  -- alt2\n | \"\\n\"  -- alt3\n\n\ncomment (a comment) = \"//\" line  -- alt1\n\n\nspace += comment  -- alt1\n\n\natom_start  = \"a\"..\"z\"  -- alt1\n\n\natom_rest  = \"a\"..\"z\"  -- alt1\n | \"-\"  -- alt2\n | \"0\"..\"9\"  -- alt3\n\n\natom (an atom) = atom_start atom_rest* \"!\"?  -- alt1\n\n\nvariable_start  = \"A\"..\"Z\"  -- alt1\n\n\nvariable_rest  = \"A\"..\"Z\"  -- alt1\n | \"a\"..\"z\"  -- alt2\n | \"-\"  -- alt3\n | \"0\"..\"9\"  -- alt4\n\n\nvariable (a variable) = variable_start variable_rest*  -- alt1\n | \"_\"  -- alt2\n\n\nname (a name) = ~reserved atom  -- alt1\n | \"'\" atom  -- alt2\n\n\nforeign_name_char  = \"a\"..\"z\"  -- alt1\n | \"0\"..\"9\"  -- alt2\n | \"_\"  -- alt3\n | \"-\"  -- alt4\n\n\nforeign_name_part  = foreign_name_char+  -- alt1\n\n\nforeign_name (a foreign name) = nonemptyListOf<foreign_name_part, \".\">  -- alt1\n\n\nboolean  = t_boolean  -- alt1\n\n\nt_boolean  = true_  -- alt1\n | false_  -- alt2\n\n\ndec_digit  = \"0\"..\"9\"  -- alt1\n | \"_\"  -- alt2\n\n\nhex_digit  = \"0\"..\"9\"  -- alt1\n | \"a\"..\"f\"  -- alt2\n | \"A\"..\"F\"  -- alt3\n\n\nehex_digit  = hex_digit  -- alt1\n | \"_\"  -- alt2\n\n\nt_integer (an integer) = ~\"_\" \"0x\" ehex_digit+  -- alt1\n | ~\"_\" \"-\"? dec_digit+  -- alt2\n\n\ninteger  = t_integer  -- alt1\n\n\nt_float (a floating point number) = ~\"_\" \"-\"? dec_digit+ \".\" dec_digit+  -- alt1\n\n\nfloat  = t_float  -- alt1\n\n\ntext_character  = \"\\\\\" escape_sequence  -- alt1\n | ~(\"\\\"\" | \"\\x5b\" | \"\\x5d\") any  -- alt2\n\n\nescape_sequence  = \"u\" hex_digit hex_digit hex_digit hex_digit  -- alt1\n | \"x\" hex_digit hex_digit  -- alt2\n | any  -- alt3\n\n\nt_text (a text) = \"\\\"\" text_character* \"\\\"\"  -- alt1\n\n\ntext  = t_text  -- alt1\n\n\nany_binary_op (any binary operator) = assign_op  -- alt1\n | imply_op  -- alt2\n | binary_op  -- alt3\n\n\nbinary_op (a binary operator) = t_binary_op ~(symbol | atom_rest)  -- alt1\n | and_  -- alt2\n | or_  -- alt3\n\n\nassign_op (an assign operator) = \"<-\" ~(symbol | atom_rest)  -- alt1\n\n\nimply_op (an implication operator) = \"==>\" ~(symbol | atom_rest)  -- alt1\n\n\nsymbol  = \"+\"  -- alt1\n | \"-\"  -- alt2\n | \">\"  -- alt3\n | \"<\"  -- alt4\n | \"*\"  -- alt5\n | \"=\"  -- alt6\n | \"|\"  -- alt7\n | \"^\"  -- alt8\n | \"~\"  -- alt9\n | \"!\"  -- alt10\n | \"@\"  -- alt11\n | \"#\"  -- alt12\n | \"%\"  -- alt13\n | \"&\"  -- alt14\n | \"\\\\\"  -- alt15\n\n\nt_binary_op  = \"++\"  -- alt1\n | \"+\"  -- alt2\n | \"-\"  -- alt3\n | \"<<\"  -- alt4\n | \"<=\"  -- alt5\n | \"<\"  -- alt6\n | \">>>\"  -- alt7\n | \">>\"  -- alt8\n | \">=\"  -- alt9\n | \">\"  -- alt10\n | \"===\"  -- alt11\n | \"=/=\"  -- alt12\n | \"&\"  -- alt13\n | \"|\"  -- alt14\n | \"^\"  -- alt15\n | \"**\"  -- alt16\n | \"*\"  -- alt17\n | \"%\"  -- alt18\n | \"/\"  -- alt19\n | \"\\\\\"  -- alt20\n\n\nprefix_op  = not_  -- alt1\n | \"-\" ~(symbol | t_integer)  -- alt2\n | \"~\" ~(symbol | t_integer)  -- alt3\n\n\nkw<w>  = w ~(atom_rest | \":\")  -- alt1\n\n\ndef_  = kw<\"def\">  -- alt1\n\n\nwhen_  = kw<\"when\">  -- alt1\n\n\notherwise_  = kw<\"otherwise\">  -- alt1\n\n\nnothing_  = kw<\"nothing\">  -- alt1\n\n\nself_  = kw<\"self\">  -- alt1\n\n\nnot_  = kw<\"not\">  -- alt1\n\n\nand_  = kw<\"and\">  -- alt1\n\n\nor_  = kw<\"or\">  -- alt1\n\n\ntrue_  = kw<\"true\">  -- alt1\n\n\nfalse_  = kw<\"false\">  -- alt1\n\n\nnew_  = kw<\"new\">  -- alt1\n\n\nstruct_  = kw<\"struct\">  -- alt1\n\n\nlet_  = kw<\"let\">  -- alt1\n\n\nunion_  = kw<\"union\">  -- alt1\n\n\nlazy_  = kw<\"lazy\">  -- alt1\n\n\nforce_  = kw<\"force\">  -- alt1\n\n\nassert_  = kw<\"assert\">  -- alt1\n\n\ntest_  = kw<\"test\">  -- alt1\n\n\nas_  = kw<\"as\">  -- alt1\n\n\nis_  = kw<\"is\">  -- alt1\n\n\nprimitive_  = kw<\"primitive\">  -- alt1\n\n\nsingleton_  = kw<\"singleton\">  -- alt1\n\n\nimport_  = kw<\"import\">  -- alt1\n\n\nrequires_  = kw<\"requires\">  -- alt1\n\n\ntrait_  = kw<\"trait\">  -- alt1\n\n\nin_  = kw<\"in\">  -- alt1\n\n\nimplement_  = kw<\"implement\">  -- alt1\n\n\nfor_  = kw<\"for\">  -- alt1\n\n\nforeign_  = kw<\"foreign\">  -- alt1\n\n\nrepeat_  = kw<\"repeat\">  -- alt1\n\n\ncontinue_  = kw<\"continue\">  -- alt1\n\n\nbreak_  = kw<\"break\">  -- alt1\n\n\nwith_  = kw<\"with\">  -- alt1\n\n\nopen_  = kw<\"open\">  -- alt1\n\n\npackage_  = kw<\"package\">  -- alt1\n\n\ndeclare_  = kw<\"declare\">  -- alt1\n\n\nreserved  = def_  -- alt1\n | when_  -- alt2\n | otherwise_  -- alt3\n | nothing_  -- alt4\n | self_  -- alt5\n | is_  -- alt6\n | not_  -- alt7\n | and_  -- alt8\n | or_  -- alt9\n | true_  -- alt10\n | false_  -- alt11\n | new_  -- alt12\n | struct_  -- alt13\n | let_  -- alt14\n | union_  -- alt15\n | lazy_  -- alt16\n | force_  -- alt17\n | assert_  -- alt18\n | test_  -- alt19\n | as_  -- alt20\n | primitive_  -- alt21\n | singleton_  -- alt22\n | import_  -- alt23\n | requires_  -- alt24\n | trait_  -- alt25\n | in_  -- alt26\n | implement_  -- alt27\n | for_  -- alt28\n | foreign_  -- alt29\n | repeat_  -- alt30\n | continue_  -- alt31\n | break_  -- alt32\n | with_  -- alt33\n | open_  -- alt34\n | package_  -- alt35\n | declare_  -- alt36\n\n\nRepl  = Declaration  -- alt1\n | Expr \";\"?  -- alt2\n | \":\" ReplCommand  -- alt3\n\n\nReplCommand  = kw<\"exit\">  -- alt1\n | kw<\"code\"> Declaration  -- alt2\n | kw<\"code\"> Expr \";\"?  -- alt3\n\r\n  }\r\n  ")

  // == Parsing =======================================================
  export function parse(source: string, rule: string): Result<MModule> {
    const result = grammar.match(source, rule);
    if (result.failed()) {
      return { ok: false, error: result.message as string };
    } else {
      const ast = toAst(result);
      ($assert_type<MModule>(ast, "MModule", MModule))
      return { ok: true, value: ast };
    }
  }

  export const semantics = grammar.createSemantics();
  export const toAstVisitor = (
  { 
    
  _terminal(this: Ohm.Node): any {
    return this.primitiveValue
  },

  _iter(this: any, children: Ohm.Node): any {
    if (this._node.isOptional()) {
      if (this.numChildren === 0) {
        return null;
      } else {
        return children[0].toAST();
      }
    }
    return children.map((x: any) => x.toAST());
  },

  nonemptyListOf(first: Ohm.Node, _: Ohm.Node, rest: Ohm.Node): any {
    return [first.toAST(), ...rest.toAST()];
  },

  emptyListOf(): any {
    return [];
  },

  NonemptyListOf(first: Ohm.Node, _: Ohm.Node, rest: Ohm.Node): any {
    return [first.toAST(), ...rest.toAST()];
  },

  EmptyListOf(): any {
    return [];
  },
  
    
  Module(x: Ohm.Node): any {
    return x.toAST();
  },
  
    Module_alt1(this: Ohm.Node, _1: Ohm.Node, xs$0: Ohm.Node, _3: Ohm.Node): any {
      ; const xs = xs$0.toAST(); 
      return (new (MModule)($meta(this), xs))
    },
    
  Declaration(x: Ohm.Node): any {
    return x.toAST();
  },
  
    Declaration_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    Declaration_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    Declaration_alt3(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    Declaration_alt4(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    Declaration_alt5(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    Declaration_alt6(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    Declaration_alt7(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    Declaration_alt8(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    Declaration_alt9(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    Declaration_alt10(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  DFun(x: Ohm.Node): any {
    return x.toAST();
  },
  
    DFun_alt1(this: Ohm.Node, _1: Ohm.Node, p$0: Ohm.Node, n$0: Ohm.Node, _4: Ohm.Node, ps$0: Ohm.Node, _6: Ohm.Node, r$0: Ohm.Node, e$0: Ohm.Node, t$0: Ohm.Node): any {
      ; const p = p$0.toAST(); const n = n$0.toAST(); ; const ps = ps$0.toAST(); ; const r = r$0.toAST(); const e = e$0.toAST(); const t = t$0.toAST()
      return (new (((MDecl).SFun))($meta(this), n, p, ps, r, e, t))
    },
    
    DFun_alt2(this: Ohm.Node, _1: Ohm.Node, n$0: Ohm.Node, _3: Ohm.Node, ps$0: Ohm.Node, _5: Ohm.Node, r$0: Ohm.Node, e$0: Ohm.Node, t$0: Ohm.Node): any {
      ; const n = n$0.toAST(); ; const ps = ps$0.toAST(); ; const r = r$0.toAST(); const e = e$0.toAST(); const t = t$0.toAST()
      return (new (((MDecl).Fun))($meta(this), n, ps, r, e, t))
    },
    
    DFun_alt3(this: Ohm.Node, _1: Ohm.Node, l$0: Ohm.Node, op$0: Ohm.Node, r$0: Ohm.Node, rt$0: Ohm.Node, e$0: Ohm.Node, t$0: Ohm.Node): any {
      ; const l = l$0.toAST(); const op = op$0.toAST(); const r = r$0.toAST(); const rt = rt$0.toAST(); const e = e$0.toAST(); const t = t$0.toAST()
      return (new (((MDecl).Fun))($meta(this), op, [l, r], rt, e, t))
    },
    
    DFun_alt4(this: Ohm.Node, _1: Ohm.Node, op$0: Ohm.Node, l$0: Ohm.Node, rt$0: Ohm.Node, e$0: Ohm.Node, t$0: Ohm.Node): any {
      ; const op = op$0.toAST(); const l = l$0.toAST(); const rt = rt$0.toAST(); const e = e$0.toAST(); const t = t$0.toAST()
      return (new (((MDecl).Fun))($meta(this), op, [l], rt, e, t))
    },
    
    DFun_alt5(this: Ohm.Node, _1: Ohm.Node, p$0: Ohm.Node, op$0: Ohm.Node, r$0: Ohm.Node, e$0: Ohm.Node, t$0: Ohm.Node): any {
      ; const p = p$0.toAST(); const op = op$0.toAST(); const r = r$0.toAST(); const e = e$0.toAST(); const t = t$0.toAST()
      return (new (((MDecl).Fun))($meta(this), op, [p, (new (MParam)($meta(this), null, null, (new (((MType).Static))($meta(this), r))))], (new (((MType).Ref))($meta(this), r)), e, t))
    },
    
  DFBody(x: Ohm.Node): any {
    return x.toAST();
  },
  
    DFBody_alt1(this: Ohm.Node, _1: Ohm.Node, e$0: Ohm.Node, _3: Ohm.Node): any {
      ; const e = e$0.toAST(); 
      return e
    },
    
    DFBody_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  DFTest(x: Ohm.Node): any {
    return x.toAST();
  },
  
    DFTest_alt1(this: Ohm.Node, _1: Ohm.Node, e$0: Ohm.Node): any {
      ; const e = e$0.toAST()
      return e
    },
    
    DFTest_alt2(this: Ohm.Node, ): any {
      
      return null
    },
    
  DFParam(x: Ohm.Node): any {
    return x.toAST();
  },
  
    DFParam_alt1(this: Ohm.Node, k$0: Ohm.Node, n$0: Ohm.Node, _3: Ohm.Node, t$0: Ohm.Node): any {
      const k = k$0.toAST(); const n = n$0.toAST(); ; const t = t$0.toAST()
      return (new (MParam)($meta(this), k, n, t))
    },
    
    DFParam_alt2(this: Ohm.Node, n$0: Ohm.Node, _2: Ohm.Node, t$0: Ohm.Node): any {
      const n = n$0.toAST(); ; const t = t$0.toAST()
      return (new (MParam)($meta(this), null, n, t))
    },
    
    DFParam_alt3(this: Ohm.Node, k$0: Ohm.Node, _2: Ohm.Node, t$0: Ohm.Node): any {
      const k = k$0.toAST(); ; const t = t$0.toAST()
      return (new (MParam)($meta(this), k, null, t))
    },
    
    DFParam_alt4(this: Ohm.Node, n$0: Ohm.Node): any {
      const n = n$0.toAST()
      return (new (MParam)($meta(this), null, n, (new (((MType).Infer))($meta(this)))))
    },
    
    DFParam_alt5(this: Ohm.Node, t$0: Ohm.Node): any {
      const t = t$0.toAST()
      return (new (MParam)($meta(this), null, null, t))
    },
    
  DFPParam(x: Ohm.Node): any {
    return x.toAST();
  },
  
    DFPParam_alt1(this: Ohm.Node, n$0: Ohm.Node): any {
      const n = n$0.toAST()
      return (new (MParam)($meta(this), null, n, (new (((MType).Infer))($meta(this)))))
    },
    
    DFPParam_alt2(this: Ohm.Node, t$0: Ohm.Node): any {
      const t = t$0.toAST()
      return (new (MParam)($meta(this), null, null, t))
    },
    
    DFPParam_alt3(this: Ohm.Node, _1: Ohm.Node, n$0: Ohm.Node, _3: Ohm.Node, t$0: Ohm.Node, _5: Ohm.Node): any {
      ; const n = n$0.toAST(); ; const t = t$0.toAST(); 
      return (new (MParam)($meta(this), null, n, t))
    },
    
  DFRet(x: Ohm.Node): any {
    return x.toAST();
  },
  
    DFRet_alt1(this: Ohm.Node, _1: Ohm.Node, t$0: Ohm.Node): any {
      ; const t = t$0.toAST()
      return t
    },
    
    DFRet_alt2(this: Ohm.Node, ): any {
      
      return (new (((MType).Infer))($meta(this)))
    },
    
  DDefine(x: Ohm.Node): any {
    return x.toAST();
  },
  
    DDefine_alt1(this: Ohm.Node, _1: Ohm.Node, n$0: Ohm.Node, _3: Ohm.Node, t$0: Ohm.Node, _5: Ohm.Node, e$0: Ohm.Node, _7: Ohm.Node): any {
      ; const n = n$0.toAST(); ; const t = t$0.toAST(); ; const e = e$0.toAST(); 
      return (new (((MDecl).Def))($meta(this), n, t, e))
    },
    
    DDefine_alt2(this: Ohm.Node, _1: Ohm.Node, n$0: Ohm.Node, _3: Ohm.Node, e$0: Ohm.Node, _5: Ohm.Node): any {
      ; const n = n$0.toAST(); ; const e = e$0.toAST(); 
      return (new (((MDecl).Def))($meta(this), n, (new (((MType).Infer))($meta(this))), e))
    },
    
  DTest(x: Ohm.Node): any {
    return x.toAST();
  },
  
    DTest_alt1(this: Ohm.Node, _1: Ohm.Node, t$0: Ohm.Node, e$0: Ohm.Node): any {
      ; const t = t$0.toAST(); const e = e$0.toAST()
      return (new (((MDecl).Test))($meta(this), t, e))
    },
    
  DDeclare(x: Ohm.Node): any {
    return x.toAST();
  },
  
    DDeclare_alt1(this: Ohm.Node, _1: Ohm.Node, n$0: Ohm.Node, _3: Ohm.Node): any {
      ; const n = n$0.toAST(); 
      return (new (((MDecl).DeclareType))($meta(this), n))
    },
    
  DStruct(x: Ohm.Node): any {
    return x.toAST();
  },
  
    DStruct_alt1(this: Ohm.Node, _1: Ohm.Node, n$0: Ohm.Node, _3: Ohm.Node, xs$0: Ohm.Node, _5: Ohm.Node, _6: Ohm.Node): any {
      ; const n = n$0.toAST(); ; const xs = xs$0.toAST(); ; 
      return (new (((MDecl).Struct))($meta(this), n, xs))
    },
    
    DStruct_alt2(this: Ohm.Node, _1: Ohm.Node, n$0: Ohm.Node, _3: Ohm.Node): any {
      ; const n = n$0.toAST(); 
      return (new (((MDecl).Singleton))($meta(this), n))
    },
    
  DUnion(x: Ohm.Node): any {
    return x.toAST();
  },
  
    DUnion_alt1(this: Ohm.Node, _1: Ohm.Node, n$0: Ohm.Node, _3: Ohm.Node, xs$0: Ohm.Node, _5: Ohm.Node): any {
      ; const n = n$0.toAST(); ; const xs = xs$0.toAST(); 
      return (new (((MDecl).Union))($meta(this), n, xs))
    },
    
  DUVariant(x: Ohm.Node): any {
    return x.toAST();
  },
  
    DUVariant_alt1(this: Ohm.Node, n$0: Ohm.Node, _2: Ohm.Node, xs$0: Ohm.Node, _4: Ohm.Node, _5: Ohm.Node): any {
      const n = n$0.toAST(); ; const xs = xs$0.toAST(); ; 
      return (new (Variant)($meta(this), n, xs))
    },
    
    DUVariant_alt2(this: Ohm.Node, n$0: Ohm.Node, _2: Ohm.Node): any {
      const n = n$0.toAST(); 
      return (new (Variant)($meta(this), n, null))
    },
    
  DSField(x: Ohm.Node): any {
    return x.toAST();
  },
  
    DSField_alt1(this: Ohm.Node, n$0: Ohm.Node, _2: Ohm.Node, t$0: Ohm.Node): any {
      const n = n$0.toAST(); ; const t = t$0.toAST()
      return (new (Field)($meta(this), n, t))
    },
    
    DSField_alt2(this: Ohm.Node, n$0: Ohm.Node): any {
      const n = n$0.toAST()
      return (new (Field)($meta(this), n, (new (((MType).Infer))($meta(this)))))
    },
    
  TTop(x: Ohm.Node): any {
    return x.toAST();
  },
  
    TTop_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  Type(x: Ohm.Node): any {
    return x.toAST();
  },
  
    Type_alt1(this: Ohm.Node, _1: Ohm.Node, ts$0: Ohm.Node, _3: Ohm.Node, _4: Ohm.Node, r$0: Ohm.Node): any {
      ; const ts = ts$0.toAST(); ; ; const r = r$0.toAST()
      return (new (((MType).Fun))($meta(this), ts, r))
    },
    
    Type_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  TApply(x: Ohm.Node): any {
    return x.toAST();
  },
  
    TApply_alt1(this: Ohm.Node, t$0: Ohm.Node, _2: Ohm.Node, _3: Ohm.Node, _4: Ohm.Node): any {
      const t = t$0.toAST(); ; ; 
      return t
    },
    
    TApply_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  TPrim(x: Ohm.Node): any {
    return x.toAST();
  },
  
    TPrim_alt1(this: Ohm.Node, _1: Ohm.Node, _2: Ohm.Node, xs$0: Ohm.Node, _4: Ohm.Node): any {
      ; ; const xs = xs$0.toAST(); 
      return (new (((MType).Record))($meta(this), xs))
    },
    
    TPrim_alt2(this: Ohm.Node, _1: Ohm.Node, x$0: Ohm.Node): any {
      ; const x = x$0.toAST()
      return (new (((MType).Static))($meta(this), x))
    },
    
    TPrim_alt3(this: Ohm.Node, _1: Ohm.Node, x$0: Ohm.Node): any {
      ; const x = x$0.toAST()
      return (new (((MType).Trait))($meta(this), x))
    },
    
    TPrim_alt4(this: Ohm.Node, x$0: Ohm.Node, _2: Ohm.Node, v$0: Ohm.Node): any {
      const x = x$0.toAST(); ; const v = v$0.toAST()
      return (new (((MType).Variant))($meta(this), x, v))
    },
    
    TPrim_alt5(this: Ohm.Node, x$0: Ohm.Node): any {
      const x = x$0.toAST()
      return (new (((MType).Ref))($meta(this), x))
    },
    
    TPrim_alt6(this: Ohm.Node, n$0: Ohm.Node): any {
      const n = n$0.toAST()
      return (new (((MType).Var))($meta(this), n))
    },
    
    TPrim_alt7(this: Ohm.Node, _1: Ohm.Node, t$0: Ohm.Node, _3: Ohm.Node): any {
      ; const t = t$0.toAST(); 
      return t
    },
    
  TPair(x: Ohm.Node): any {
    return x.toAST();
  },
  
    TPair_alt1(this: Ohm.Node, k$0: Ohm.Node, _2: Ohm.Node, t$0: Ohm.Node): any {
      const k = k$0.toAST(); ; const t = t$0.toAST()
      return (new (TPair)(k, t))
    },
    
  Ref(x: Ohm.Node): any {
    return x.toAST();
  },
  
    Ref_alt1(this: Ohm.Node, pkg$0: Ohm.Node, _2: Ohm.Node, n$0: Ohm.Node): any {
      const pkg = pkg$0.toAST(); ; const n = n$0.toAST()
      return (new (((MRef).Qualified))($meta(this), pkg, n))
    },
    
    Ref_alt2(this: Ohm.Node, n$0: Ohm.Node): any {
      const n = n$0.toAST()
      return (new (((MRef).Named))($meta(this), n))
    },
    
    Ref_alt3(this: Ohm.Node, n$0: Ohm.Node): any {
      const n = n$0.toAST()
      return (new (((MRef).Named))($meta(this), [n]))
    },
    
  Ns(x: Ohm.Node): any {
    return x.toAST();
  },
  
    Ns_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  DTrait(x: Ohm.Node): any {
    return x.toAST();
  },
  
    DTrait_alt1(this: Ohm.Node, _1: Ohm.Node, n$0: Ohm.Node, _3: Ohm.Node, xs$0: Ohm.Node, _5: Ohm.Node): any {
      ; const n = n$0.toAST(); ; const xs = xs$0.toAST(); 
      return (new (((MDecl).Trait))($meta(this), n, xs))
    },
    
  DImplement(x: Ohm.Node): any {
    return x.toAST();
  },
  
    DImplement_alt1(this: Ohm.Node, _1: Ohm.Node, n$0: Ohm.Node, _3: Ohm.Node, t$0: Ohm.Node, _5: Ohm.Node, xs$0: Ohm.Node, _7: Ohm.Node): any {
      ; const n = n$0.toAST(); ; const t = t$0.toAST(); ; const xs = xs$0.toAST(); 
      return (new (((MDecl).Implement))($meta(this), n, t, xs))
    },
    
  DTReq(x: Ohm.Node): any {
    return x.toAST();
  },
  
    DTReq_alt1(this: Ohm.Node, _1: Ohm.Node, _2: Ohm.Node, _3: Ohm.Node): any {
      ; ; 
      return null
    },
    
    DTReq_alt2(this: Ohm.Node, _1: Ohm.Node, _2: Ohm.Node, n$0: Ohm.Node, _4: Ohm.Node, xs$0: Ohm.Node, _6: Ohm.Node, _7: Ohm.Node, _8: Ohm.Node): any {
      ; ; const n = n$0.toAST(); ; const xs = xs$0.toAST(); ; ; 
      return (new (((TraitReq).Required))(n, xs))
    },
    
    DTReq_alt3(this: Ohm.Node, x$0: Ohm.Node): any {
      const x = x$0.toAST()
      return (new (((TraitReq).Provided))(x))
    },
    
  DTFun(x: Ohm.Node): any {
    return x.toAST();
  },
  
    DTFun_alt1(this: Ohm.Node, _1: Ohm.Node, p$0: Ohm.Node, n$0: Ohm.Node, _4: Ohm.Node, ps$0: Ohm.Node, _6: Ohm.Node, r$0: Ohm.Node, e$0: Ohm.Node, t$0: Ohm.Node): any {
      ; const p = p$0.toAST(); const n = n$0.toAST(); ; const ps = ps$0.toAST(); ; const r = r$0.toAST(); const e = e$0.toAST(); const t = t$0.toAST()
      return (new (((MDecl).SFun))($meta(this), n, (new (MParam)($meta(this), null, null, p)), ps, r, e, t))
    },
    
  DTParam(x: Ohm.Node): any {
    return x.toAST();
  },
  
    DTParam_alt1(this: Ohm.Node, k$0: Ohm.Node, _2: Ohm.Node, t$0: Ohm.Node): any {
      const k = k$0.toAST(); ; const t = t$0.toAST()
      return (new (MParam)($meta(this), k, null, t))
    },
    
    DTParam_alt2(this: Ohm.Node, t$0: Ohm.Node): any {
      const t = t$0.toAST()
      return (new (MParam)($meta(this), null, null, t))
    },
    
  DImport(x: Ohm.Node): any {
    return x.toAST();
  },
  
    DImport_alt1(this: Ohm.Node, _1: Ohm.Node, _2: Ohm.Node, t$0: Ohm.Node, _4: Ohm.Node): any {
      ; ; const t = t$0.toAST(); 
      return (new (((MDecl).ImportForeign))($meta(this), t))
    },
    
    DImport_alt2(this: Ohm.Node, _1: Ohm.Node, t$0: Ohm.Node, _3: Ohm.Node): any {
      ; const t = t$0.toAST(); 
      return (new (((MDecl).Import))($meta(this), t))
    },
    
  DOpen(x: Ohm.Node): any {
    return x.toAST();
  },
  
    DOpen_alt1(this: Ohm.Node, _1: Ohm.Node, _2: Ohm.Node, n$0: Ohm.Node, _4: Ohm.Node, a$0: Ohm.Node, _6: Ohm.Node): any {
      ; ; const n = n$0.toAST(); ; const a = a$0.toAST(); 
      return (new (((MDecl).OpenPkg))($meta(this), n, a))
    },
    
    DOpen_alt2(this: Ohm.Node, _1: Ohm.Node, _2: Ohm.Node, n$0: Ohm.Node, _4: Ohm.Node): any {
      ; ; const n = n$0.toAST(); 
      return (new (((MDecl).OpenPkg))($meta(this), n, null))
    },
    
  Expr(x: Ohm.Node): any {
    return x.toAST();
  },
  
    Expr_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  EBasic(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EBasic_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    EBasic_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    EBasic_alt3(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    EBasic_alt4(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  EBlock(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EBlock_alt1(this: Ohm.Node, _1: Ohm.Node, xs$0: Ohm.Node, _3: Ohm.Node): any {
      ; const xs = xs$0.toAST(); 
      return (new (((MExpr).Block))($meta(this), xs))
    },
    
  ETrail(x: Ohm.Node): any {
    return x.toAST();
  },
  
    ETrail_alt1(this: Ohm.Node, x$0: Ohm.Node, _2: Ohm.Node): any {
      const x = x$0.toAST(); 
      return x
    },
    
    ETrail_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  Exprs(x: Ohm.Node): any {
    return x.toAST();
  },
  
    Exprs_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  Exprs1(x: Ohm.Node): any {
    return x.toAST();
  },
  
    Exprs1_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  EIf(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EIf_alt1(this: Ohm.Node, _1: Ohm.Node, _2: Ohm.Node, xs$0: Ohm.Node, _4: Ohm.Node): any {
      ; ; const xs = xs$0.toAST(); 
      return (new (((MExpr).If))($meta(this), xs))
    },
    
  ERepeat(x: Ohm.Node): any {
    return x.toAST();
  },
  
    ERepeat_alt1(this: Ohm.Node, _1: Ohm.Node, _2: Ohm.Node, xs$0: Ohm.Node, e$0: Ohm.Node): any {
      ; ; const xs = xs$0.toAST(); const e = e$0.toAST()
      return (new (((MExpr).Repeat))($meta(this), xs, e))
    },
    
    ERepeat_alt2(this: Ohm.Node, _1: Ohm.Node, e$0: Ohm.Node): any {
      ; const e = e$0.toAST()
      return (new (((MExpr).Repeat))($meta(this), [], e))
    },
    
  EBind(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EBind_alt1(this: Ohm.Node, n$0: Ohm.Node, _2: Ohm.Node, t$0: Ohm.Node, _4: Ohm.Node, e$0: Ohm.Node): any {
      const n = n$0.toAST(); ; const t = t$0.toAST(); ; const e = e$0.toAST()
      return (new (EBind)(n, t, e))
    },
    
    EBind_alt2(this: Ohm.Node, n$0: Ohm.Node, _2: Ohm.Node, e$0: Ohm.Node): any {
      const n = n$0.toAST(); ; const e = e$0.toAST()
      return (new (EBind)(n, (new (((MType).Infer))($meta(this))), e))
    },
    
  EIClause(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EIClause_alt1(this: Ohm.Node, _1: Ohm.Node, _2: Ohm.Node, b$0: Ohm.Node): any {
      ; ; const b = b$0.toAST()
      return (new (MIfClause)($meta(this), (new (((MExpr).Const))($meta(this), (new (((MConst).True))($meta(this))))), b))
    },
    
    EIClause_alt2(this: Ohm.Node, e$0: Ohm.Node, _2: Ohm.Node, b$0: Ohm.Node): any {
      const e = e$0.toAST(); ; const b = b$0.toAST()
      return (new (MIfClause)($meta(this), e, b))
    },
    
  ESimple(x: Ohm.Node): any {
    return x.toAST();
  },
  
    ESimple_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    ESimple_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    ESimple_alt3(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    ESimple_alt4(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  ELet(x: Ohm.Node): any {
    return x.toAST();
  },
  
    ELet_alt1(this: Ohm.Node, _1: Ohm.Node, n$0: Ohm.Node, _3: Ohm.Node, t$0: Ohm.Node, _5: Ohm.Node, v$0: Ohm.Node): any {
      ; const n = n$0.toAST(); ; const t = t$0.toAST(); ; const v = v$0.toAST()
      return (new (((MExpr).Let))($meta(this), n, t, v))
    },
    
    ELet_alt2(this: Ohm.Node, _1: Ohm.Node, n$0: Ohm.Node, _3: Ohm.Node, v$0: Ohm.Node): any {
      ; const n = n$0.toAST(); ; const v = v$0.toAST()
      return (new (((MExpr).Let))($meta(this), n, (new (((MType).Infer))($meta(this))), v))
    },
    
  EAssert(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EAssert_alt1(this: Ohm.Node, _1: Ohm.Node, e$0: Ohm.Node, _3: Ohm.Node, t$0: Ohm.Node): any {
      ; const e = e$0.toAST(); ; const t = t$0.toAST()
      return (new (((MExpr).Assert))($meta(this), e, t))
    },
    
    EAssert_alt2(this: Ohm.Node, _1: Ohm.Node, e$0: Ohm.Node): any {
      ; const e = e$0.toAST()
      return (new (((MExpr).Assert))($meta(this), e, null))
    },
    
  EStructControl(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EStructControl_alt1(this: Ohm.Node, _1: Ohm.Node, _2: Ohm.Node, xs$0: Ohm.Node): any {
      ; ; const xs = xs$0.toAST()
      return (new (((MExpr).Continue))($meta(this), xs))
    },
    
    EStructControl_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      
      return (new (((MExpr).Continue))($meta(this), []))
    },
    
    EStructControl_alt3(this: Ohm.Node, _1: Ohm.Node, _2: Ohm.Node, x$0: Ohm.Node): any {
      ; ; const x = x$0.toAST()
      return (new (((MExpr).Break))($meta(this), x))
    },
    
    EStructControl_alt4(this: Ohm.Node, _1: Ohm.Node): any {
      
      return (new (((MExpr).Break))($meta(this), (new (((MExpr).Const))($meta(this), (new (((MConst).Nothing))($meta(this)))))))
    },
    
  ETop(x: Ohm.Node): any {
    return x.toAST();
  },
  
    ETop_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  ELazy(x: Ohm.Node): any {
    return x.toAST();
  },
  
    ELazy_alt1(this: Ohm.Node, _1: Ohm.Node, e$0: Ohm.Node): any {
      ; const e = e$0.toAST()
      return (new (((MExpr).Lazy))($meta(this), e))
    },
    
    ELazy_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  EInvokeInfix(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EInvokeInfix_alt1(this: Ohm.Node, l$0: Ohm.Node, op$0: Ohm.Node, r$0: Ohm.Node): any {
      const l = l$0.toAST(); const op = op$0.toAST(); const r = r$0.toAST()
      return (new (((MExpr).Invoke))($meta(this), op, [(new (MInvokeArg)($meta(this), null, l)), (new (MInvokeArg)($meta(this), null, r))]))
    },
    
    EInvokeInfix_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  EInvokeInfix1(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EInvokeInfix1_alt1(this: Ohm.Node, l$0: Ohm.Node, op$0: Ohm.Node, r$0: Ohm.Node): any {
      const l = l$0.toAST(); const op = op$0.toAST(); const r = r$0.toAST()
      return (new (((MExpr).Invoke))($meta(this), op, [(new (MInvokeArg)($meta(this), null, l)), (new (MInvokeArg)($meta(this), null, r))]))
    },
    
    EInvokeInfix1_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  EPipe(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EPipe_alt1(this: Ohm.Node, l$0: Ohm.Node, _2: Ohm.Node, r$0: Ohm.Node): any {
      const l = l$0.toAST(); ; const r = r$0.toAST()
      return (new (((MExpr).Pipe))($meta(this), l, r))
    },
    
    EPipe_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  EInvokeInfix2(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EInvokeInfix2_alt1(this: Ohm.Node, l$0: Ohm.Node, op$0: Ohm.Node, r$0: Ohm.Node): any {
      const l = l$0.toAST(); const op = op$0.toAST(); const r = r$0.toAST()
      return (new (((MExpr).Invoke))($meta(this), op, [(new (MInvokeArg)($meta(this), null, l)), (new (MInvokeArg)($meta(this), null, r))]))
    },
    
    EInvokeInfix2_alt2(this: Ohm.Node, l$0: Ohm.Node, _2: Ohm.Node, r$0: Ohm.Node): any {
      const l = l$0.toAST(); ; const r = r$0.toAST()
      return (new (((MExpr).IntrinsicEq))($meta(this), l, r))
    },
    
    EInvokeInfix2_alt3(this: Ohm.Node, l$0: Ohm.Node, op$0: Ohm.Node, t$0: Ohm.Node): any {
      const l = l$0.toAST(); const op = op$0.toAST(); const t = t$0.toAST()
      return (new (((MExpr).Invoke))($meta(this), op, [(new (MInvokeArg)($meta(this), null, l)), (new (MInvokeArg)($meta(this), null, (new (((MExpr).Static))($meta(this), t))))]))
    },
    
    EInvokeInfix2_alt4(this: Ohm.Node, l$0: Ohm.Node, _2: Ohm.Node, t$0: Ohm.Node, _4: Ohm.Node, v$0: Ohm.Node): any {
      const l = l$0.toAST(); ; const t = t$0.toAST(); ; const v = v$0.toAST()
      return (new (((MExpr).IsVariant))($meta(this), l, t, v))
    },
    
    EInvokeInfix2_alt5(this: Ohm.Node, l$0: Ohm.Node, _2: Ohm.Node, t$0: Ohm.Node): any {
      const l = l$0.toAST(); ; const t = t$0.toAST()
      return (new (((MExpr).Is))($meta(this), l, t))
    },
    
    EInvokeInfix2_alt6(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  EInvokePre(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EInvokePre_alt1(this: Ohm.Node, op$0: Ohm.Node, e$0: Ohm.Node): any {
      const op = op$0.toAST(); const e = e$0.toAST()
      return (new (((MExpr).Invoke))($meta(this), op, [(new (MInvokeArg)($meta(this), null, e))]))
    },
    
    EInvokePre_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  EInvokePost(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EInvokePost_alt1(this: Ohm.Node, s$0: Ohm.Node, n$0: Ohm.Node, _3: Ohm.Node, xs$0: Ohm.Node, _5: Ohm.Node): any {
      const s = s$0.toAST(); const n = n$0.toAST(); ; const xs = xs$0.toAST(); 
      return (new (((MExpr).InvokeSelf))($meta(this), n, s, xs))
    },
    
    EInvokePost_alt2(this: Ohm.Node, n$0: Ohm.Node, _2: Ohm.Node, xs$0: Ohm.Node, _4: Ohm.Node): any {
      const n = n$0.toAST(); ; const xs = xs$0.toAST(); 
      return (new (((MExpr).Invoke))($meta(this), n, xs))
    },
    
    EInvokePost_alt3(this: Ohm.Node, _1: Ohm.Node, n$0: Ohm.Node, _3: Ohm.Node, xs$0: Ohm.Node, _5: Ohm.Node): any {
      ; const n = n$0.toAST(); ; const xs = xs$0.toAST(); 
      return (new (((MExpr).Primitive))($meta(this), n, xs))
    },
    
    EInvokePost_alt4(this: Ohm.Node, _1: Ohm.Node, n$0: Ohm.Node, _3: Ohm.Node, xs$0: Ohm.Node, _5: Ohm.Node): any {
      ; const n = n$0.toAST(); ; const xs = xs$0.toAST(); 
      return (new (((MExpr).Foreign))($meta(this), n, xs))
    },
    
    EInvokePost_alt5(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  EVPair(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EVPair_alt1(this: Ohm.Node, n$0: Ohm.Node, _2: Ohm.Node, v$0: Ohm.Node): any {
      const n = n$0.toAST(); ; const v = v$0.toAST()
      return (new (EPair)(n, v))
    },
    
  EForce(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EForce_alt1(this: Ohm.Node, _1: Ohm.Node, e$0: Ohm.Node): any {
      ; const e = e$0.toAST()
      return (new (((MExpr).Force))($meta(this), e))
    },
    
    EForce_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  EApply(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EApply_alt1(this: Ohm.Node, c$0: Ohm.Node, _2: Ohm.Node, xs$0: Ohm.Node, _4: Ohm.Node): any {
      const c = c$0.toAST(); ; const xs = xs$0.toAST(); 
      return (new (((MExpr).Apply))($meta(this), c, xs))
    },
    
    EApply_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  EInvokeArg(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EInvokeArg_alt1(this: Ohm.Node, n$0: Ohm.Node, _2: Ohm.Node, e$0: Ohm.Node): any {
      const n = n$0.toAST(); ; const e = e$0.toAST()
      return (new (MInvokeArg)($meta(this), n, e))
    },
    
    EInvokeArg_alt2(this: Ohm.Node, e$0: Ohm.Node): any {
      const e = e$0.toAST()
      return (new (MInvokeArg)($meta(this), null, e))
    },
    
  ENew(x: Ohm.Node): any {
    return x.toAST();
  },
  
    ENew_alt1(this: Ohm.Node, _1: Ohm.Node, n$0: Ohm.Node, _3: Ohm.Node, v$0: Ohm.Node, _5: Ohm.Node, xs$0: Ohm.Node, _7: Ohm.Node): any {
      ; const n = n$0.toAST(); ; const v = v$0.toAST(); ; const xs = xs$0.toAST(); 
      return (new (((MExpr).NewVariant))($meta(this), n, v, xs))
    },
    
    ENew_alt2(this: Ohm.Node, _1: Ohm.Node, n$0: Ohm.Node, _3: Ohm.Node, v$0: Ohm.Node, _5: Ohm.Node, xs$0: Ohm.Node, _7: Ohm.Node): any {
      ; const n = n$0.toAST(); ; const v = v$0.toAST(); ; const xs = xs$0.toAST(); 
      return (new (((MExpr).NewVariantPos))($meta(this), n, v, xs))
    },
    
    ENew_alt3(this: Ohm.Node, _1: Ohm.Node, n$0: Ohm.Node, _3: Ohm.Node, xs$0: Ohm.Node, _5: Ohm.Node): any {
      ; const n = n$0.toAST(); ; const xs = xs$0.toAST(); 
      return (new (((MExpr).New))($meta(this), n, xs))
    },
    
    ENew_alt4(this: Ohm.Node, _1: Ohm.Node, n$0: Ohm.Node, _3: Ohm.Node, xs$0: Ohm.Node, _5: Ohm.Node): any {
      ; const n = n$0.toAST(); ; const xs = xs$0.toAST(); 
      return (new (((MExpr).NewPos))($meta(this), n, xs))
    },
    
    ENew_alt5(this: Ohm.Node, n$0: Ohm.Node, _2: Ohm.Node, v$0: Ohm.Node): any {
      const n = n$0.toAST(); ; const v = v$0.toAST()
      return (new (((MExpr).GetVariant))($meta(this), n, v))
    },
    
    ENew_alt6(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  EPair(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EPair_alt1(this: Ohm.Node, x$0: Ohm.Node, _2: Ohm.Node, e$0: Ohm.Node): any {
      const x = x$0.toAST(); ; const e = e$0.toAST()
      return (new (EPair)(x, e))
    },
    
  EMember(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EMember_alt1(this: Ohm.Node, o$0: Ohm.Node, _2: Ohm.Node, f$0: Ohm.Node): any {
      const o = o$0.toAST(); ; const f = f$0.toAST()
      return (new (((MExpr).Project))($meta(this), o, f))
    },
    
    EMember_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  EPrim(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EPrim_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      
      return (new (((MExpr).Hole))($meta(this)))
    },
    
    EPrim_alt2(this: Ohm.Node, r$0: Ohm.Node): any {
      const r = r$0.toAST()
      return r
    },
    
    EPrim_alt3(this: Ohm.Node, _1: Ohm.Node, r$0: Ohm.Node): any {
      ; const r = r$0.toAST()
      return (new (((MExpr).Static))($meta(this), r))
    },
    
    EPrim_alt4(this: Ohm.Node, v$0: Ohm.Node): any {
      const v = v$0.toAST()
      return (new (((MExpr).Var))($meta(this), v))
    },
    
    EPrim_alt5(this: Ohm.Node, l$0: Ohm.Node): any {
      const l = l$0.toAST()
      return (new (((MExpr).Const))($meta(this), l))
    },
    
    EPrim_alt6(this: Ohm.Node, _1: Ohm.Node): any {
      
      return (new (((MExpr).Self))($meta(this)))
    },
    
    EPrim_alt7(this: Ohm.Node, n$0: Ohm.Node): any {
      const n = n$0.toAST()
      return (new (((MExpr).GetGlobal))($meta(this), n))
    },
    
    EPrim_alt8(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    EPrim_alt9(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    EPrim_alt10(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    EPrim_alt11(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    EPrim_alt12(this: Ohm.Node, _1: Ohm.Node, e$0: Ohm.Node, _3: Ohm.Node): any {
      ; const e = e$0.toAST(); 
      return e
    },
    
  EList(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EList_alt1(this: Ohm.Node, _1: Ohm.Node, xs$0: Ohm.Node, _3: Ohm.Node): any {
      ; const xs = xs$0.toAST(); 
      return (new (((MExpr).List))($meta(this), xs))
    },
    
  ELItem(x: Ohm.Node): any {
    return x.toAST();
  },
  
    ELItem_alt1(this: Ohm.Node, _1: Ohm.Node, v$0: Ohm.Node): any {
      ; const v = v$0.toAST()
      return (new (((ListItem).Spread))(v))
    },
    
    ELItem_alt2(this: Ohm.Node, v$0: Ohm.Node): any {
      const v = v$0.toAST()
      return (new (((ListItem).Item))(v))
    },
    
  EMap(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EMap_alt1(this: Ohm.Node, _1: Ohm.Node, _2: Ohm.Node, _3: Ohm.Node): any {
      ; ; 
      return (new (((MExpr).Map))($meta(this), []))
    },
    
    EMap_alt2(this: Ohm.Node, _1: Ohm.Node, xs$0: Ohm.Node, _3: Ohm.Node): any {
      ; const xs = xs$0.toAST(); 
      return (new (((MExpr).Map))($meta(this), xs))
    },
    
  EMItem(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EMItem_alt1(this: Ohm.Node, _1: Ohm.Node, v$0: Ohm.Node): any {
      ; const v = v$0.toAST()
      return (new (((MapItem).Spread))(v))
    },
    
    EMItem_alt2(this: Ohm.Node, k$0: Ohm.Node, _2: Ohm.Node, v$0: Ohm.Node): any {
      const k = k$0.toAST(); ; const v = v$0.toAST()
      return (new (((MapItem).Pair))(k, v))
    },
    
  ELambda(x: Ohm.Node): any {
    return x.toAST();
  },
  
    ELambda_alt1(this: Ohm.Node, _1: Ohm.Node, ps$0: Ohm.Node, _3: Ohm.Node, b$0: Ohm.Node, _5: Ohm.Node): any {
      ; const ps = ps$0.toAST(); ; const b = b$0.toAST(); 
      return (new (((MExpr).Lambda))($meta(this), ps, b))
    },
    
    ELambda_alt2(this: Ohm.Node, _1: Ohm.Node, b$0: Ohm.Node, _3: Ohm.Node): any {
      ; const b = b$0.toAST(); 
      return (new (((MExpr).Lambda))($meta(this), [], b))
    },
    
  LExprs(x: Ohm.Node): any {
    return x.toAST();
  },
  
    LExprs_alt1(this: Ohm.Node, x$0: Ohm.Node): any {
      const x = x$0.toAST()
      return (new (((MExpr).Block))($meta(this), x))
    },
    
  ERecord(x: Ohm.Node): any {
    return x.toAST();
  },
  
    ERecord_alt1(this: Ohm.Node, _1: Ohm.Node, _2: Ohm.Node, xs$0: Ohm.Node, _4: Ohm.Node): any {
      ; ; const xs = xs$0.toAST(); 
      return (new (((MExpr).Record))($meta(this), xs))
    },
    
  EBinary(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EBinary_alt1(this: Ohm.Node, _1: Ohm.Node, xs$0: Ohm.Node, _3: Ohm.Node): any {
      ; const xs = xs$0.toAST(); 
      return (new (((MExpr).Binary))($meta(this), xs))
    },
    
  EBinElement(x: Ohm.Node): any {
    return x.toAST();
  },
  
    EBinElement_alt1(this: Ohm.Node, x$0: Ohm.Node, _2: Ohm.Node, s$0: Ohm.Node, sz$0: Ohm.Node, e$0: Ohm.Node): any {
      const x = x$0.toAST(); ; const s = s$0.toAST(); const sz = sz$0.toAST(); const e = e$0.toAST()
      return (new (((EBinElement).Int))(x, sz, e, s))
    },
    
    EBinElement_alt2(this: Ohm.Node, x$0: Ohm.Node): any {
      const x = x$0.toAST()
      return (new (((EBinElement).Byte))(x))
    },
    
  Endianess(x: Ohm.Node): any {
    return x.toAST();
  },
  
    Endianess_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      
      return (new (((Endianess).Le))())
    },
    
    Endianess_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      
      return (new (((Endianess).Be))())
    },
    
    Endianess_alt3(this: Ohm.Node, ): any {
      
      return (new (((Endianess).Le))())
    },
    
  Signed(x: Ohm.Node): any {
    return x.toAST();
  },
  
    Signed_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      
      return (new (((Signed).Signed))())
    },
    
    Signed_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      
      return (new (((Signed).Unsigned))())
    },
    
    Signed_alt3(this: Ohm.Node, ): any {
      
      return (new (((Signed).Unsigned))())
    },
    
  Const(x: Ohm.Node): any {
    return x.toAST();
  },
  
    Const_alt1(this: Ohm.Node, x$0: Ohm.Node, _2: Ohm.Node): any {
      const x = x$0.toAST(); 
      return (new (((MConst).Float))($meta(this), x))
    },
    
    Const_alt2(this: Ohm.Node, x$0: Ohm.Node, _2: Ohm.Node): any {
      const x = x$0.toAST(); 
      return (new (((MConst).Int32))($meta(this), x))
    },
    
    Const_alt3(this: Ohm.Node, x$0: Ohm.Node): any {
      const x = x$0.toAST()
      return (new (((MConst).Int))($meta(this), x))
    },
    
    Const_alt4(this: Ohm.Node, _1: Ohm.Node): any {
      
      return (new (((MConst).True))($meta(this)))
    },
    
    Const_alt5(this: Ohm.Node, _1: Ohm.Node): any {
      
      return (new (((MConst).False))($meta(this)))
    },
    
    Const_alt6(this: Ohm.Node, x$0: Ohm.Node): any {
      const x = x$0.toAST()
      return (new (((MConst).Text))($meta(this), x))
    },
    
    Const_alt7(this: Ohm.Node, _1: Ohm.Node): any {
      
      return (new (((MConst).Nothing))($meta(this)))
    },
    
  CommaList(x: Ohm.Node): any {
    return x.toAST();
  },
  
    CommaList_alt1(this: Ohm.Node, xs$0: Ohm.Node, _2: Ohm.Node): any {
      const xs = xs$0.toAST(); 
      return xs
    },
    
  CommaList1(x: Ohm.Node): any {
    return x.toAST();
  },
  
    CommaList1_alt1(this: Ohm.Node, xs$0: Ohm.Node, _2: Ohm.Node): any {
      const xs = xs$0.toAST(); 
      return xs
    },
    
  header(x: Ohm.Node): any {
    return x.toAST();
  },
  
    header_alt1(this: Ohm.Node, _1: Ohm.Node, _2: Ohm.Node, _3: Ohm.Node): any {
      return this.sourceString;
    },
    
  line(x: Ohm.Node): any {
    return x.toAST();
  },
  
    line_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  hs(x: Ohm.Node): any {
    return x.toAST();
  },
  
    hs_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    hs_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  newline(x: Ohm.Node): any {
    return x.toAST();
  },
  
    newline_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    newline_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    newline_alt3(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  comment(x: Ohm.Node): any {
    return x.toAST();
  },
  
    comment_alt1(this: Ohm.Node, _1: Ohm.Node, _2: Ohm.Node): any {
      return this.sourceString;
    },
    
  space(x: Ohm.Node): any {
    return x.toAST();
  },
  
    space_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  atom_start(x: Ohm.Node): any {
    return x.toAST();
  },
  
    atom_start_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  atom_rest(x: Ohm.Node): any {
    return x.toAST();
  },
  
    atom_rest_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    atom_rest_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    atom_rest_alt3(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  atom(x: Ohm.Node): any {
    return x.toAST();
  },
  
    atom_alt1(this: Ohm.Node, _1: Ohm.Node, _2: Ohm.Node, _3: Ohm.Node): any {
      return this.sourceString;
    },
    
  variable_start(x: Ohm.Node): any {
    return x.toAST();
  },
  
    variable_start_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  variable_rest(x: Ohm.Node): any {
    return x.toAST();
  },
  
    variable_rest_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    variable_rest_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    variable_rest_alt3(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    variable_rest_alt4(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  variable(x: Ohm.Node): any {
    return x.toAST();
  },
  
    variable_alt1(this: Ohm.Node, _1: Ohm.Node, _2: Ohm.Node): any {
      return this.sourceString;
    },
    
    variable_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  name(x: Ohm.Node): any {
    return x.toAST();
  },
  
    name_alt1(this: Ohm.Node, n$0: Ohm.Node): any {
      ; const n = n$0.toAST()
      return n
    },
    
    name_alt2(this: Ohm.Node, _1: Ohm.Node, n$0: Ohm.Node): any {
      ; const n = n$0.toAST()
      return n
    },
    
  foreign_name_char(x: Ohm.Node): any {
    return x.toAST();
  },
  
    foreign_name_char_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    foreign_name_char_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    foreign_name_char_alt3(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    foreign_name_char_alt4(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  foreign_name_part(x: Ohm.Node): any {
    return x.toAST();
  },
  
    foreign_name_part_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  foreign_name(x: Ohm.Node): any {
    return x.toAST();
  },
  
    foreign_name_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  boolean(x: Ohm.Node): any {
    return x.toAST();
  },
  
    boolean_alt1(this: Ohm.Node, b$0: Ohm.Node): any {
      const b = b$0.toAST()
      return $primitive.parse_boolean(b)
    },
    
  t_boolean(x: Ohm.Node): any {
    return x.toAST();
  },
  
    t_boolean_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    t_boolean_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  dec_digit(x: Ohm.Node): any {
    return x.toAST();
  },
  
    dec_digit_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    dec_digit_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  hex_digit(x: Ohm.Node): any {
    return x.toAST();
  },
  
    hex_digit_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    hex_digit_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    hex_digit_alt3(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  ehex_digit(x: Ohm.Node): any {
    return x.toAST();
  },
  
    ehex_digit_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    ehex_digit_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  t_integer(x: Ohm.Node): any {
    return x.toAST();
  },
  
    t_integer_alt1(this: Ohm.Node, _2: Ohm.Node, _3: Ohm.Node): any {
      return this.sourceString;
    },
    
    t_integer_alt2(this: Ohm.Node, _2: Ohm.Node, _3: Ohm.Node): any {
      return this.sourceString;
    },
    
  integer(x: Ohm.Node): any {
    return x.toAST();
  },
  
    integer_alt1(this: Ohm.Node, x$0: Ohm.Node): any {
      const x = x$0.toAST()
      return $primitive.parse_integer(x)
    },
    
  t_float(x: Ohm.Node): any {
    return x.toAST();
  },
  
    t_float_alt1(this: Ohm.Node, _2: Ohm.Node, _3: Ohm.Node, _4: Ohm.Node, _5: Ohm.Node): any {
      return this.sourceString;
    },
    
  float(x: Ohm.Node): any {
    return x.toAST();
  },
  
    float_alt1(this: Ohm.Node, x$0: Ohm.Node): any {
      const x = x$0.toAST()
      return $primitive.parse_float(x)
    },
    
  text_character(x: Ohm.Node): any {
    return x.toAST();
  },
  
    text_character_alt1(this: Ohm.Node, _1: Ohm.Node, _2: Ohm.Node): any {
      return this.sourceString;
    },
    
    text_character_alt2(this: Ohm.Node, _2: Ohm.Node): any {
      return this.sourceString;
    },
    
  escape_sequence(x: Ohm.Node): any {
    return x.toAST();
  },
  
    escape_sequence_alt1(this: Ohm.Node, _1: Ohm.Node, _2: Ohm.Node, _3: Ohm.Node, _4: Ohm.Node, _5: Ohm.Node): any {
      return this.sourceString;
    },
    
    escape_sequence_alt2(this: Ohm.Node, _1: Ohm.Node, _2: Ohm.Node, _3: Ohm.Node): any {
      return this.sourceString;
    },
    
    escape_sequence_alt3(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  t_text(x: Ohm.Node): any {
    return x.toAST();
  },
  
    t_text_alt1(this: Ohm.Node, _1: Ohm.Node, _2: Ohm.Node, _3: Ohm.Node): any {
      return this.sourceString;
    },
    
  text(x: Ohm.Node): any {
    return x.toAST();
  },
  
    text_alt1(this: Ohm.Node, x$0: Ohm.Node): any {
      const x = x$0.toAST()
      return $primitive.parse_string(x)
    },
    
  any_binary_op(x: Ohm.Node): any {
    return x.toAST();
  },
  
    any_binary_op_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    any_binary_op_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    any_binary_op_alt3(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  binary_op(x: Ohm.Node): any {
    return x.toAST();
  },
  
    binary_op_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    binary_op_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    binary_op_alt3(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  assign_op(x: Ohm.Node): any {
    return x.toAST();
  },
  
    assign_op_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  imply_op(x: Ohm.Node): any {
    return x.toAST();
  },
  
    imply_op_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  symbol(x: Ohm.Node): any {
    return x.toAST();
  },
  
    symbol_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    symbol_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    symbol_alt3(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    symbol_alt4(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    symbol_alt5(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    symbol_alt6(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    symbol_alt7(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    symbol_alt8(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    symbol_alt9(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    symbol_alt10(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    symbol_alt11(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    symbol_alt12(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    symbol_alt13(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    symbol_alt14(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    symbol_alt15(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  t_binary_op(x: Ohm.Node): any {
    return x.toAST();
  },
  
    t_binary_op_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    t_binary_op_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    t_binary_op_alt3(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    t_binary_op_alt4(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    t_binary_op_alt5(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    t_binary_op_alt6(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    t_binary_op_alt7(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    t_binary_op_alt8(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    t_binary_op_alt9(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    t_binary_op_alt10(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    t_binary_op_alt11(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    t_binary_op_alt12(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    t_binary_op_alt13(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    t_binary_op_alt14(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    t_binary_op_alt15(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    t_binary_op_alt16(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    t_binary_op_alt17(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    t_binary_op_alt18(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    t_binary_op_alt19(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    t_binary_op_alt20(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  prefix_op(x: Ohm.Node): any {
    return x.toAST();
  },
  
    prefix_op_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    prefix_op_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
    prefix_op_alt3(this: Ohm.Node, _1: Ohm.Node): any {
      return this.sourceString;
    },
    
  kw(x: Ohm.Node): any {
    return x.toAST();
  },
  
    kw_alt1(this: Ohm.Node, x$0: Ohm.Node): any {
      const x = x$0.toAST(); 
      return x
    },
    
  def_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    def__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  when_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    when__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  otherwise_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    otherwise__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  nothing_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    nothing__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  self_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    self__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  not_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    not__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  and_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    and__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  or_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    or__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  true_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    true__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  false_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    false__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  new_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    new__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  struct_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    struct__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  let_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    let__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  union_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    union__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  lazy_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    lazy__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  force_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    force__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  assert_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    assert__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  test_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    test__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  as_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    as__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  is_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    is__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  primitive_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    primitive__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  singleton_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    singleton__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  import_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    import__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  requires_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    requires__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  trait_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    trait__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  in_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    in__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  implement_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    implement__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  for_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    for__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  foreign_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    foreign__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  repeat_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    repeat__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  continue_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    continue__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  break_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    break__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  with_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    with__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  open_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    open__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  package_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    package__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  declare_(x: Ohm.Node): any {
    return x.toAST();
  },
  
    declare__alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  reserved(x: Ohm.Node): any {
    return x.toAST();
  },
  
    reserved_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt2(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt3(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt4(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt5(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt6(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt7(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt8(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt9(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt10(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt11(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt12(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt13(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt14(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt15(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt16(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt17(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt18(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt19(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt20(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt21(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt22(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt23(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt24(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt25(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt26(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt27(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt28(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt29(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt30(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt31(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt32(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt33(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt34(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt35(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
    reserved_alt36(this: Ohm.Node, _1: Ohm.Node): any {
      return this.children[0].toAST();
    },
    
  Repl(x: Ohm.Node): any {
    return x.toAST();
  },
  
    Repl_alt1(this: Ohm.Node, x$0: Ohm.Node): any {
      const x = x$0.toAST()
      return (new (((MRepl).Decl))(x))
    },
    
    Repl_alt2(this: Ohm.Node, x$0: Ohm.Node, _2: Ohm.Node): any {
      const x = x$0.toAST(); 
      return (new (((MRepl).Expr))(x))
    },
    
    Repl_alt3(this: Ohm.Node, _1: Ohm.Node, c$0: Ohm.Node): any {
      ; const c = c$0.toAST()
      return (new (((MRepl).Command))(c))
    },
    
  ReplCommand(x: Ohm.Node): any {
    return x.toAST();
  },
  
    ReplCommand_alt1(this: Ohm.Node, _1: Ohm.Node): any {
      
      return (new (((MRCommand).Quit))())
    },
    
    ReplCommand_alt2(this: Ohm.Node, _1: Ohm.Node, x$0: Ohm.Node): any {
      ; const x = x$0.toAST()
      return (new (((MRCommand).DeclCode))(x))
    },
    
    ReplCommand_alt3(this: Ohm.Node, _1: Ohm.Node, x$0: Ohm.Node, _3: Ohm.Node): any {
      ; const x = x$0.toAST(); 
      return (new (((MRCommand).ExprCode))(x))
    },
    
  }
  );
  semantics.addOperation("toAST()", toAstVisitor);

  export function toAst(result: Ohm.MatchResult) {
    return semantics(result).toAST();
  }
  
