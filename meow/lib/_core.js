$meow.in_package(null, ($scope) => {
$meow.in_package(null, ($scope) => {
$meow.declare_type($scope.wrap("ordering"));
$meow.defunion($scope.wrap("ordering"), [
  {name: "less-than", fields: null, types: null},
  {name: "equal", fields: null, types: null},
  {name: "greater-than", fields: null, types: null},
]);
$meow.declare_type($scope.wrap("maybe"));
$meow.defunion($scope.wrap("maybe"), [
  {name: "none", fields: null, types: null},
  {name: "some", fields: ["value"], types: [() => $meow.type("unknown")]},
]);
$meow.declare_type($scope.wrap("result"));
$meow.defunion($scope.wrap("result"), [
  {name: "error", fields: ["reason"], types: [() => $meow.type("unknown")]},
  {name: "ok", fields: ["value"], types: [() => $meow.type("unknown")]},
]);
$meow.defstruct($scope.wrap("byte-slice"), ["array", "offset", "length"], [() => $scope.type("byte-array"), () => $scope.type("i32"), () => $scope.type("i32")]);
$meow.defstruct($scope.wrap("mutable-byte-array"), ["array"], [() => $scope.type("byte-array")]);
$meow.defstruct($scope.wrap("array-slice"), ["array", "offset", "length"], [() => $scope.type("array"), () => $scope.type("i32"), () => $scope.type("i32")]);
$meow.declare_type($scope.wrap("linked-list"));
$meow.defunion($scope.wrap("linked-list"), [
  {name: "empty", fields: null, types: null},
  {name: "cons", fields: ["head", "tail"], types: [() => $meow.type("unknown"), () => $scope.type("linked-list")]},
]);
$meow.declare_type($scope.wrap("stream"));
$meow.defunion($scope.wrap("stream"), [
  {name: "empty", fields: null, types: null},
  {name: "cons", fields: ["head", "tail"], types: [() => $meow.type("unknown"), () => $scope.type("thunk")]},
]);
$meow.defsingleton($scope.wrap("transcript"));
});
$meow.in_package(null, ($scope) => {
$meow.in_package(null, ($scope) => {
$meow.defun("log(self:)/2", [$scope.type("transcript"), $scope.type("unknown")], function* log_self___2 ($0, Value) {
  let $r0;
  let $r1;
  $r1 = Value;
  transcript_log($r1)
  $r0 = $0;
  return $r0;
});
});
});
$meow.in_package(null, ($scope) => {
$meow.in_package(null, ($scope) => {
$meow.defun("and()/2", [$scope.type("bool"), $scope.type("bool")], function* and___2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = bool_and($r1, $r2);
  return $r0;
});

$meow.defun("or()/2", [$scope.type("bool"), $scope.type("bool")], function* or___2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = bool_or($r1, $r2);
  return $r0;
});

$meow.defun("not()/1", [$scope.type("bool")], function* not___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = bool_not($r1);
  return $r0;
});

$meow.defun("===()/2", [$scope.type("bool"), $scope.type("bool")], function* ______2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = bool_eq($r1, $r2);
  return $r0;
});

$meow.defun("=/=()/2", [$scope.type("bool"), $scope.type("bool")], function* ______2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = bool_neq($r1, $r2);
  return $r0;
});

});
$meow.in_package(null, ($scope) => {
$meow.defun("as()/2", [$scope.vtype("ordering", "less-than"), $scope.stype("i32")], function* as___2 ($0, $1) {
  let $r0;
  $r0 = -1n;
  return $r0;
});
$meow.defun("as()/2", [$scope.vtype("ordering", "equal"), $scope.stype("i32")], function* as___2 ($0, $1) {
  let $r0;
  $r0 = 0n;
  return $r0;
});
$meow.defun("as()/2", [$scope.vtype("ordering", "greater-than"), $scope.stype("i32")], function* as___2 ($0, $1) {
  let $r0;
  $r0 = 1n;
  return $r0;
});
});
});
$meow.in_package(null, ($scope) => {
$meow.in_package(null, ($scope) => {
$meow.defsingleton($scope.wrap("panic"));
$meow.defun("raise(self:tag:data:)/4", [$scope.type("panic"), $scope.type("text"), $scope.type("text"), $scope.type("unknown")], function* raise_self_tag_data___4 ($0, Message, Tag, Data) {
  let $r0;
  let $r1;
  $r1 = Tag;
  let $r2;
  $r2 = Message;
  let $r3;
  $r3 = Data;
  $r0 = panic_raise($r1, $r2, $r3);
  return $r0;
});
$meow.defun("raise(self:)/2", [$scope.type("panic"), $scope.type("text")], function* raise_self___2 ($0, Message) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Message;
  let $r3;
  $r3 = "panic";
  let $r4;
  $r4 = null;
  $r0 = yield* $meow.call("raise(self:tag:data:)/4", $r1, $r2, $r3, $r4);
  return $r0;
});
$meow.defun("raise(self:tag:)/3", [$scope.type("panic"), $scope.type("text"), $scope.type("text")], function* raise_self_tag___3 ($0, Message, Tag) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Message;
  let $r3;
  $r3 = Tag;
  let $r4;
  $r4 = null;
  $r0 = yield* $meow.call("raise(self:tag:data:)/4", $r1, $r2, $r3, $r4);
  return $r0;
});
});
$meow.in_package(null, ($scope) => {
$meow.defun("from(self:nullable:)/2", [$scope.stype("maybe"), $scope.type("nothing")], function* from_self_nullable___2 ($0, Value) {
  let $r0;
  $r0 = $scope.get_variant("maybe", "none");
  return $r0;
});
$meow.defun("from(self:nullable:)/2", [$scope.stype("maybe"), $meow.type("unknown")], function* from_self_nullable___2 ($0, Value) {
  let $r0;
  let $r1;
  $r1 = Value;
  $r0 = $scope.make_variant("maybe", "some", {"value": $r1});
  return $r0;
});
$meow.defun("of(self:)/2", [$scope.stype("maybe"), $meow.type("unknown")], function* of_self___2 ($0, Value) {
  let $r0;
  let $r1;
  $r1 = Value;
  $r0 = $scope.make_variant("maybe", "some", {"value": $r1});
  return $r0;
});
$meow.defun("none(self:)/1", [$scope.stype("maybe")], function* none_self___1 ($0) {
  let $r0;
  $r0 = $scope.get_variant("maybe", "none");
  return $r0;
});
$meow.defun("unwrap(self:)/1", [$scope.vtype("maybe", "some")], function* unwrap_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = $r1["value"];
  return $r0;
});
$meow.defun("unwrap(self:default:)/2", [$scope.vtype("maybe", "some"), $meow.type("unknown")], function* unwrap_self_default___2 ($0, _) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = $r1["value"];
  return $r0;
});
$meow.defun("unwrap(self:default:)/2", [$scope.vtype("maybe", "none"), $meow.type("unknown")], function* unwrap_self_default___2 ($0, Value) {
  let $r0;
  $r0 = $scope.global("value");
  return $r0;
});
$meow.defun("unwrap-or-panic(self:)/2", [$scope.vtype("maybe", "some"), $scope.type("text")], function* unwrap_or_panic_self___2 ($0, Message) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = $r1["value"];
  return $r0;
});
$meow.defun("unwrap-or-panic(self:)/2", [$scope.vtype("maybe", "none"), $scope.type("text")], function* unwrap_or_panic_self___2 ($0, Message) {
  let $r0;
  let $r1;
  $r1 = $scope.smake("panic");
  let $r2;
  $r2 = Message;
  $r0 = yield* $meow.call("raise(self:message:)/2", $r1, $r2);
  return $r0;
});
});
});
$meow.in_package(null, ($scope) => {
$meow.in_package(null, ($scope) => {
$meow.defun(">>()/2", [$scope.type("lambda-1"), $scope.type("lambda-1")], function* $bashr___2 (F, G) {
  let $r0;
  $r0 = (function* (X) {
    let $r0;
    let $r1;
    $r1 = G;
    let $r2;
    let $r3;
    $r3 = F;
    let $r4;
    $r4 = X;
    $r2 = yield* $r3($r4);
    $r0 = yield* $r1($r2);
    return $r0;
  });
  return $r0;
});
$meow.defun("<<()/2", [$scope.type("lambda-1"), $scope.type("lambda-1")], function* _____2 (F, G) {
  let $r0;
  $r0 = (function* (X) {
    let $r0;
    let $r1;
    $r1 = F;
    let $r2;
    let $r3;
    $r3 = G;
    let $r4;
    $r4 = X;
    $r2 = yield* $r3($r4);
    $r0 = yield* $r1($r2);
    return $r0;
  });
  return $r0;
});
});
});
$meow.in_package(null, ($scope) => {
$meow.in_package(null, ($scope) => {
$meow.defun("+()/2", [$scope.type("i32"), $scope.type("i32")], function* $plus___2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = i32_add($r1, $r2);
  return $r0;
});

$meow.defun("-()/2", [$scope.type("i32"), $scope.type("i32")], function* ____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = i32_sub($r1, $r2);
  return $r0;
});

$meow.defun("*()/2", [$scope.type("i32"), $scope.type("i32")], function* $times___2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = i32_mul($r1, $r2);
  return $r0;
});

$meow.defun("\\()/2", [$scope.type("i32"), $scope.type("i32")], function* ____2 ($0, X) {
  let $r0;
  try {
    let $r1;
    let $r2;
    $r2 = X;
    let $r3;
    $r3 = (0 | 0);
    $r1 = yield* $meow.call("=/=()/2", $r2, $r3);
    if (!$r1) { throw $meow.assert_fail("non-zero-divisor", "Line 40, col 3:\n  39 | def i32 \\ (X: i32) -> i32 {\n> 40 |   assert X =/= 0n :: non-zero-divisor;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  41 |   primitive i32.div(self, X);\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("non-zero-divisor", String(e) + "\n\n" + "Line 40, col 3:\n  39 | def i32 \\ (X: i32) -> i32 {\n> 40 |   assert X =/= 0n :: non-zero-divisor;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  41 |   primitive i32.div(self, X);\n")
  }
  let $r4;
  $r4 = $0;
  let $r5;
  $r5 = X;
  $r0 = i32_div($r4, $r5);
  return $r0;
});

$meow.defun("**()/2", [$scope.type("i32"), $scope.type("i32")], function* $times____2 ($0, X) {
  let $r0;
  try {
    let $r1;
    let $r2;
    $r2 = X;
    let $r3;
    $r3 = (0 | 0);
    $r1 = yield* $meow.call(">=()/2", $r2, $r3);
    if (!$r1) { throw $meow.assert_fail("positive-exponent", "Line 52, col 3:\n  51 | def i32 ** (X: i32) -> i32 {\n> 52 |   assert X >= 0n :: positive-exponent;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  53 |   primitive i32.pow(self, X);\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("positive-exponent", String(e) + "\n\n" + "Line 52, col 3:\n  51 | def i32 ** (X: i32) -> i32 {\n> 52 |   assert X >= 0n :: positive-exponent;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  53 |   primitive i32.pow(self, X);\n")
  }
  let $r4;
  $r4 = $0;
  let $r5;
  $r5 = X;
  $r0 = i32_pow($r4, $r5);
  return $r0;
});

$meow.defun("%()/2", [$scope.type("i32"), $scope.type("i32")], function* $mod___2 ($0, X) {
  let $r0;
  try {
    let $r1;
    let $r2;
    $r2 = X;
    let $r3;
    $r3 = (0 | 0);
    $r1 = yield* $meow.call("=/=()/2", $r2, $r3);
    if (!$r1) { throw $meow.assert_fail("non-zero-divisor", "Line 64, col 3:\n  63 | def i32 % (X: i32) -> i32 {\n> 64 |   assert X =/= 0n :: non-zero-divisor;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  65 |   primitive i32.mod(self, X);\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("non-zero-divisor", String(e) + "\n\n" + "Line 64, col 3:\n  63 | def i32 % (X: i32) -> i32 {\n> 64 |   assert X =/= 0n :: non-zero-divisor;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  65 |   primitive i32.mod(self, X);\n")
  }
  let $r4;
  $r4 = $0;
  let $r5;
  $r5 = X;
  $r0 = i32_mod($r4, $r5);
  return $r0;
});

$meow.defun("===()/2", [$scope.type("i32"), $scope.type("i32")], function* ______2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = i32_eq($r1, $r2);
  return $r0;
});

$meow.defun("=/=()/2", [$scope.type("i32"), $scope.type("i32")], function* ______2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = i32_neq($r1, $r2);
  return $r0;
});

$meow.defun("<()/2", [$scope.type("i32"), $scope.type("i32")], function* ____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = i32_lt($r1, $r2);
  return $r0;
});

$meow.defun("<=()/2", [$scope.type("i32"), $scope.type("i32")], function* _____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = i32_lte($r1, $r2);
  return $r0;
});

$meow.defun(">()/2", [$scope.type("i32"), $scope.type("i32")], function* ____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = i32_gt($r1, $r2);
  return $r0;
});

$meow.defun(">=()/2", [$scope.type("i32"), $scope.type("i32")], function* _____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = i32_gte($r1, $r2);
  return $r0;
});

$meow.defun("compare-to(self:)/2", [$scope.type("i32"), $scope.type("i32")], function* compare_to_self___2 ($0, X) {
  let $r0;
  let $r1, $r2;
  let $r3;
  $r3 = $0;
  let $r4;
  $r4 = X;
  $r2 = yield* $meow.call("<()/2", $r3, $r4);
  if ($r2) {
    $r1 = $scope.get_variant("ordering", "less-than");
  } else {
    let $r5, $r6;
    let $r7;
    $r7 = $0;
    let $r8;
    $r8 = X;
    $r6 = yield* $meow.call("===()/2", $r7, $r8);
    if ($r6) {
      $r5 = $scope.get_variant("ordering", "equal");
    } else {
      let $r9, $r10;
      let $r11;
      $r11 = $0;
      let $r12;
      $r12 = X;
      $r10 = yield* $meow.call(">()/2", $r11, $r12);
      if ($r10) {
        $r9 = $scope.get_variant("ordering", "greater-than");
      } else {
        throw $meow.unreachable("no clause matched");
      }
      $r5 = $r9;
    }
    $r1 = $r5;
  }
  $r0 = $r1;
  return $r0;
});
$meow.defun("<<()/2", [$scope.type("i32"), $scope.type("i32")], function* _____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = i32_bshl($r1, $r2);
  return $r0;
});

$meow.defun(">>()/2", [$scope.type("i32"), $scope.type("i32")], function* $bashr___2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = i32_bashr($r1, $r2);
  return $r0;
});

$meow.defun(">>>()/2", [$scope.type("i32"), $scope.type("i32")], function* $blshr___2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = i32_blshr($r1, $r2);
  return $r0;
});

$meow.defun("&()/2", [$scope.type("i32"), $scope.type("i32")], function* ____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = i32_band($r1, $r2);
  return $r0;
});

$meow.defun("|()/2", [$scope.type("i32"), $scope.type("i32")], function* ____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = i32_bor($r1, $r2);
  return $r0;
});

$meow.defun("^()/2", [$scope.type("i32"), $scope.type("i32")], function* ____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = i32_bxor($r1, $r2);
  return $r0;
});

$meow.defun("~()/1", [$scope.type("i32")], function* ____1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = i32_bnot($r1);
  return $r0;
});

$meow.defun("-()/1", [$scope.type("i32")], function* ____1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = i32_negate($r1);
  return $r0;
});

$meow.defun("absolute(self:)/1", [$scope.type("i32")], function* absolute_self___1 ($0) {
  let $r0;
  let $r1, $r2;
  let $r3;
  $r3 = $0;
  let $r4;
  $r4 = (0 | 0);
  $r2 = yield* $meow.call("<()/2", $r3, $r4);
  if ($r2) {
    let $r5;
    $r5 = $0;
    $r1 = yield* $meow.call("-()/1", $r5);
  } else {
    let $r6, $r7;
    $r7 = true;
    if ($r7) {
      $r6 = $0;
    } else {
      throw $meow.unreachable("no clause matched");
    }
    $r1 = $r6;
  }
  $r0 = $r1;
  return $r0;
});

$meow.defun("as()/2", [$scope.type("i32"), $scope.stype("text")], function* as___2 ($0, $1) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = i32_to_text($r1);
  return $r0;
});

$meow.defun("as()/2", [$scope.type("i32"), $scope.stype("integer")], function* as___2 ($0, $1) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = i32_to_integer($r1);
  return $r0;
});

$meow.defun("as()/2", [$scope.type("i32"), $scope.stype("f64")], function* as___2 ($0, $1) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = i32_to_f64($r1);
  return $r0;
});
$meow.defun("as()/2", [$scope.type("i32"), $scope.stype("bool")], function* as___2 ($0, $1) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = i32_to_bool($r1);
  return $r0;
});

});
$meow.in_package(null, ($scope) => {
$meow.defun("+()/2", [$scope.type("f64"), $scope.type("f64")], function* $plus___2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = f64_add($r1, $r2);
  return $r0;
});

$meow.defun("-()/2", [$scope.type("f64"), $scope.type("f64")], function* ____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = f64_sub($r1, $r2);
  return $r0;
});

$meow.defun("*()/2", [$scope.type("f64"), $scope.type("f64")], function* $times___2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = f64_mul($r1, $r2);
  return $r0;
});

$meow.defun("\\()/2", [$scope.type("f64"), $scope.type("f64")], function* ____2 ($0, X) {
  let $r0;
  try {
    let $r1;
    let $r2;
    $r2 = X;
    let $r3;
    $r3 = $meow.f64(0);
    $r1 = yield* $meow.call("=/=()/2", $r2, $r3);
    if (!$r1) { throw $meow.assert_fail("non-zero-divisor", "Line 40, col 3:\n  39 | def f64 \\ (X: f64) -> f64 {\n> 40 |   assert X =/= 0.0f :: non-zero-divisor;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  41 |   primitive f64.idiv(self, X);\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("non-zero-divisor", String(e) + "\n\n" + "Line 40, col 3:\n  39 | def f64 \\ (X: f64) -> f64 {\n> 40 |   assert X =/= 0.0f :: non-zero-divisor;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  41 |   primitive f64.idiv(self, X);\n")
  }
  let $r4;
  $r4 = $0;
  let $r5;
  $r5 = X;
  $r0 = f64_idiv($r4, $r5);
  return $r0;
});

$meow.defun("/()/2", [$scope.type("f64"), $scope.type("f64")], function* $div___2 ($0, X) {
  let $r0;
  try {
    let $r1;
    let $r2;
    $r2 = X;
    let $r3;
    $r3 = $meow.f64(0);
    $r1 = yield* $meow.call("=/=()/2", $r2, $r3);
    if (!$r1) { throw $meow.assert_fail("non-zero-divisor", "Line 52, col 3:\n  51 | def f64 / (X: f64) -> f64 {\n> 52 |   assert X =/= 0.0f :: non-zero-divisor;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  53 |   primitive f64.div(self, X);\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("non-zero-divisor", String(e) + "\n\n" + "Line 52, col 3:\n  51 | def f64 / (X: f64) -> f64 {\n> 52 |   assert X =/= 0.0f :: non-zero-divisor;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  53 |   primitive f64.div(self, X);\n")
  }
  let $r4;
  $r4 = $0;
  let $r5;
  $r5 = X;
  $r0 = f64_div($r4, $r5);
  return $r0;
});

$meow.defun("**()/2", [$scope.type("f64"), $scope.type("f64")], function* $times____2 ($0, X) {
  let $r0;
  try {
    let $r1;
    let $r2;
    $r2 = X;
    let $r3;
    $r3 = $meow.f64(0);
    $r1 = yield* $meow.call(">=()/2", $r2, $r3);
    if (!$r1) { throw $meow.assert_fail("positive-exponent", "Line 59, col 3:\n  58 | def f64 ** (X: f64) -> f64 {\n> 59 |   assert X >= 0.0f :: positive-exponent;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  60 |   primitive f64.pow(self, X);\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("positive-exponent", String(e) + "\n\n" + "Line 59, col 3:\n  58 | def f64 ** (X: f64) -> f64 {\n> 59 |   assert X >= 0.0f :: positive-exponent;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  60 |   primitive f64.pow(self, X);\n")
  }
  let $r4;
  $r4 = $0;
  let $r5;
  $r5 = X;
  $r0 = f64_pow($r4, $r5);
  return $r0;
});

$meow.defun("%()/2", [$scope.type("f64"), $scope.type("f64")], function* $mod___2 ($0, X) {
  let $r0;
  try {
    let $r1;
    let $r2;
    $r2 = X;
    let $r3;
    $r3 = $meow.f64(0);
    $r1 = yield* $meow.call("=/=()/2", $r2, $r3);
    if (!$r1) { throw $meow.assert_fail("non-zero-divisor", "Line 71, col 3:\n  70 | def f64 % (X: f64) -> f64 {\n> 71 |   assert X =/= 0.0f :: non-zero-divisor;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  72 |   primitive f64.mod(self, X);\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("non-zero-divisor", String(e) + "\n\n" + "Line 71, col 3:\n  70 | def f64 % (X: f64) -> f64 {\n> 71 |   assert X =/= 0.0f :: non-zero-divisor;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  72 |   primitive f64.mod(self, X);\n")
  }
  let $r4;
  $r4 = $0;
  let $r5;
  $r5 = X;
  $r0 = f64_mod($r4, $r5);
  return $r0;
});

$meow.defun("===()/2", [$scope.type("f64"), $scope.type("f64")], function* ______2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = f64_eq($r1, $r2);
  return $r0;
});

$meow.defun("=/=()/2", [$scope.type("f64"), $scope.type("f64")], function* ______2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = f64_neq($r1, $r2);
  return $r0;
});

$meow.defun("<()/2", [$scope.type("f64"), $scope.type("f64")], function* ____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = f64_lt($r1, $r2);
  return $r0;
});

$meow.defun("<=()/2", [$scope.type("f64"), $scope.type("f64")], function* _____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = f64_lte($r1, $r2);
  return $r0;
});

$meow.defun(">()/2", [$scope.type("f64"), $scope.type("f64")], function* ____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = f64_gt($r1, $r2);
  return $r0;
});

$meow.defun(">=()/2", [$scope.type("f64"), $scope.type("f64")], function* _____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = f64_gte($r1, $r2);
  return $r0;
});

$meow.defun("compare-to(self:)/2", [$scope.type("f64"), $scope.type("f64")], function* compare_to_self___2 ($0, X) {
  let $r0;
  let $r1, $r2;
  let $r3;
  $r3 = $0;
  let $r4;
  $r4 = X;
  $r2 = yield* $meow.call("<()/2", $r3, $r4);
  if ($r2) {
    $r1 = $scope.get_variant("ordering", "less-than");
  } else {
    let $r5, $r6;
    let $r7;
    $r7 = $0;
    let $r8;
    $r8 = X;
    $r6 = yield* $meow.call("===()/2", $r7, $r8);
    if ($r6) {
      $r5 = $scope.get_variant("ordering", "equal");
    } else {
      let $r9, $r10;
      let $r11;
      $r11 = $0;
      let $r12;
      $r12 = X;
      $r10 = yield* $meow.call(">()/2", $r11, $r12);
      if ($r10) {
        $r9 = $scope.get_variant("ordering", "greater-than");
      } else {
        throw $meow.unreachable("no clause matched");
      }
      $r5 = $r9;
    }
    $r1 = $r5;
  }
  $r0 = $r1;
  return $r0;
});
$meow.defun("is-nan(self:)/1", [$scope.type("f64")], function* is_nan_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = f64_is_nan($r1);
  return $r0;
});

$meow.defun("is-finite(self:)/1", [$scope.type("f64")], function* is_finite_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = f64_is_finite($r1);
  return $r0;
});

$meow.defun("nan(self:)/1", [$scope.stype("f64")], function* nan_self___1 ($0) {
  let $r0;
  $r0 = f64_nan();
  return $r0;
});
$meow.defun("positive-infinity(self:)/1", [$scope.stype("f64")], function* positive_infinity_self___1 ($0) {
  let $r0;
  $r0 = f64_positive_inf();
  return $r0;
});
$meow.defun("negative-infinity(self:)/1", [$scope.stype("f64")], function* negative_infinity_self___1 ($0) {
  let $r0;
  $r0 = f64_negative_inf();
  return $r0;
});
$meow.defun("truncate(self:)/1", [$scope.type("f64")], function* truncate_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = f64_truncate($r1);
  return $r0;
});
$meow.defun("floor(self:)/1", [$scope.type("f64")], function* floor_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = f64_floor($r1);
  return $r0;
});
$meow.defun("ceiling(self:)/1", [$scope.type("f64")], function* ceiling_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = f64_ceiling($r1);
  return $r0;
});
$meow.defun("round(self:)/1", [$scope.type("f64")], function* round_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = f64_round($r1);
  return $r0;
});
$meow.defun("-()/1", [$scope.type("f64")], function* ____1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = f64_negate($r1);
  return $r0;
});

$meow.defun("absolute(self:)/1", [$scope.type("f64")], function* absolute_self___1 ($0) {
  let $r0;
  let $r1, $r2;
  let $r3;
  $r3 = $0;
  let $r4;
  $r4 = $meow.f64(0);
  $r2 = yield* $meow.call("<()/2", $r3, $r4);
  if ($r2) {
    let $r5;
    $r5 = $0;
    $r1 = yield* $meow.call("-()/1", $r5);
  } else {
    let $r6, $r7;
    $r7 = true;
    if ($r7) {
      $r6 = $0;
    } else {
      throw $meow.unreachable("no clause matched");
    }
    $r1 = $r6;
  }
  $r0 = $r1;
  return $r0;
});

$meow.defun("as()/2", [$scope.type("f64"), $scope.stype("text")], function* as___2 ($0, $1) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = f64_to_text($r1);
  return $r0;
});

$meow.defun("as()/2", [$scope.type("f64"), $scope.stype("i32")], function* as___2 ($0, $1) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = f64_to_i32($r1);
  return $r0;
});

$meow.defun("as()/2", [$scope.type("f64"), $scope.stype("integer")], function* as___2 ($0, $1) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = f64_to_integer($r1);
  return $r0;
});

$meow.defun("as()/2", [$scope.type("f64"), $scope.stype("bool")], function* as___2 ($0, $1) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = f64_to_bool($r1);
  return $r0;
});

$meow.defun("parse(self:)/2", [$scope.stype("f64"), $scope.type("text")], function* parse_self___2 ($0, Value) {
  let $r0;
  let $r1;
  $r1 = $scope.smake("maybe");
  let $r2;
  let $r3;
  $r3 = Value;
  $r2 = f64_parse($r3);
  $r0 = yield* $meow.call("from(self:nullable:)/2", $r1, $r2);
  return $r0;
});

});
$meow.in_package(null, ($scope) => {
$meow.defun("+()/2", [$scope.type("integer"), $scope.type("integer")], function* $plus___2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = integer_add($r1, $r2);
  return $r0;
});

$meow.defun("-()/2", [$scope.type("integer"), $scope.type("integer")], function* ____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = integer_sub($r1, $r2);
  return $r0;
});

$meow.defun("*()/2", [$scope.type("integer"), $scope.type("integer")], function* $times___2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = integer_mul($r1, $r2);
  return $r0;
});

$meow.defun("\\()/2", [$scope.type("integer"), $scope.type("integer")], function* ____2 ($0, X) {
  let $r0;
  try {
    let $r1;
    let $r2;
    $r2 = X;
    let $r3;
    $r3 = 0n;
    $r1 = yield* $meow.call("=/=()/2", $r2, $r3);
    if (!$r1) { throw $meow.assert_fail("non-zero-divisor", "Line 41, col 3:\n  40 | def integer \\ (X: integer) -> integer {\n> 41 |   assert X =/= 0 :: non-zero-divisor;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  42 |   primitive integer.div(self, X);\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("non-zero-divisor", String(e) + "\n\n" + "Line 41, col 3:\n  40 | def integer \\ (X: integer) -> integer {\n> 41 |   assert X =/= 0 :: non-zero-divisor;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  42 |   primitive integer.div(self, X);\n")
  }
  let $r4;
  $r4 = $0;
  let $r5;
  $r5 = X;
  $r0 = integer_div($r4, $r5);
  return $r0;
});

$meow.defun("**()/2", [$scope.type("integer"), $scope.type("integer")], function* $times____2 ($0, X) {
  let $r0;
  try {
    let $r1;
    let $r2;
    $r2 = X;
    let $r3;
    $r3 = 0n;
    $r1 = yield* $meow.call(">=()/2", $r2, $r3);
    if (!$r1) { throw $meow.assert_fail("positive-exponent", "Line 54, col 3:\n  53 | def integer ** (X: integer) -> integer {\n> 54 |   assert X >= 0 :: positive-exponent;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  55 |   primitive integer.pow(self, X);\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("positive-exponent", String(e) + "\n\n" + "Line 54, col 3:\n  53 | def integer ** (X: integer) -> integer {\n> 54 |   assert X >= 0 :: positive-exponent;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  55 |   primitive integer.pow(self, X);\n")
  }
  let $r4;
  $r4 = $0;
  let $r5;
  $r5 = X;
  $r0 = integer_pow($r4, $r5);
  return $r0;
});

$meow.defun("%()/2", [$scope.type("integer"), $scope.type("integer")], function* $mod___2 ($0, X) {
  let $r0;
  try {
    let $r1;
    let $r2;
    $r2 = X;
    let $r3;
    $r3 = 0n;
    $r1 = yield* $meow.call("=/=()/2", $r2, $r3);
    if (!$r1) { throw $meow.assert_fail("non-zero-divisor", "Line 67, col 3:\n  66 | def integer % (X: integer) -> integer {\n> 67 |   assert X =/= 0 :: non-zero-divisor;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  68 |   primitive integer.mod(self, X);\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("non-zero-divisor", String(e) + "\n\n" + "Line 67, col 3:\n  66 | def integer % (X: integer) -> integer {\n> 67 |   assert X =/= 0 :: non-zero-divisor;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  68 |   primitive integer.mod(self, X);\n")
  }
  let $r4;
  $r4 = $0;
  let $r5;
  $r5 = X;
  $r0 = integer_mod($r4, $r5);
  return $r0;
});

$meow.defun("===()/2", [$scope.type("integer"), $scope.type("integer")], function* ______2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = integer_eq($r1, $r2);
  return $r0;
});

$meow.defun("=/=()/2", [$scope.type("integer"), $scope.type("integer")], function* ______2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = integer_neq($r1, $r2);
  return $r0;
});

$meow.defun("<()/2", [$scope.type("integer"), $scope.type("integer")], function* ____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = integer_lt($r1, $r2);
  return $r0;
});

$meow.defun("<=()/2", [$scope.type("integer"), $scope.type("integer")], function* _____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = integer_lte($r1, $r2);
  return $r0;
});

$meow.defun(">()/2", [$scope.type("integer"), $scope.type("integer")], function* ____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = integer_gt($r1, $r2);
  return $r0;
});

$meow.defun(">=()/2", [$scope.type("integer"), $scope.type("integer")], function* _____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = integer_gte($r1, $r2);
  return $r0;
});

$meow.defun("compare-to(self:)/2", [$scope.type("integer"), $scope.type("integer")], function* compare_to_self___2 ($0, X) {
  let $r0;
  let $r1, $r2;
  let $r3;
  $r3 = $0;
  let $r4;
  $r4 = X;
  $r2 = yield* $meow.call("<()/2", $r3, $r4);
  if ($r2) {
    $r1 = $scope.get_variant("ordering", "less-than");
  } else {
    let $r5, $r6;
    let $r7;
    $r7 = $0;
    let $r8;
    $r8 = X;
    $r6 = yield* $meow.call("===()/2", $r7, $r8);
    if ($r6) {
      $r5 = $scope.get_variant("ordering", "equal");
    } else {
      let $r9, $r10;
      let $r11;
      $r11 = $0;
      let $r12;
      $r12 = X;
      $r10 = yield* $meow.call(">()/2", $r11, $r12);
      if ($r10) {
        $r9 = $scope.get_variant("ordering", "greater-than");
      } else {
        throw $meow.unreachable("no clause matched");
      }
      $r5 = $r9;
    }
    $r1 = $r5;
  }
  $r0 = $r1;
  return $r0;
});
$meow.defun("<<()/2", [$scope.type("integer"), $scope.type("integer")], function* _____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = integer_bshl($r1, $r2);
  return $r0;
});

$meow.defun(">>()/2", [$scope.type("integer"), $scope.type("integer")], function* $bashr___2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = integer_bashr($r1, $r2);
  return $r0;
});

$meow.defun("&()/2", [$scope.type("integer"), $scope.type("integer")], function* ____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = integer_band($r1, $r2);
  return $r0;
});

$meow.defun("|()/2", [$scope.type("integer"), $scope.type("integer")], function* ____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = integer_bor($r1, $r2);
  return $r0;
});

$meow.defun("^()/2", [$scope.type("integer"), $scope.type("integer")], function* ____2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = integer_bxor($r1, $r2);
  return $r0;
});

$meow.defun("~()/1", [$scope.type("integer")], function* ____1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = integer_bnot($r1);
  return $r0;
});

$meow.defun("-()/1", [$scope.type("integer")], function* ____1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = integer_negate($r1);
  return $r0;
});

$meow.defun("absolute(self:)/1", [$scope.type("integer")], function* absolute_self___1 ($0) {
  let $r0;
  let $r1, $r2;
  let $r3;
  $r3 = $0;
  let $r4;
  $r4 = 0n;
  $r2 = yield* $meow.call("<()/2", $r3, $r4);
  if ($r2) {
    let $r5;
    $r5 = $0;
    $r1 = yield* $meow.call("-()/1", $r5);
  } else {
    let $r6, $r7;
    $r7 = true;
    if ($r7) {
      $r6 = $0;
    } else {
      throw $meow.unreachable("no clause matched");
    }
    $r1 = $r6;
  }
  $r0 = $r1;
  return $r0;
});

$meow.defun("as()/2", [$scope.type("integer"), $scope.stype("text")], function* as___2 ($0, $1) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = integer_to_text($r1);
  return $r0;
});

$meow.defun("as()/2", [$scope.type("integer"), $scope.stype("i32")], function* as___2 ($0, $1) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = integer_to_i32($r1);
  return $r0;
});
$meow.defun("as()/2", [$scope.type("integer"), $scope.stype("f64")], function* as___2 ($0, $1) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = integer_to_f64($r1);
  return $r0;
});
$meow.defun("as()/2", [$scope.type("integer"), $scope.stype("bool")], function* as___2 ($0, $1) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = integer_to_bool($r1);
  return $r0;
});
});
});
$meow.in_package(null, ($scope) => {
$meow.in_package(null, ($scope) => {
$meow.defun("of(self:)/2", [$scope.stype("cell"), $meow.type("unknown")], function* of_self___2 ($0, Value) {
  let $r0;
  let $r1;
  $r1 = Value;
  $r0 = cell_new($r1);
  return $r0;
});
$meow.defun("empty(self:)/1", [$scope.stype("cell")], function* empty_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $scope.smake("cell");
  let $r2;
  $r2 = null;
  $r0 = yield* $meow.call("of(self:)/2", $r1, $r2);
  return $r0;
});
$meow.defun("read(self:)/1", [$scope.type("cell")], function* read_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = cell_deref($r1);
  return $r0;
});
$meow.defun("<-()/2", [$scope.type("cell"), $meow.type("unknown")], function* $xgh___2 ($0, Value) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Value;
  $r0 = cell_exchange($r1, $r2);
  return $r0;
});
$meow.defun("set(self:if-contains:)/3", [$scope.type("cell"), $meow.type("unknown"), $meow.type("unknown")], function* set_self_if_contains___3 ($0, Value, Old) {
  let $r0;
  let $r1;
  let $r2;
  $r2 = $0;
  let $r3;
  $r3 = Value;
  $r1 = yield* $meow.call("<-()/2", $r2, $r3);
  const Got = $r1
  let $r4, $r5;
  let $r6;
  $r6 = Got;
  let $r7;
  $r7 = Old;
  $r5 = $meow.eq($r6, $r7);
  if ($r5) {
    $r4 = true;
  } else {
    let $r8, $r9;
    $r9 = true;
    if ($r9) {
      let $r10;
      $r10 = $0;
      let $r11;
      $r11 = Got;
      yield* $meow.call("<-()/2", $r10, $r11)
      $r8 = false;
    } else {
      throw $meow.unreachable("no clause matched");
    }
    $r4 = $r8;
  }
  $r0 = $r4;
  return $r0;
});


});
$meow.in_package(null, ($scope) => {
$meow.defun("of(self:)/2", [$scope.stype("weak-ref"), $meow.type("unknown")], function* of_self___2 ($0, Value) {
  let $r0;
  let $r1;
  $r1 = Value;
  $r0 = weak_ref_new($r1);
  return $r0;
});
$meow.defun("read(self:)/1", [$scope.type("weak-ref")], function* read_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $scope.smake("maybe");
  let $r2;
  let $r3;
  $r3 = $0;
  $r2 = weak_ref_deref($r3);
  $r0 = yield* $meow.call("from(self:nullable:)/2", $r1, $r2);
  return $r0;
});

});
});
$meow.in_package(null, ($scope) => {
$meow.in_package(null, ($scope) => {
$meow.defun("count-code-units(self:)/1", [$scope.type("text")], function* count_code_units_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = text_count_code_units($r1);
  return $r0;
});
$meow.defun("replicate(self:)/2", [$scope.type("text"), $scope.type("i32")], function* replicate_self___2 ($0, Times) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Times;
  $r0 = text_repeat($r1, $r2);
  return $r0;
});

$meow.defun("++()/2", [$scope.type("text"), $scope.type("text")], function* $cat___2 ($0, Part) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Part;
  $r0 = text_concat($r1, $r2);
  return $r0;
});

$meow.defun("from-utf8-bytes(self:)/2", [$scope.stype("text"), $scope.type("byte-array")], function* from_utf8_bytes_self___2 ($0, Bytes) {
  let $r0;
  let $r1;
  $r1 = $scope.smake("maybe");
  let $r2;
  let $r3;
  $r3 = Bytes;
  $r2 = text_from_utf8_bytes($r3);
  $r0 = yield* $meow.call("from(self:nullable:)/2", $r1, $r2);
  return $r0;
});
$meow.defun("from-utf16-code-points(self:)/2", [$scope.stype("text"), $scope.type("array")], function* from_utf16_code_points_self___2 ($0, Code_points) {
  let $r0;
  let $r1;
  $r1 = $scope.smake("maybe");
  let $r2;
  let $r3;
  $r3 = Code_points;
  $r2 = text_from_utf16_code_points($r3);
  $r0 = yield* $meow.call("from(self:nullable:)/2", $r1, $r2);
  return $r0;
});
$meow.defun("slice(self:from:to:)/3", [$scope.type("text"), $scope.type("i32"), $scope.type("i32")], function* slice_self_from_to___3 ($0, Start, End) {
  let $r0;
  try {
    let $r1;
    let $r2;
    $r2 = Start;
    let $r3;
    $r3 = (0 | 0);
    $r1 = yield* $meow.call(">=()/2", $r2, $r3);
    if (!$r1) { throw $meow.assert_fail("positive-start", "Line 36, col 3:\n  35 | def text slice(from Start: i32, to End: i32) -> text {\n> 36 |   assert Start >= 0n :: positive-start;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  37 |   assert End >= Start :: positive-slice;\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("positive-start", String(e) + "\n\n" + "Line 36, col 3:\n  35 | def text slice(from Start: i32, to End: i32) -> text {\n> 36 |   assert Start >= 0n :: positive-start;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  37 |   assert End >= Start :: positive-slice;\n")
  }
  try {
    let $r4;
    let $r5;
    $r5 = End;
    let $r6;
    $r6 = Start;
    $r4 = yield* $meow.call(">=()/2", $r5, $r6);
    if (!$r4) { throw $meow.assert_fail("positive-slice", "Line 37, col 3:\n  36 |   assert Start >= 0n :: positive-start;\n> 37 |   assert End >= Start :: positive-slice;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  38 |   primitive text.slice(self, Start, End);\n"); }
    $r4
  } catch (e) {
  throw $meow.assert_fail("positive-slice", String(e) + "\n\n" + "Line 37, col 3:\n  36 |   assert Start >= 0n :: positive-start;\n> 37 |   assert End >= Start :: positive-slice;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  38 |   primitive text.slice(self, Start, End);\n")
  }
  let $r7;
  $r7 = $0;
  let $r8;
  $r8 = Start;
  let $r9;
  $r9 = End;
  $r0 = text_slice($r7, $r8, $r9);
  return $r0;
});

$meow.defun("slice(self:from:)/2", [$scope.type("text"), $scope.type("i32")], function* slice_self_from___2 ($0, Start) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Start;
  $r0 = text_slice_from($r1, $r2);
  return $r0;
});

$meow.defun("is-empty(self:)/1", [$scope.type("text")], function* is_empty_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = "";
  $r0 = $meow.eq($r1, $r2);
  return $r0;
});

$meow.defun("ends-with(self:)/2", [$scope.type("text"), $scope.type("text")], function* ends_with_self___2 ($0, Part) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Part;
  $r0 = text_ends_with($r1, $r2);
  return $r0;
});

$meow.defun("starts-with(self:)/2", [$scope.type("text"), $scope.type("text")], function* starts_with_self___2 ($0, Part) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Part;
  $r0 = text_starts_with($r1, $r2);
  return $r0;
});

$meow.defun("contains(self:)/2", [$scope.type("text"), $scope.type("text")], function* contains_self___2 ($0, Part) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Part;
  $r0 = text_contains($r1, $r2);
  return $r0;
});

$meow.defun("trim-start(self:)/1", [$scope.type("text")], function* trim_start_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = text_trim_start($r1);
  return $r0;
});

$meow.defun("trim-end(self:)/1", [$scope.type("text")], function* trim_end_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = text_trim_end($r1);
  return $r0;
});

$meow.defun("trim(self:)/1", [$scope.type("text")], function* trim_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = text_trim($r1);
  return $r0;
});

$meow.defun("utf8-bytes(self:)/1", [$scope.type("text")], function* utf8_bytes_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = text_utf8_bytes($r1);
  return $r0;
});
$meow.defun("utf16-code-points(self:)/1", [$scope.type("text")], function* utf16_code_points_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = text_utf16_code_points($r1);
  return $r0;
});
$meow.defun("graphemes(self:)/1", [$scope.type("text")], function* graphemes_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = text_graphemes($r1);
  return $r0;
});
$meow.defun("lines(self:)/1", [$scope.type("text")], function* lines_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = text_lines($r1);
  return $r0;
});
});
});
$meow.in_package(null, ($scope) => {
$meow.in_package(null, ($scope) => {
$meow.defun("===()/2", [$scope.type("array"), $scope.type("array")], function* ______2 ($0, X) {
  let $r0;
  let $r1, $r2;
  let $r3;
  let $r4;
  $r4 = $0;
  $r3 = yield* $meow.call("count(self:)/1", $r4);
  let $r5;
  let $r6;
  $r6 = X;
  $r5 = yield* $meow.call("count(self:)/1", $r6);
  $r2 = yield* $meow.call("=/=()/2", $r3, $r5);
  if ($r2) {
    $r1 = false;
  } else {
    let $r7, $r8;
    $r8 = true;
    if ($r8) {
      let $r9;
      $r9 = $0;
      let $r10;
      $r10 = X;
      let $r11;
      $r11 = (function* (A, B) {
        let $r0;
        let $r1;
        $r1 = A;
        let $r2;
        $r2 = B;
        $r0 = yield* $meow.call("===()/2", $r1, $r2);
        return $r0;
      });
      $r7 = yield* $meow.call("zip(self:with:)/3", $r9, $r10, $r11);
    } else {
      throw $meow.unreachable("no clause matched");
    }
    $r1 = $r7;
  }
  $r0 = $r1;
  return $r0;
});
$meow.defun("contains(self:)/2", [$scope.type("array"), $scope.type("unknown")], function* contains_self___2 ($0, Value) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = (function* (X) {
    let $r0;
    let $r1;
    $r1 = X;
    let $r2;
    $r2 = Value;
    $r0 = $meow.eq($r1, $r2);
    return $r0;
  });
  $r0 = yield* $meow.call("some(self:)/2", $r1, $r2);
  return $r0;
});
$meow.defun("count(self:)/1", [$scope.type("array")], function* count_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = array_count($r1);
  return $r0;
});
$meow.defun("is-empty(self:)/1", [$scope.type("array")], function* is_empty_self___1 ($0) {
  let $r0;
  let $r1;
  let $r2;
  $r2 = $0;
  $r1 = yield* $meow.call("count(self:)/1", $r2);
  let $r3;
  $r3 = (0 | 0);
  $r0 = yield* $meow.call("===()/2", $r1, $r3);
  return $r0;
});
$meow.defun("first!(self:)/1", [$scope.type("array")], function* first__self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = (0 | 0);
  $r0 = yield* $meow.call("at!(self:)/2", $r1, $r2);
  return $r0;
});
$meow.defun("rest(self:)/1", [$scope.type("array")], function* rest_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = 1n;
  $r0 = yield* $meow.call("slice(self:from:)/2", $r1, $r2);
  return $r0;
});
$meow.defun("last!(self:)/1", [$scope.type("array")], function* last__self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  let $r3;
  let $r4;
  $r4 = $0;
  $r3 = yield* $meow.call("count(self:)/1", $r4);
  let $r5;
  $r5 = 1n;
  $r2 = yield* $meow.call("-()/2", $r3, $r5);
  $r0 = yield* $meow.call("at!(self:)/2", $r1, $r2);
  return $r0;
});
$meow.defun("without-last(self:)/1", [$scope.type("array")], function* without_last_self___1 ($0) {
  let $r0;
  let $r1, $r2;
  let $r3;
  let $r4;
  $r4 = $0;
  $r3 = yield* $meow.call("count(self:)/1", $r4);
  let $r5;
  $r5 = (2 | 0);
  $r2 = yield* $meow.call("<()/2", $r3, $r5);
  if ($r2) {
    $r1 = [];
  } else {
    let $r6, $r7;
    $r7 = true;
    if ($r7) {
      let $r8;
      $r8 = $0;
      let $r9;
      $r9 = (0 | 0);
      let $r10;
      let $r11;
      let $r12;
      $r12 = $0;
      $r11 = yield* $meow.call("count(self:)/1", $r12);
      let $r13;
      $r13 = (1 | 0);
      $r10 = yield* $meow.call("-()/2", $r11, $r13);
      $r6 = yield* $meow.call("slice(self:from:to:)/3", $r8, $r9, $r10);
    } else {
      throw $meow.unreachable("no clause matched");
    }
    $r1 = $r6;
  }
  $r0 = $r1;
  return $r0;
});
$meow.defun("++()/2", [$scope.type("array"), $scope.type("array")], function* $cat___2 ($0, That) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = That;
  $r0 = array_concat($r1, $r2);
  return $r0;
});
$meow.defun("append(self:)/2", [$scope.type("array"), $meow.type("unknown")], function* append_self___2 ($0, Value) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  let $r3;
  $r3 = Value;
  $r2 = [$r3];
  $r0 = yield* $meow.call("++()/2", $r1, $r2);
  return $r0;
});
$meow.defun("prepend(self:)/2", [$scope.type("array"), $meow.type("unknown")], function* prepend_self___2 ($0, Value) {
  let $r0;
  let $r1;
  let $r2;
  $r2 = Value;
  $r1 = [$r2];
  let $r3;
  $r3 = $0;
  $r0 = yield* $meow.call("++()/2", $r1, $r3);
  return $r0;
});
$meow.defun("empty(self:)/1", [$scope.stype("array")], function* empty_self___1 ($0) {
  let $r0;
  $r0 = [];
  return $r0;
});
$meow.defun("at!(self:)/2", [$scope.type("array"), $scope.type("i32")], function* at__self___2 ($0, Index) {
  let $r0;
  try {
    let $r1;
    let $r2;
    let $r3;
    $r3 = Index;
    let $r4;
    $r4 = (0 | 0);
    $r2 = yield* $meow.call(">=()/2", $r3, $r4);
    let $r5;
    let $r6;
    $r6 = Index;
    let $r7;
    let $r8;
    $r8 = $0;
    $r7 = yield* $meow.call("count(self:)/1", $r8);
    $r5 = yield* $meow.call("<()/2", $r6, $r7);
    $r1 = yield* $meow.call("and()/2", $r2, $r5);
    if (!$r1) { throw $meow.assert_fail("in-range", "Line 65, col 3:\n  64 | def array<T> at!(Index: i32) -> T {\n> 65 |   assert (Index >= 0n) and (Index < self count()) :: in-range;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  66 |   primitive array.at(self, Index);\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("in-range", String(e) + "\n\n" + "Line 65, col 3:\n  64 | def array<T> at!(Index: i32) -> T {\n> 65 |   assert (Index >= 0n) and (Index < self count()) :: in-range;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  66 |   primitive array.at(self, Index);\n")
  }
  let $r9;
  $r9 = $0;
  let $r10;
  $r10 = Index;
  $r0 = array_at($r9, $r10);
  return $r0;
});
$meow.defun("remove(self:at:)/2", [$scope.type("array"), $scope.type("i32")], function* remove_self_at___2 ($0, Index) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Index;
  $r0 = array_remove_at($r1, $r2);
  return $r0;
});
$meow.defun("insert(self:before:)/3", [$scope.type("array"), $meow.type("unknown"), $scope.type("i32")], function* insert_self_before___3 ($0, Value, Index) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Index;
  let $r3;
  $r3 = Value;
  $r0 = array_insert_before($r1, $r2, $r3);
  return $r0;
});
$meow.defun("insert(self:after:)/3", [$scope.type("array"), $meow.type("unknown"), $scope.type("i32")], function* insert_self_after___3 ($0, Value, Index) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Index;
  let $r3;
  $r3 = Value;
  $r0 = array_insert_after($r1, $r2, $r3);
  return $r0;
});
$meow.defun("put(self:at:)/3", [$scope.type("array"), $meow.type("unknown"), $scope.type("i32")], function* put_self_at___3 ($0, Value, Index) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Index;
  let $r3;
  $r3 = Value;
  $r0 = array_at_put($r1, $r2, $r3);
  return $r0;
});
$meow.defun("reverse(self:)/1", [$scope.type("array")], function* reverse_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = array_reverse($r1);
  return $r0;
});
$meow.defun("slice(self:from:to:)/3", [$scope.type("array"), $scope.type("i32"), $scope.type("i32")], function* slice_self_from_to___3 ($0, Start, End) {
  let $r0;
  try {
    let $r1;
    let $r2;
    $r2 = Start;
    let $r3;
    $r3 = (0 | 0);
    $r1 = yield* $meow.call(">=()/2", $r2, $r3);
    if (!$r1) { throw $meow.assert_fail("positive-start", "Line 94, col 3:\n  93 | def array slice(from Start: i32, to End: i32) -> array {\n> 94 |   assert Start >= 0n :: positive-start;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  95 |   assert End >= Start :: positive-slice;\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("positive-start", String(e) + "\n\n" + "Line 94, col 3:\n  93 | def array slice(from Start: i32, to End: i32) -> array {\n> 94 |   assert Start >= 0n :: positive-start;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  95 |   assert End >= Start :: positive-slice;\n")
  }
  try {
    let $r4;
    let $r5;
    $r5 = End;
    let $r6;
    $r6 = Start;
    $r4 = yield* $meow.call(">=()/2", $r5, $r6);
    if (!$r4) { throw $meow.assert_fail("positive-slice", "Line 95, col 3:\n  94 |   assert Start >= 0n :: positive-start;\n> 95 |   assert End >= Start :: positive-slice;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  96 |   primitive array.slice(self, Start, End);\n"); }
    $r4
  } catch (e) {
  throw $meow.assert_fail("positive-slice", String(e) + "\n\n" + "Line 95, col 3:\n  94 |   assert Start >= 0n :: positive-start;\n> 95 |   assert End >= Start :: positive-slice;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  96 |   primitive array.slice(self, Start, End);\n")
  }
  let $r7;
  $r7 = $0;
  let $r8;
  $r8 = Start;
  let $r9;
  $r9 = End;
  $r0 = array_slice($r7, $r8, $r9);
  return $r0;
});
$meow.defun("slice(self:from:)/2", [$scope.type("array"), $scope.type("i32")], function* slice_self_from___2 ($0, Start) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Start;
  $r0 = array_slice_from($r1, $r2);
  return $r0;
});
$meow.defun("slice(self:to:)/2", [$scope.type("array"), $scope.type("i32")], function* slice_self_to___2 ($0, End) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = End;
  $r0 = array_slice_to($r1, $r2);
  return $r0;
});
$meow.defun("sort(self:by:)/2", [$scope.type("array"), $scope.type("lambda-2")], function* sort_self_by___2 ($0, Compare) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = (function* (A, B) {
    let $r0;
    let $r1;
    let $r2;
    $r2 = Compare;
    let $r3;
    $r3 = A;
    let $r4;
    $r4 = B;
    $r1 = yield* $r2($r3, $r4);
    let $r5;
    $r5 = $scope.smake("i32");
    $r0 = yield* $meow.call("as()/2", $r1, $r5);
    return $r0;
  });
  $r0 = array_sort_by($r1, $r2);
  return $r0;
});
$meow.defun("sort(self:)/1", [$scope.type("array")], function* sort_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = (function* (A, B) {
    let $r0;
    let $r1;
    $r1 = A;
    let $r2;
    $r2 = B;
    $r0 = yield* $meow.call("compare-to(self:)/2", $r1, $r2);
    return $r0;
  });
  $r0 = yield* $meow.call("sort(self:by:)/2", $r1, $r2);
  return $r0;
});
$meow.defun("map(self:)/2", [$scope.type("array"), $scope.type("lambda-1")], function* map_self___2 ($0, Fn) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Fn;
  $r0 = array_map($r1, $r2);
  return $r0;
});
$meow.defun("flat-map(self:)/2", [$scope.type("array"), $scope.type("lambda-1")], function* flat_map_self___2 ($0, Fn) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Fn;
  $r0 = array_flat_map($r1, $r2);
  return $r0;
});
$meow.defun("flatten-once(self:)/1", [$scope.type("array")], function* flatten_once_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = (function* (X) {
    let $r0;
    $r0 = X;
    return $r0;
  });
  $r0 = yield* $meow.call("flat-map(self:)/2", $r1, $r2);
  return $r0;
});
$meow.defun("keep-if(self:)/2", [$scope.type("array"), $scope.type("lambda-1")], function* keep_if_self___2 ($0, Fn) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Fn;
  $r0 = array_filter($r1, $r2);
  return $r0;
});
$meow.defun("remove-if(self:)/2", [$scope.type("array"), $scope.type("lambda-1")], function* remove_if_self___2 ($0, Fn) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = (function* (X) {
    let $r0;
    let $r1;
    let $r2;
    $r2 = Fn;
    let $r3;
    $r3 = X;
    $r1 = yield* $r2($r3);
    $r0 = yield* $meow.call("not()/1", $r1);
    return $r0;
  });
  $r0 = yield* $meow.call("keep-if(self:)/2", $r1, $r2);
  return $r0;
});
$meow.defun("fold(self:from:with:)/3", [$scope.type("array"), $scope.type("unknown"), $scope.type("lambda-2")], function* fold_self_from_with___3 ($0, Init, Fn) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Init;
  let $r3;
  $r3 = Fn;
  $r0 = array_fold_left($r1, $r2, $r3);
  return $r0;
});
$meow.defun("fold-right(self:from:with:)/3", [$scope.type("array"), $scope.type("unknown"), $scope.type("lambda-2")], function* fold_right_self_from_with___3 ($0, Init, Fn) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Init;
  let $r3;
  $r3 = Fn;
  $r0 = array_fold_right($r1, $r2, $r3);
  return $r0;
});
$meow.defun("fold(self:with:)/2", [$scope.type("array"), $scope.type("lambda-2")], function* fold_self_with___2 ($0, Fn) {
  let $r0;
  try {
    let $r1;
    let $r2;
    let $r3;
    $r3 = $0;
    $r2 = yield* $meow.call("is-empty(self:)/1", $r3);
    $r1 = yield* $meow.call("not()/1", $r2);
    if (!$r1) { throw $meow.assert_fail(null, "Line 149, col 3:\n  148 | def array fold(with Fn: lambda-2) -> unknown {\n> 149 |   assert not self is-empty();\n          ^~~~~~~~~~~~~~~~~~~~~~~~~~\n  150 |   self rest() fold(from: self first(), with: Fn);\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail(null, String(e) + "\n\n" + "Line 149, col 3:\n  148 | def array fold(with Fn: lambda-2) -> unknown {\n> 149 |   assert not self is-empty();\n          ^~~~~~~~~~~~~~~~~~~~~~~~~~\n  150 |   self rest() fold(from: self first(), with: Fn);\n")
  }
  let $r4;
  let $r5;
  $r5 = $0;
  $r4 = yield* $meow.call("rest(self:)/1", $r5);
  let $r6;
  let $r7;
  $r7 = $0;
  $r6 = yield* $meow.call("first(self:)/1", $r7);
  let $r8;
  $r8 = Fn;
  $r0 = yield* $meow.call("fold(self:from:with:)/3", $r4, $r6, $r8);
  return $r0;
});
$meow.defun("fold-right(self:with:)/2", [$scope.type("array"), $scope.type("lambda-2")], function* fold_right_self_with___2 ($0, Fn) {
  let $r0;
  try {
    let $r1;
    let $r2;
    let $r3;
    $r3 = $0;
    $r2 = yield* $meow.call("is-empty(self:)/1", $r3);
    $r1 = yield* $meow.call("not()/1", $r2);
    if (!$r1) { throw $meow.assert_fail(null, "Line 154, col 3:\n  153 | def array fold-right(with Fn: lambda-2) -> unknown {\n> 154 |   assert not self is-empty();\n          ^~~~~~~~~~~~~~~~~~~~~~~~~~\n  155 |   self rest() fold-right(from: self last(), with: Fn);\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail(null, String(e) + "\n\n" + "Line 154, col 3:\n  153 | def array fold-right(with Fn: lambda-2) -> unknown {\n> 154 |   assert not self is-empty();\n          ^~~~~~~~~~~~~~~~~~~~~~~~~~\n  155 |   self rest() fold-right(from: self last(), with: Fn);\n")
  }
  let $r4;
  let $r5;
  $r5 = $0;
  $r4 = yield* $meow.call("rest(self:)/1", $r5);
  let $r6;
  let $r7;
  $r7 = $0;
  $r6 = yield* $meow.call("last(self:)/1", $r7);
  let $r8;
  $r8 = Fn;
  $r0 = yield* $meow.call("fold-right(self:from:with:)/3", $r4, $r6, $r8);
  return $r0;
});
$meow.defun("all(self:)/2", [$scope.type("array"), $scope.type("lambda-1")], function* all_self___2 ($0, Fn) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Fn;
  $r0 = array_every($r1, $r2);
  return $r0;
});
$meow.defun("some(self:)/2", [$scope.type("array"), $scope.type("lambda-1")], function* some_self___2 ($0, Fn) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Fn;
  $r0 = array_some($r1, $r2);
  return $r0;
});
$meow.defun("none(self:)/2", [$scope.type("array"), $scope.type("lambda-1")], function* none_self___2 ($0, Fn) {
  let $r0;
  let $r1;
  let $r2;
  $r2 = $0;
  let $r3;
  $r3 = Fn;
  $r1 = yield* $meow.call("all(self:)/2", $r2, $r3);
  $r0 = yield* $meow.call("not()/1", $r1);
  return $r0;
});
$meow.defun("zip(self:with:)/3", [$scope.type("array"), $scope.type("array"), $scope.type("lambda-2")], function* zip_self_with___3 ($0, That, Combine) {
  let $r0;
  try {
    let $r1;
    let $r2;
    let $r3;
    $r3 = $0;
    $r2 = yield* $meow.call("count(self:)/1", $r3);
    let $r4;
    let $r5;
    $r5 = That;
    $r4 = yield* $meow.call("count(self:)/1", $r5);
    $r1 = yield* $meow.call("===()/2", $r2, $r4);
    if (!$r1) { throw $meow.assert_fail(null, "Line 172, col 3:\n  171 | def array zip(That: array, with Combine: lambda-2) -> array {\n> 172 |   assert self count() === That count();\n          ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  173 |   primitive array.zip-with(self, That, Combine);\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail(null, String(e) + "\n\n" + "Line 172, col 3:\n  171 | def array zip(That: array, with Combine: lambda-2) -> array {\n> 172 |   assert self count() === That count();\n          ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  173 |   primitive array.zip-with(self, That, Combine);\n")
  }
  let $r6;
  $r6 = $0;
  let $r7;
  $r7 = That;
  let $r8;
  $r8 = Combine;
  $r0 = array_zip_with($r6, $r7, $r8);
  return $r0;
});
$meow.defun("add(self:)/2", [$scope.type("array"), $scope.type("unknown")], function* add_self___2 ($0, Value) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Value;
  $r0 = yield* $meow.call("append(self:)/2", $r1, $r2);
  return $r0;
});
$meow.defun("remove(self:)/2", [$scope.type("array"), $scope.type("unknown")], function* remove_self___2 ($0, Value) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = (function* (X) {
    let $r0;
    let $r1;
    $r1 = X;
    let $r2;
    $r2 = Value;
    $r0 = $meow.eq($r1, $r2);
    return $r0;
  });
  $r0 = yield* $meow.call("remove-if(self:)/2", $r1, $r2);
  return $r0;
});
$meow.defun("as()/2", [$scope.type("array"), $scope.stype("stream")], function* as___2 ($0, $1) {
  let $r0;
  let $r1;
  $r1 = $scope.smake("stream");
  let $r2;
  $r2 = $0;
  $r0 = yield* $meow.call("from(self:)/2", $r1, $r2);
  return $r0;
});
});
$meow.in_package(null, ($scope) => {
$meow.in_package(null, ($scope) => {
$meow.defun("count(self:)/1", [$scope.type("byte-array")], function* count_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = binary_count($r1);
  return $r0;
});

$meow.defun("allocate(self:size:default:)/3", [$scope.stype("byte-array"), $scope.type("i32"), $scope.type("i32")], function* allocate_self_size_default___3 ($0, Size, Default) {
  let $r0;
  let $r1;
  $r1 = Size;
  let $r2;
  $r2 = Default;
  $r0 = binary_allocate($r1, $r2);
  return $r0;
});

$meow.defun("allocate(self:size:)/2", [$scope.stype("byte-array"), $scope.type("i32")], function* allocate_self_size___2 ($0, Size) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Size;
  let $r3;
  $r3 = (0 | 0);
  $r0 = yield* $meow.call("allocate(self:size:default:)/3", $r1, $r2, $r3);
  return $r0;
});

$meow.defun("from(self:)/2", [$scope.stype("byte-array"), $scope.type("array")], function* from_self___2 ($0, Array) {
  let $r0;
  let $r1;
  $r1 = Array;
  $r0 = binary_from_array($r1);
  return $r0;
});

$meow.defun("concat(self:)/2", [$scope.stype("byte-array"), $scope.type("array")], function* concat_self___2 ($0, Arrays) {
  let $r0;
  let $r1;
  $r1 = Arrays;
  $r0 = binary_concat($r1);
  return $r0;
});

$meow.defun("at!(self:)/2", [$scope.type("byte-array"), $scope.type("i32")], function* at__self___2 ($0, Index) {
  let $r0;
  try {
    let $r1;
    let $r2;
    let $r3;
    $r3 = Index;
    let $r4;
    $r4 = (0 | 0);
    $r2 = yield* $meow.call(">=()/2", $r3, $r4);
    let $r5;
    let $r6;
    $r6 = Index;
    let $r7;
    let $r8;
    $r8 = $0;
    $r7 = yield* $meow.call("count(self:)/1", $r8);
    $r5 = yield* $meow.call("<()/2", $r6, $r7);
    $r1 = yield* $meow.call("and()/2", $r2, $r5);
    if (!$r1) { throw $meow.assert_fail("in-bounds", "Line 39, col 3:\n  38 | def byte-array at!(Index: i32) -> i32 {\n> 39 |   assert (Index >= 0n) and (Index < self count()) :: in-bounds;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  40 |   primitive binary.at(self, Index);\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("in-bounds", String(e) + "\n\n" + "Line 39, col 3:\n  38 | def byte-array at!(Index: i32) -> i32 {\n> 39 |   assert (Index >= 0n) and (Index < self count()) :: in-bounds;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  40 |   primitive binary.at(self, Index);\n")
  }
  let $r9;
  $r9 = $0;
  let $r10;
  $r10 = Index;
  $r0 = binary_at($r9, $r10);
  return $r0;
});

$meow.defun("at(self:)/2", [$scope.type("byte-array"), $scope.type("i32")], function* at_self___2 ($0, Index) {
  let $r0;
  let $r1, $r2;
  let $r3;
  $r3 = Index;
  let $r4;
  $r4 = (0 | 0);
  $r2 = yield* $meow.call("<()/2", $r3, $r4);
  if ($r2) {
    $r1 = $scope.get_variant("maybe", "none");
  } else {
    let $r5, $r6;
    let $r7;
    $r7 = Index;
    let $r8;
    let $r9;
    $r9 = $0;
    $r8 = yield* $meow.call("count(self:)/1", $r9);
    $r6 = yield* $meow.call(">=()/2", $r7, $r8);
    if ($r6) {
      $r5 = $scope.get_variant("maybe", "none");
    } else {
      let $r10, $r11;
      $r11 = true;
      if ($r11) {
        let $r12;
        $r12 = $scope.smake("maybe");
        let $r13;
        let $r14;
        $r14 = $0;
        let $r15;
        $r15 = Index;
        $r13 = yield* $meow.call("at!(self:)/2", $r14, $r15);
        $r10 = yield* $meow.call("of(self:)/2", $r12, $r13);
      } else {
        throw $meow.unreachable("no clause matched");
      }
      $r5 = $r10;
    }
    $r1 = $r5;
  }
  $r0 = $r1;
  return $r0;
});

$meow.defun("slice(self:from:length:)/3", [$scope.type("byte-array"), $scope.type("i32"), $scope.type("i32")], function* slice_self_from_length___3 ($0, Start, Length) {
  let $r0;
  try {
    let $r1;
    let $r2;
    $r2 = Length;
    let $r3;
    $r3 = (0 | 0);
    $r1 = yield* $meow.call(">=()/2", $r2, $r3);
    if (!$r1) { throw $meow.assert_fail("positive-slice", "Line 60, col 3:\n  59 | def byte-array slice(from Start: i32, length Length: i32) -> byte-slice {\n> 60 |   assert Length >= 0n :: positive-slice;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  61 |   assert (Start >= 0n) and ((Start + Length) <= self count()) :: in-bounds;\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("positive-slice", String(e) + "\n\n" + "Line 60, col 3:\n  59 | def byte-array slice(from Start: i32, length Length: i32) -> byte-slice {\n> 60 |   assert Length >= 0n :: positive-slice;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  61 |   assert (Start >= 0n) and ((Start + Length) <= self count()) :: in-bounds;\n")
  }
  try {
    let $r4;
    let $r5;
    let $r6;
    $r6 = Start;
    let $r7;
    $r7 = (0 | 0);
    $r5 = yield* $meow.call(">=()/2", $r6, $r7);
    let $r8;
    let $r9;
    let $r10;
    $r10 = Start;
    let $r11;
    $r11 = Length;
    $r9 = yield* $meow.call("+()/2", $r10, $r11);
    let $r12;
    let $r13;
    $r13 = $0;
    $r12 = yield* $meow.call("count(self:)/1", $r13);
    $r8 = yield* $meow.call("<=()/2", $r9, $r12);
    $r4 = yield* $meow.call("and()/2", $r5, $r8);
    if (!$r4) { throw $meow.assert_fail("in-bounds", "Line 61, col 3:\n  60 |   assert Length >= 0n :: positive-slice;\n> 61 |   assert (Start >= 0n) and ((Start + Length) <= self count()) :: in-bounds;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  62 |   new byte-slice(array: self, offset: Start, length: Length);\n"); }
    $r4
  } catch (e) {
  throw $meow.assert_fail("in-bounds", String(e) + "\n\n" + "Line 61, col 3:\n  60 |   assert Length >= 0n :: positive-slice;\n> 61 |   assert (Start >= 0n) and ((Start + Length) <= self count()) :: in-bounds;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  62 |   new byte-slice(array: self, offset: Start, length: Length);\n")
  }
  let $r14;
  $r14 = $0;
  let $r15;
  $r15 = Start;
  let $r16;
  $r16 = Length;
  $r0 = $scope.make("byte-slice", {"array": $r14, "offset": $r15, "length": $r16});
  return $r0;
});

$meow.defun("slice(self:from:to:)/3", [$scope.type("byte-array"), $scope.type("i32"), $scope.type("i32")], function* slice_self_from_to___3 ($0, Start, Stop) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Start;
  let $r3;
  let $r4;
  $r4 = Stop;
  let $r5;
  $r5 = Start;
  $r3 = yield* $meow.call("-()/2", $r4, $r5);
  $r0 = yield* $meow.call("slice(self:from:length:)/3", $r1, $r2, $r3);
  return $r0;
});

$meow.defun("slice(self:from:)/2", [$scope.type("byte-array"), $scope.type("i32")], function* slice_self_from___2 ($0, Start) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Start;
  let $r3;
  let $r4;
  let $r5;
  $r5 = $0;
  $r4 = yield* $meow.call("count(self:)/1", $r5);
  let $r6;
  $r6 = Start;
  $r3 = yield* $meow.call("-()/2", $r4, $r6);
  $r0 = yield* $meow.call("slice(self:from:length:)/3", $r1, $r2, $r3);
  return $r0;
});

$meow.defun("slice(self:length:)/2", [$scope.type("byte-array"), $scope.type("i32")], function* slice_self_length___2 ($0, Length) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = (0 | 0);
  let $r3;
  $r3 = Length;
  $r0 = yield* $meow.call("slice(self:from:length:)/3", $r1, $r2, $r3);
  return $r0;
});

$meow.defun("===()/2", [$scope.type("byte-array"), $scope.type("byte-array")], function* ______2 ($0, X) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = X;
  $r0 = binary_eq($r1, $r2);
  return $r0;
});

$meow.defun("=/=()/2", [$scope.type("byte-array"), $scope.type("byte-array")], function* ______2 ($0, X) {
  let $r0;
  let $r1;
  let $r2;
  $r2 = $0;
  let $r3;
  $r3 = X;
  $r1 = yield* $meow.call("===()/2", $r2, $r3);
  $r0 = yield* $meow.call("not()/1", $r1);
  return $r0;
});

$meow.defun("as()/2", [$scope.type("byte-array"), $scope.stype("byte-slice")], function* as___2 ($0, $1) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = 0n;
  $r0 = yield* $meow.call("slice(self:from:)/2", $r1, $r2);
  return $r0;
});
$meow.defun("as()/2", [$scope.type("byte-array"), $scope.stype("array")], function* as___2 ($0, $1) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = binary_to_array($r1);
  return $r0;
});
$meow.defun("mutable-copy(self:)/1", [$scope.type("byte-array")], function* mutable_copy_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = $scope.make_pos("mutable-byte-array", [$r1]);
  return $r0;
});
});
$meow.in_package(null, ($scope) => {
$meow.defun("count(self:)/1", [$scope.type("byte-slice")], function* count_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = $r1["length"];
  return $r0;
});
$meow.defun("offset(self:)/1", [$scope.type("byte-slice")], function* offset_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = $r1["offset"];
  return $r0;
});
$meow.defun("length(self:)/1", [$scope.type("byte-slice")], function* length_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = $r1["length"];
  return $r0;
});
$meow.defun("at!(self:)/2", [$scope.type("byte-slice"), $scope.type("i32")], function* at__self___2 ($0, Index) {
  let $r0;
  try {
    let $r1;
    let $r2;
    let $r3;
    $r3 = Index;
    let $r4;
    let $r5;
    $r5 = $0;
    $r4 = $r5["length"];
    $r2 = yield* $meow.call("<()/2", $r3, $r4);
    let $r6;
    let $r7;
    $r7 = Index;
    let $r8;
    $r8 = (0 | 0);
    $r6 = yield* $meow.call(">=()/2", $r7, $r8);
    $r1 = yield* $meow.call("and()/2", $r2, $r6);
    if (!$r1) { throw $meow.assert_fail("in-bounds", "Line 18, col 3:\n  17 | def byte-slice at!(Index: i32) -> i32 {\n> 18 |   assert (Index < self.length) and (Index >= 0n) :: in-bounds;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  19 |   self.array at!(Index + self.offset);\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("in-bounds", String(e) + "\n\n" + "Line 18, col 3:\n  17 | def byte-slice at!(Index: i32) -> i32 {\n> 18 |   assert (Index < self.length) and (Index >= 0n) :: in-bounds;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  19 |   self.array at!(Index + self.offset);\n")
  }
  let $r9;
  let $r10;
  $r10 = $0;
  $r9 = $r10["array"];
  let $r11;
  let $r12;
  $r12 = Index;
  let $r13;
  let $r14;
  $r14 = $0;
  $r13 = $r14["offset"];
  $r11 = yield* $meow.call("+()/2", $r12, $r13);
  $r0 = yield* $meow.call("at!(self:)/2", $r9, $r11);
  return $r0;
});
$meow.defun("at(self:)/2", [$scope.type("byte-slice"), $scope.type("i32")], function* at_self___2 ($0, Index) {
  let $r0;
  try {
    let $r1;
    let $r2;
    let $r3;
    $r3 = Index;
    let $r4;
    let $r5;
    $r5 = $0;
    $r4 = $r5["length"];
    $r2 = yield* $meow.call("<()/2", $r3, $r4);
    let $r6;
    let $r7;
    $r7 = Index;
    let $r8;
    $r8 = (0 | 0);
    $r6 = yield* $meow.call(">=()/2", $r7, $r8);
    $r1 = yield* $meow.call("and()/2", $r2, $r6);
    if (!$r1) { throw $meow.assert_fail("in-bounds", "Line 23, col 3:\n  22 | def byte-slice at(Index: i32) -> i32 {\n> 23 |   assert (Index < self.length) and (Index >= 0n) :: in-bounds;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  24 |   self.array at(Index + self.offset)\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("in-bounds", String(e) + "\n\n" + "Line 23, col 3:\n  22 | def byte-slice at(Index: i32) -> i32 {\n> 23 |   assert (Index < self.length) and (Index >= 0n) :: in-bounds;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  24 |   self.array at(Index + self.offset)\n")
  }
  let $r9;
  let $r10;
  $r10 = $0;
  $r9 = $r10["array"];
  let $r11;
  let $r12;
  $r12 = Index;
  let $r13;
  let $r14;
  $r14 = $0;
  $r13 = $r14["offset"];
  $r11 = yield* $meow.call("+()/2", $r12, $r13);
  $r0 = yield* $meow.call("at(self:)/2", $r9, $r11);
  return $r0;
});
$meow.defun("slice(self:from:length:)/3", [$scope.type("byte-slice"), $scope.type("i32"), $scope.type("i32")], function* slice_self_from_length___3 ($0, Start, Length) {
  let $r0;
  try {
    let $r1;
    let $r2;
    $r2 = Length;
    let $r3;
    $r3 = (0 | 0);
    $r1 = yield* $meow.call(">=()/2", $r2, $r3);
    if (!$r1) { throw $meow.assert_fail("positive-slice", "Line 29, col 3:\n  28 | def byte-slice slice(from Start: i32, length Length: i32) -> byte-slice {\n> 29 |   assert Length >= 0n :: positive-slice;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  30 |   assert (Start >= 0n) and ((Start + Length) <= self count()) :: in-bounds;\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("positive-slice", String(e) + "\n\n" + "Line 29, col 3:\n  28 | def byte-slice slice(from Start: i32, length Length: i32) -> byte-slice {\n> 29 |   assert Length >= 0n :: positive-slice;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  30 |   assert (Start >= 0n) and ((Start + Length) <= self count()) :: in-bounds;\n")
  }
  try {
    let $r4;
    let $r5;
    let $r6;
    $r6 = Start;
    let $r7;
    $r7 = (0 | 0);
    $r5 = yield* $meow.call(">=()/2", $r6, $r7);
    let $r8;
    let $r9;
    let $r10;
    $r10 = Start;
    let $r11;
    $r11 = Length;
    $r9 = yield* $meow.call("+()/2", $r10, $r11);
    let $r12;
    let $r13;
    $r13 = $0;
    $r12 = yield* $meow.call("count(self:)/1", $r13);
    $r8 = yield* $meow.call("<=()/2", $r9, $r12);
    $r4 = yield* $meow.call("and()/2", $r5, $r8);
    if (!$r4) { throw $meow.assert_fail("in-bounds", "Line 30, col 3:\n  29 |   assert Length >= 0n :: positive-slice;\n> 30 |   assert (Start >= 0n) and ((Start + Length) <= self count()) :: in-bounds;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  31 |   new byte-slice(array: self.array, offset: self.offset + Start, length: Length);\n"); }
    $r4
  } catch (e) {
  throw $meow.assert_fail("in-bounds", String(e) + "\n\n" + "Line 30, col 3:\n  29 |   assert Length >= 0n :: positive-slice;\n> 30 |   assert (Start >= 0n) and ((Start + Length) <= self count()) :: in-bounds;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  31 |   new byte-slice(array: self.array, offset: self.offset + Start, length: Length);\n")
  }
  let $r14;
  let $r15;
  $r15 = $0;
  $r14 = $r15["array"];
  let $r16;
  let $r17;
  let $r18;
  $r18 = $0;
  $r17 = $r18["offset"];
  let $r19;
  $r19 = Start;
  $r16 = yield* $meow.call("+()/2", $r17, $r19);
  let $r20;
  $r20 = Length;
  $r0 = $scope.make("byte-slice", {"array": $r14, "offset": $r16, "length": $r20});
  return $r0;
});

$meow.defun("slice(self:from:to:)/3", [$scope.type("byte-slice"), $scope.type("i32"), $scope.type("i32")], function* slice_self_from_to___3 ($0, Start, Stop) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Start;
  let $r3;
  let $r4;
  $r4 = Stop;
  let $r5;
  $r5 = Start;
  $r3 = yield* $meow.call("-()/2", $r4, $r5);
  $r0 = yield* $meow.call("slice(self:from:length:)/3", $r1, $r2, $r3);
  return $r0;
});

$meow.defun("slice(self:from:)/2", [$scope.type("byte-slice"), $scope.type("i32")], function* slice_self_from___2 ($0, Start) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Start;
  let $r3;
  let $r4;
  let $r5;
  $r5 = $0;
  $r4 = yield* $meow.call("count(self:)/1", $r5);
  let $r6;
  $r6 = Start;
  $r3 = yield* $meow.call("-()/2", $r4, $r6);
  $r0 = yield* $meow.call("slice(self:from:length:)/3", $r1, $r2, $r3);
  return $r0;
});

$meow.defun("slice(self:length:)/2", [$scope.type("byte-slice"), $scope.type("i32")], function* slice_self_length___2 ($0, Length) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = (0 | 0);
  let $r3;
  $r3 = Length;
  $r0 = yield* $meow.call("slice(self:from:length:)/3", $r1, $r2, $r3);
  return $r0;
});

$meow.defun("===()/2", [$scope.type("byte-slice"), $scope.type("byte-slice")], function* ______2 ($0, X) {
  let $r0;
  let $r1;
  let $r2;
  $r2 = $0;
  $r1 = $r2["array"];
  let $r3;
  let $r4;
  $r4 = $0;
  $r3 = $r4["offset"];
  let $r5;
  let $r6;
  $r6 = $0;
  $r5 = $r6["length"];
  let $r7;
  let $r8;
  $r8 = X;
  $r7 = $r8["array"];
  let $r9;
  let $r10;
  $r10 = X;
  $r9 = $r10["offset"];
  let $r11;
  let $r12;
  $r12 = X;
  $r11 = $r12["length"];
  $r0 = binary_slice_eq($r1, $r3, $r5, $r7, $r9, $r11);
  return $r0;
});
$meow.defun("=/=()/2", [$scope.type("byte-slice"), $scope.type("byte-slice")], function* ______2 ($0, X) {
  let $r0;
  let $r1;
  let $r2;
  $r2 = $0;
  let $r3;
  $r3 = X;
  $r1 = yield* $meow.call("===()/2", $r2, $r3);
  $r0 = yield* $meow.call("not()/1", $r1);
  return $r0;
});
$meow.defun("as()/2", [$scope.type("byte-slice"), $scope.stype("byte-array")], function* as___2 ($0, $1) {
  let $r0;
  let $r1;
  let $r2;
  $r2 = $0;
  $r1 = $r2["array"];
  let $r3;
  let $r4;
  $r4 = $0;
  $r3 = $r4["offset"];
  let $r5;
  let $r6;
  $r6 = $0;
  $r5 = $r6["length"];
  $r0 = binary_materialise_slice($r1, $r3, $r5);
  return $r0;
});
});
$meow.in_package(null, ($scope) => {
$meow.defun("count(self:)/1", [$scope.type("mutable-byte-array")], function* count_self___1 ($0) {
  let $r0;
  let $r1;
  let $r2;
  $r2 = $0;
  $r1 = $r2["array"];
  $r0 = yield* $meow.call("count(self:)/1", $r1);
  return $r0;
});

$meow.defun("allocate(self:size:default:)/3", [$scope.stype("mutable-byte-array"), $scope.type("i32"), $scope.type("i32")], function* allocate_self_size_default___3 ($0, Size, Default) {
  let $r0;
  let $r1;
  let $r2;
  $r2 = $scope.smake("byte-array");
  let $r3;
  $r3 = Size;
  let $r4;
  $r4 = Default;
  $r1 = yield* $meow.call("allocate(self:size:default:)/3", $r2, $r3, $r4);
  $r0 = $scope.make_pos("mutable-byte-array", [$r1]);
  return $r0;
});
$meow.defun("allocate(self:size:)/2", [$scope.stype("mutable-byte-array"), $scope.type("i32")], function* allocate_self_size___2 ($0, Size) {
  let $r0;
  let $r1;
  let $r2;
  $r2 = $scope.smake("byte-array");
  let $r3;
  $r3 = Size;
  $r1 = yield* $meow.call("allocate(self:size:)/2", $r2, $r3);
  $r0 = $scope.make_pos("mutable-byte-array", [$r1]);
  return $r0;
});
$meow.defun("from(self:)/2", [$scope.stype("mutable-byte-array"), $scope.type("array")], function* from_self___2 ($0, Array) {
  let $r0;
  let $r1;
  let $r2;
  $r2 = $scope.smake("byte-array");
  let $r3;
  $r3 = Array;
  $r1 = yield* $meow.call("from(self:)/2", $r2, $r3);
  $r0 = $scope.make_pos("mutable-byte-array", [$r1]);
  return $r0;
});
$meow.defun("at!(self:)/2", [$scope.type("mutable-byte-array"), $scope.type("i32")], function* at__self___2 ($0, Index) {
  let $r0;
  let $r1;
  let $r2;
  $r2 = $0;
  $r1 = $r2["array"];
  let $r3;
  $r3 = Index;
  $r0 = yield* $meow.call("at!(self:)/2", $r1, $r3);
  return $r0;
});
$meow.defun("at(self:)/2", [$scope.type("mutable-byte-array"), $scope.type("i32")], function* at_self___2 ($0, Index) {
  let $r0;
  let $r1;
  let $r2;
  $r2 = $0;
  $r1 = $r2["array"];
  let $r3;
  $r3 = Index;
  $r0 = yield* $meow.call("at(self:)/2", $r1, $r3);
  return $r0;
});
$meow.defun("at(self:put:)/3", [$scope.type("mutable-byte-array"), $scope.type("i32"), $scope.type("i32")], function* at_self_put___3 ($0, Index, Value) {
  let $r0;
  try {
    let $r1;
    let $r2;
    let $r3;
    $r3 = Index;
    let $r4;
    $r4 = (0 | 0);
    $r2 = yield* $meow.call(">=()/2", $r3, $r4);
    let $r5;
    let $r6;
    $r6 = Index;
    let $r7;
    let $r8;
    $r8 = $0;
    $r7 = yield* $meow.call("count(self:)/1", $r8);
    $r5 = yield* $meow.call("<()/2", $r6, $r7);
    $r1 = yield* $meow.call("and()/2", $r2, $r5);
    if (!$r1) { throw $meow.assert_fail("in-bounds", "Line 34, col 3:\n  33 | def mutable-byte-array at(Index: i32, put Value: i32) -> mutable-byte-array {\n> 34 |   assert (Index >= 0n) and (Index < self count()) :: in-bounds;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  35 |   primitive binary.at-put(Index, Value);\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("in-bounds", String(e) + "\n\n" + "Line 34, col 3:\n  33 | def mutable-byte-array at(Index: i32, put Value: i32) -> mutable-byte-array {\n> 34 |   assert (Index >= 0n) and (Index < self count()) :: in-bounds;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  35 |   primitive binary.at-put(Index, Value);\n")
  }
  let $r9;
  $r9 = Index;
  let $r10;
  $r10 = Value;
  binary_at_put($r9, $r10)
  $r0 = $0;
  return $r0;
});
$meow.defun("at(self:update:)/3", [$scope.type("mutable-byte-array"), $scope.type("i32"), $meow.type("lambda-1")], function* at_self_update___3 ($0, Index, Fn) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Index;
  let $r3;
  let $r4;
  $r4 = Fn;
  let $r5;
  let $r6;
  $r6 = $0;
  let $r7;
  $r7 = Index;
  $r5 = yield* $meow.call("at!(self:)/2", $r6, $r7);
  $r3 = yield* $r4($r5);
  yield* $meow.call("at(self:put:)/3", $r1, $r2, $r3)
  $r0 = $0;
  return $r0;
});
$meow.defun("at(self:put-all:)/3", [$scope.type("mutable-byte-array"), $scope.type("i32"), $scope.type("byte-array")], function* at_self_put_all___3 ($0, Index, Array) {
  let $r0;
  try {
    let $r1;
    let $r2;
    let $r3;
    $r3 = Index;
    let $r4;
    $r4 = (0 | 0);
    $r2 = yield* $meow.call(">=()/2", $r3, $r4);
    let $r5;
    let $r6;
    let $r7;
    $r7 = Index;
    let $r8;
    let $r9;
    $r9 = Array;
    $r8 = yield* $meow.call("count(self:)/1", $r9);
    $r6 = yield* $meow.call("+()/2", $r7, $r8);
    let $r10;
    let $r11;
    $r11 = $0;
    $r10 = yield* $meow.call("count(self:)/1", $r11);
    $r5 = yield* $meow.call("<=()/2", $r6, $r10);
    $r1 = yield* $meow.call("and()/2", $r2, $r5);
    if (!$r1) { throw $meow.assert_fail("in-bounds", "Line 45, col 3:\n  44 | def mutable-byte-array at(Index: i32, put-all Array: byte-array) -> mutable-byte-array {\n> 45 |   assert (Index >= 0n) and ((Index + Array count()) <= self count()) :: in-bounds;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  46 |   primitive binary.at-put-all(Index, Array);\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("in-bounds", String(e) + "\n\n" + "Line 45, col 3:\n  44 | def mutable-byte-array at(Index: i32, put-all Array: byte-array) -> mutable-byte-array {\n> 45 |   assert (Index >= 0n) and ((Index + Array count()) <= self count()) :: in-bounds;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  46 |   primitive binary.at-put-all(Index, Array);\n")
  }
  let $r12;
  $r12 = Index;
  let $r13;
  $r13 = Array;
  binary_at_put_all($r12, $r13)
  $r0 = $0;
  return $r0;
});
$meow.defun("at(self:put-all:)/3", [$scope.type("mutable-byte-array"), $scope.type("i32"), $scope.type("byte-slice")], function* at_self_put_all___3 ($0, Index, Array) {
  let $r0;
  try {
    let $r1;
    let $r2;
    let $r3;
    $r3 = Index;
    let $r4;
    $r4 = 0n;
    $r2 = yield* $meow.call(">=()/2", $r3, $r4);
    let $r5;
    let $r6;
    let $r7;
    $r7 = Index;
    let $r8;
    let $r9;
    $r9 = Array;
    $r8 = yield* $meow.call("count(self:)/1", $r9);
    $r6 = yield* $meow.call("+()/2", $r7, $r8);
    let $r10;
    let $r11;
    $r11 = $0;
    $r10 = yield* $meow.call("count(self:)/1", $r11);
    $r5 = yield* $meow.call("<=()/2", $r6, $r10);
    $r1 = yield* $meow.call("and()/2", $r2, $r5);
    if (!$r1) { throw $meow.assert_fail("in-bounds", "Line 51, col 3:\n  50 | def mutable-byte-array at(Index: i32, put-all Array: byte-slice) -> mutable-byte-array {\n> 51 |   assert (Index >= 0) and ((Index + Array count()) <= self count()) :: in-bounds;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  52 |   primitive binary.at-put-slice(Index, Array, Array.offset, Array.length);\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("in-bounds", String(e) + "\n\n" + "Line 51, col 3:\n  50 | def mutable-byte-array at(Index: i32, put-all Array: byte-slice) -> mutable-byte-array {\n> 51 |   assert (Index >= 0) and ((Index + Array count()) <= self count()) :: in-bounds;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  52 |   primitive binary.at-put-slice(Index, Array, Array.offset, Array.length);\n")
  }
  let $r12;
  $r12 = Index;
  let $r13;
  $r13 = Array;
  let $r14;
  let $r15;
  $r15 = Array;
  $r14 = $r15["offset"];
  let $r16;
  let $r17;
  $r17 = Array;
  $r16 = $r17["length"];
  binary_at_put_slice($r12, $r13, $r14, $r16)
  $r0 = $0;
  return $r0;
});
$meow.defun("at(self:put-all:)/3", [$scope.type("mutable-byte-array"), $scope.type("i32"), $scope.type("mutable-byte-array")], function* at_self_put_all___3 ($0, Index, Array) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = Index;
  let $r3;
  let $r4;
  $r4 = Array;
  $r3 = yield* $meow.call("read-only(self:)/1", $r4);
  $r0 = yield* $meow.call("at(self:put-all:)/3", $r1, $r2, $r3);
  return $r0;
});
$meow.defun("fill(self:from:length:)/4", [$scope.type("mutable-byte-array"), $scope.type("i32"), $scope.type("i32"), $scope.type("i32")], function* fill_self_from_length___4 ($0, Value, Start, Length) {
  let $r0;
  try {
    let $r1;
    let $r2;
    $r2 = Length;
    let $r3;
    $r3 = (0 | 0);
    $r1 = yield* $meow.call(">=()/2", $r2, $r3);
    if (!$r1) { throw $meow.assert_fail("positive-length", "Line 62, col 3:\n  61 | def mutable-byte-array fill(Value: i32, from Start: i32, length Length: i32) -> mutable-byte-array {\n> 62 |   assert (Length >= 0n) :: positive-length;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  63 |   assert (Start >= 0n) and ((Start + Length) <= self count()) :: in-bounds;\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail("positive-length", String(e) + "\n\n" + "Line 62, col 3:\n  61 | def mutable-byte-array fill(Value: i32, from Start: i32, length Length: i32) -> mutable-byte-array {\n> 62 |   assert (Length >= 0n) :: positive-length;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  63 |   assert (Start >= 0n) and ((Start + Length) <= self count()) :: in-bounds;\n")
  }
  try {
    let $r4;
    let $r5;
    let $r6;
    $r6 = Start;
    let $r7;
    $r7 = (0 | 0);
    $r5 = yield* $meow.call(">=()/2", $r6, $r7);
    let $r8;
    let $r9;
    let $r10;
    $r10 = Start;
    let $r11;
    $r11 = Length;
    $r9 = yield* $meow.call("+()/2", $r10, $r11);
    let $r12;
    let $r13;
    $r13 = $0;
    $r12 = yield* $meow.call("count(self:)/1", $r13);
    $r8 = yield* $meow.call("<=()/2", $r9, $r12);
    $r4 = yield* $meow.call("and()/2", $r5, $r8);
    if (!$r4) { throw $meow.assert_fail("in-bounds", "Line 63, col 3:\n  62 |   assert (Length >= 0n) :: positive-length;\n> 63 |   assert (Start >= 0n) and ((Start + Length) <= self count()) :: in-bounds;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  64 |   primitive binary.fill(self.array, Value, Start, Start + Length);\n"); }
    $r4
  } catch (e) {
  throw $meow.assert_fail("in-bounds", String(e) + "\n\n" + "Line 63, col 3:\n  62 |   assert (Length >= 0n) :: positive-length;\n> 63 |   assert (Start >= 0n) and ((Start + Length) <= self count()) :: in-bounds;\n         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n  64 |   primitive binary.fill(self.array, Value, Start, Start + Length);\n")
  }
  let $r14;
  let $r15;
  $r15 = $0;
  $r14 = $r15["array"];
  let $r16;
  $r16 = Value;
  let $r17;
  $r17 = Start;
  let $r18;
  let $r19;
  $r19 = Start;
  let $r20;
  $r20 = Length;
  $r18 = yield* $meow.call("+()/2", $r19, $r20);
  binary_fill($r14, $r16, $r17, $r18)
  $r0 = $0;
  return $r0;
});

$meow.defun("fill(self:)/2", [$scope.type("mutable-byte-array"), $scope.type("i32")], function* fill_self___2 ($0, Value) {
  let $r0;
  let $r1;
  let $r2;
  $r2 = $0;
  $r1 = $r2["array"];
  let $r3;
  $r3 = Value;
  binary_fill_all($r1, $r3)
  $r0 = $0;
  return $r0;
});

$meow.defun("read-only(self:)/1", [$scope.type("mutable-byte-array")], function* read_only_self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = $r1["array"];
  return $r0;
});
});
});
$meow.in_package(null, ($scope) => {
$meow.defun("empty(self:)/1", [$scope.stype("stream")], function* empty_self___1 ($0) {
  let $r0;
  $r0 = $scope.get_variant("stream", "empty");
  return $r0;
});
$meow.defun("from(self:)/2", [$scope.stype("stream"), $scope.type("array")], function* from_self___2 ($0, Items) {
  let $r0;
  let $r1;
  $r1 = Items;
  let $r2;
  let $r3;
  $r3 = $scope.smake("stream");
  $r2 = yield* $meow.call("empty(self:)/1", $r3);
  let $r4;
  $r4 = (function* (X, Tail) {
    let $r0;
    let $r1;
    $r1 = X;
    let $r2;
    $r2 = new $Thunk(function* () {
      let $r0;
      $r0 = Tail;
      return $r0;
    });
    $r0 = $scope.make_variant("stream", "cons", {"head": $r1, "tail": $r2});
    return $r0;
  });
  $r0 = yield* $meow.call("fold-right(self:from:with:)/3", $r1, $r2, $r4);
  return $r0;
});

$meow.defun("iterate(self:from:with:)/3", [$scope.stype("stream"), $meow.type("unknown"), $meow.type("lambda-1")], function* iterate_self_from_with___3 ($0, Init, Fn) {
  let $r0;
  let $r1;
  $r1 = Init;
  let $r2;
  $r2 = new $Thunk(function* () {
    let $r0;
    let $r1;
    $r1 = $scope.smake("stream");
    let $r2;
    let $r3;
    $r3 = Fn;
    let $r4;
    $r4 = Init;
    $r2 = yield* $r3($r4);
    let $r5;
    $r5 = Fn;
    $r0 = yield* $meow.call("iterate(self:from:with:)/3", $r1, $r2, $r5);
    return $r0;
  });
  $r0 = $scope.make_variant("stream", "cons", {"head": $r1, "tail": $r2});
  return $r0;
});

$meow.defun("first!(self:)/1", [$scope.vtype("stream", "cons")], function* first__self___1 ($0) {
  let $r0;
  let $r1;
  $r1 = $0;
  $r0 = $r1["head"];
  return $r0;
});
$meow.defun("rest(self:)/1", [$scope.vtype("stream", "empty")], function* rest_self___1 ($0) {
  let $r0;
  $r0 = $0;
  return $r0;
});
$meow.defun("rest(self:)/1", [$scope.vtype("stream", "cons")], function* rest_self___1 ($0) {
  let $r0;
  let $r1;
  let $r2;
  $r2 = $0;
  $r1 = $r2["tail"];
  $r0 = yield* $meow.force($r1);
  return $r0;
});
$meow.defun("take(self:)/2", [$scope.vtype("stream", "empty"), $scope.type("i32")], function* take_self___2 ($0, Count) {
  let $r0;
  $r0 = $0;
  return $r0;
});
$meow.defun("take(self:)/2", [$scope.vtype("stream", "cons"), $scope.type("i32")], function* take_self___2 ($0, Count) {
  let $r0;
  try {
    let $r1;
    let $r2;
    $r2 = Count;
    let $r3;
    $r3 = (0 | 0);
    $r1 = yield* $meow.call(">=()/2", $r2, $r3);
    if (!$r1) { throw $meow.assert_fail(null, "Line 35, col 3:\n  34 | def stream..cons<A> take(Count: i32) -> stream<A> {\n> 35 |   assert Count >= 0n;\n         ^~~~~~~~~~~~~~~~~~\n  36 |   when {\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail(null, String(e) + "\n\n" + "Line 35, col 3:\n  34 | def stream..cons<A> take(Count: i32) -> stream<A> {\n> 35 |   assert Count >= 0n;\n         ^~~~~~~~~~~~~~~~~~\n  36 |   when {\n")
  }
  let $r4, $r5;
  let $r6;
  $r6 = Count;
  let $r7;
  $r7 = (0 | 0);
  $r5 = yield* $meow.call("===()/2", $r6, $r7);
  if ($r5) {
    let $r8;
    $r8 = $scope.smake("stream");
    $r4 = yield* $meow.call("empty(self:)/1", $r8);
  } else {
    let $r9, $r10;
    $r10 = true;
    if ($r10) {
      let $r11;
      let $r12;
      $r12 = $0;
      $r11 = yield* $meow.call("first!(self:)/1", $r12);
      let $r13;
      $r13 = new $Thunk(function* () {
        let $r0;
        let $r1;
        let $r2;
        $r2 = $0;
        $r1 = yield* $meow.call("rest(self:)/1", $r2);
        let $r3;
        let $r4;
        $r4 = Count;
        let $r5;
        $r5 = (1 | 0);
        $r3 = yield* $meow.call("-()/2", $r4, $r5);
        $r0 = yield* $meow.call("take(self:)/2", $r1, $r3);
        return $r0;
      });
      $r9 = $scope.make_variant("stream", "cons", {"head": $r11, "tail": $r13});
    } else {
      throw $meow.unreachable("no clause matched");
    }
    $r4 = $r9;
  }
  $r0 = $r4;
  return $r0;
});

$meow.defun("drop(self:)/2", [$scope.vtype("stream", "empty"), $scope.type("i32")], function* drop_self___2 ($0, Count) {
  let $r0;
  $r0 = $0;
  return $r0;
});
$meow.defun("drop(self:)/2", [$scope.vtype("stream", "cons"), $scope.type("i32")], function* drop_self___2 ($0, Count) {
  let $r0;
  try {
    let $r1;
    let $r2;
    $r2 = Count;
    let $r3;
    $r3 = (0 | 0);
    $r1 = yield* $meow.call(">=()/2", $r2, $r3);
    if (!$r1) { throw $meow.assert_fail(null, "Line 49, col 3:\n  48 | def stream..cons<A> drop(Count: i32) -> stream<A> {\n> 49 |   assert Count >= 0n;\n         ^~~~~~~~~~~~~~~~~~\n  50 |   when {\n"); }
    $r1
  } catch (e) {
  throw $meow.assert_fail(null, String(e) + "\n\n" + "Line 49, col 3:\n  48 | def stream..cons<A> drop(Count: i32) -> stream<A> {\n> 49 |   assert Count >= 0n;\n         ^~~~~~~~~~~~~~~~~~\n  50 |   when {\n")
  }
  let $r4, $r5;
  let $r6;
  $r6 = Count;
  let $r7;
  $r7 = (0 | 0);
  $r5 = yield* $meow.call("===()/2", $r6, $r7);
  if ($r5) {
    $r4 = $0;
  } else {
    let $r8, $r9;
    $r9 = true;
    if ($r9) {
      let $r10;
      let $r11;
      $r11 = $0;
      $r10 = yield* $meow.call("rest(self:)/1", $r11);
      let $r12;
      let $r13;
      $r13 = Count;
      let $r14;
      $r14 = (1 | 0);
      $r12 = yield* $meow.call("-()/2", $r13, $r14);
      $r8 = yield* $meow.call("drop(self:)/2", $r10, $r12);
    } else {
      throw $meow.unreachable("no clause matched");
    }
    $r4 = $r8;
  }
  $r0 = $r4;
  return $r0;
});

$meow.defun("take-while(self:)/2", [$scope.vtype("stream", "empty"), $scope.type("i32")], function* take_while_self___2 ($0, Count) {
  let $r0;
  $r0 = $0;
  return $r0;
});
$meow.defun("take-while(self:)/2", [$scope.vtype("stream", "cons"), $meow.type("lambda-1")], function* take_while_self___2 ($0, Predicate) {
  let $r0;
  let $r1, $r2;
  let $r3;
  $r3 = Predicate;
  let $r4;
  let $r5;
  $r5 = $0;
  $r4 = yield* $meow.call("first!(self:)/1", $r5);
  $r2 = yield* $r3($r4);
  if ($r2) {
    let $r6;
    let $r7;
    $r7 = $0;
    $r6 = yield* $meow.call("first!(self:)/1", $r7);
    let $r8;
    $r8 = new $Thunk(function* () {
      let $r0;
      let $r1;
      let $r2;
      $r2 = $0;
      $r1 = yield* $meow.call("rest(self:)/1", $r2);
      let $r3;
      $r3 = Predicate;
      $r0 = yield* $meow.call("take-while(self:)/2", $r1, $r3);
      return $r0;
    });
    $r1 = $scope.make_variant("stream", "cons", {"head": $r6, "tail": $r8});
  } else {
    let $r9, $r10;
    $r10 = true;
    if ($r10) {
      let $r11;
      $r11 = $scope.smake("stream");
      $r9 = yield* $meow.call("empty(self:)/1", $r11);
    } else {
      throw $meow.unreachable("no clause matched");
    }
    $r1 = $r9;
  }
  $r0 = $r1;
  return $r0;
});

$meow.defun("drop-while(self:)/2", [$scope.vtype("stream", "empty"), $scope.type("i32")], function* drop_while_self___2 ($0, Count) {
  let $r0;
  $r0 = $0;
  return $r0;
});
$meow.defun("drop-while(self:)/2", [$scope.vtype("stream", "cons"), $meow.type("lambda-1")], function* drop_while_self___2 ($0, Predicate) {
  let $r0;
  let $r1, $r2;
  let $r3;
  let $r4;
  $r4 = Predicate;
  let $r5;
  let $r6;
  $r6 = $0;
  $r5 = yield* $meow.call("first!(self:)/1", $r6);
  $r3 = yield* $r4($r5);
  $r2 = yield* $meow.call("not()/1", $r3);
  if ($r2) {
    $r1 = $0;
  } else {
    let $r7, $r8;
    $r8 = true;
    if ($r8) {
      let $r9;
      let $r10;
      $r10 = $0;
      $r9 = yield* $meow.call("rest(self:)/1", $r10);
      let $r11;
      $r11 = Predicate;
      $r7 = yield* $meow.call("drop-while(self:)/2", $r9, $r11);
    } else {
      throw $meow.unreachable("no clause matched");
    }
    $r1 = $r7;
  }
  $r0 = $r1;
  return $r0;
});

$meow.defun("map(self:)/2", [$scope.vtype("stream", "empty"), $meow.type("lambda-1")], function* map_self___2 ($0, Fn) {
  let $r0;
  $r0 = $0;
  return $r0;
});
$meow.defun("map(self:)/2", [$scope.vtype("stream", "cons"), $meow.type("lambda-1")], function* map_self___2 ($0, Fn) {
  let $r0;
  let $r1;
  let $r2;
  $r2 = Fn;
  let $r3;
  let $r4;
  $r4 = $0;
  $r3 = yield* $meow.call("first!(self:)/1", $r4);
  $r1 = yield* $r2($r3);
  let $r5;
  $r5 = new $Thunk(function* () {
    let $r0;
    let $r1;
    let $r2;
    $r2 = $0;
    $r1 = yield* $meow.call("rest(self:)/1", $r2);
    let $r3;
    $r3 = Fn;
    $r0 = yield* $meow.call("map(self:)/2", $r1, $r3);
    return $r0;
  });
  $r0 = $scope.make_variant("stream", "cons", {"head": $r1, "tail": $r5});
  return $r0;
});
$meow.defun("keep-if(self:)/2", [$scope.vtype("stream", "empty"), $meow.type("lambda-1")], function* keep_if_self___2 ($0, Fn) {
  let $r0;
  $r0 = $0;
  return $r0;
});
$meow.defun("keep-if(self:)/2", [$scope.vtype("stream", "cons"), $meow.type("lambda-1")], function* keep_if_self___2 ($0, Fn) {
  let $r0;
  let $r1, $r2;
  let $r3;
  $r3 = Fn;
  let $r4;
  let $r5;
  $r5 = $0;
  $r4 = yield* $meow.call("first!(self:)/1", $r5);
  $r2 = yield* $r3($r4);
  if ($r2) {
    let $r6;
    let $r7;
    $r7 = $0;
    $r6 = yield* $meow.call("first!(self:)/1", $r7);
    let $r8;
    $r8 = new $Thunk(function* () {
      let $r0;
      let $r1;
      let $r2;
      $r2 = $0;
      $r1 = yield* $meow.call("rest(self:)/1", $r2);
      let $r3;
      $r3 = Fn;
      $r0 = yield* $meow.call("keep-if(self:)/2", $r1, $r3);
      return $r0;
    });
    $r1 = $scope.make_variant("stream", "cons", {"head": $r6, "tail": $r8});
  } else {
    let $r9, $r10;
    $r10 = true;
    if ($r10) {
      let $r11;
      let $r12;
      $r12 = $0;
      $r11 = yield* $meow.call("rest(self:)/1", $r12);
      let $r13;
      $r13 = Fn;
      $r9 = yield* $meow.call("keep-if(self:)/2", $r11, $r13);
    } else {
      throw $meow.unreachable("no clause matched");
    }
    $r1 = $r9;
  }
  $r0 = $r1;
  return $r0;
});
$meow.defun("remove-if(self:)/2", [$scope.type("stream"), $meow.type("lambda-1")], function* remove_if_self___2 ($0, Fn) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = (function* (X) {
    let $r0;
    let $r1;
    let $r2;
    $r2 = Fn;
    let $r3;
    $r3 = X;
    $r1 = yield* $r2($r3);
    $r0 = yield* $meow.call("not()/1", $r1);
    return $r0;
  });
  $r0 = yield* $meow.call("keep-if(self:)/2", $r1, $r2);
  return $r0;
});
$meow.defun("fold(self:from:with:)/3", [$scope.vtype("stream", "empty"), $meow.type("unknown"), $meow.type("lambda-2")], function* fold_self_from_with___3 ($0, Init, Fn) {
  let $r0;
  $r0 = Init;
  return $r0;
});
$meow.defun("fold(self:from:with:)/3", [$scope.vtype("stream", "cons"), $meow.type("unknown"), $meow.type("lambda-2")], function* fold_self_from_with___3 ($0, Init, Fn) {
  let $r0;
  let $r1;
  $r1 = Fn;
  let $r2;
  $r2 = Init;
  let $r3;
  let $r4;
  let $r5;
  let $r6;
  $r6 = $0;
  $r5 = $r6["tail"];
  $r4 = yield* $meow.force($r5);
  let $r7;
  let $r8;
  $r8 = $0;
  $r7 = $r8["head"];
  let $r9;
  $r9 = Fn;
  $r3 = yield* $meow.call("fold(self:from:with:)/3", $r4, $r7, $r9);
  $r0 = yield* $r1($r2, $r3);
  return $r0;
});
$meow.defun("sum(self:of:)/2", [$scope.type("stream"), $scope.stype("f64")], function* sum_self_of___2 ($0, Type) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = $meow.f64(0);
  let $r3;
  $r3 = (function* (A, B) {
    let $r0;
    let $r1;
    $r1 = A;
    let $r2;
    $r2 = B;
    $r0 = yield* $meow.call("+()/2", $r1, $r2);
    return $r0;
  });
  $r0 = yield* $meow.call("fold(self:from:with:)/3", $r1, $r2, $r3);
  return $r0;
});
$meow.defun("sum(self:of:)/2", [$scope.type("stream"), $scope.stype("i32")], function* sum_self_of___2 ($0, Type) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = $meow.f64(0);
  let $r3;
  $r3 = (function* (A, B) {
    let $r0;
    let $r1;
    $r1 = A;
    let $r2;
    $r2 = B;
    $r0 = yield* $meow.call("+()/2", $r1, $r2);
    return $r0;
  });
  $r0 = yield* $meow.call("fold(self:from:with:)/3", $r1, $r2, $r3);
  return $r0;
});
$meow.defun("sum(self:of:)/2", [$scope.type("stream"), $scope.stype("integer")], function* sum_self_of___2 ($0, Type) {
  let $r0;
  let $r1;
  $r1 = $0;
  let $r2;
  $r2 = 0n;
  let $r3;
  $r3 = (function* (A, B) {
    let $r0;
    let $r1;
    $r1 = A;
    let $r2;
    $r2 = B;
    $r0 = yield* $meow.call("+()/2", $r1, $r2);
    return $r0;
  });
  $r0 = yield* $meow.call("fold(self:from:with:)/3", $r1, $r2, $r3);
  return $r0;
});
$meow.defun("as()/2", [$scope.vtype("stream", "empty"), $scope.stype("array")], function* as___2 ($0, $1) {
  let $r0;
  $r0 = [];
  return $r0;
});
$meow.defun("as()/2", [$scope.vtype("stream", "cons"), $scope.stype("array")], function* as___2 ($0, $1) {
  let $r0;
  let $r1;
  let $r2;
  $r2 = $0;
  $r1 = $r2["head"];
  let $r3;
  let $r4;
  let $r5;
  let $r6;
  $r6 = $0;
  $r5 = $r6["tail"];
  $r4 = yield* $meow.force($r5);
  let $r7;
  $r7 = $scope.smake("array");
  $r3 = yield* $meow.call("as()/2", $r4, $r7);
  $r0 = [$r1, ...$r3];
  return $r0;
});
});
});
});
