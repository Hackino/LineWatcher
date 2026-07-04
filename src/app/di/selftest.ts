import { container, injectable } from 'tsyringe';

/**
 * Node-safe DI self-test (no native imports). `Ping` depends on `Clock` by TYPE,
 * so resolution only works if the Babel decorator/metadata pipeline emits
 * constructor metadata. Used by scripts/di-check.cjs and the foundation screen.
 */
@injectable()
export class Clock {
  tick(): string {
    return 'tick';
  }
}

@injectable()
export class Ping {
  constructor(private readonly clock: Clock) {}

  status(): string {
    return `DI OK (${this.clock.tick()})`;
  }
}

export function diSelfTest(): string {
  return container.resolve(Ping).status();
}
