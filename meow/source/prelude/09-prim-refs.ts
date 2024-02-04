// -- Cell references
const cell_new = (a: $Value) => new $Cell(a);

const cell_deref = (a: $Cell) => a.deref();

const cell_exchange = (a: $Cell, b: $Value) => a.exchange(b);

const cell_cas = (a: $Cell, v: $Value, o: $Value) => a.cas(v, o);

// -- Weak references
const weak_ref_new = (a: $Ref) => new WeakRef(a);

const weak_ref_deref = (a: WeakRef<$Ref>) => a.deref() ?? null;
