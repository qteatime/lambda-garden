abstract class $Signal {}

class $PanicSignal extends $Signal {
  constructor(readonly error: $Panic) {
    super();
  }
}

class $AwaitSignal extends $Signal {
  constructor(readonly value: Promise<$Value>) {
    super();
  }
}

class $AbortSignal extends $Signal {
  constructor(readonly value: $Value) {
    super();
  }
}

class $ResumeSignal extends $Signal {
  constructor(readonly value: $Value) {
    super();
  }
}

class $PerformSignal extends $Signal {
  constructor(readonly name: string, readonly args: $Value[]) {
    super();
  }
}

class $HandleSignal extends $Signal {
  constructor(readonly gen: MeowGen, readonly cases: { [key: string]: MeowFn }) {
    super();
  }
}

class $InstallHandlerCasesSignal extends $Signal {
  constructor(readonly cases: { [key: string]: MeowFn }) {
    super();
  }
}

class $YieldProcessSignal extends $Signal {}

type $HandlerCases = { [key: string]: MeowFn };

class $HandleStack {
  constructor(
    readonly parent: null | $HandleStack,
    readonly gen: MeowGen,
    readonly cases: $HandlerCases,
    readonly abort_to: $HandleStack | null
  ) {}

  find_handler(name: string): { stack: $HandleStack; handler: MeowFn } {
    if (Object.hasOwn(this.cases, name)) {
      return { stack: this, handler: this.cases[name] };
    } else if (this.parent != null) {
      return this.parent.find_handler(name);
    } else {
      throw new $Panic("no-handler", `No handler defined for ${name}`);
    }
  }

  collect_handlers() {
    const base = this.parent ? this.parent.cases : {};
    return { ...base, ...this.cases };
  }
}
