import { Immutable } from './types/immutable';

interface StatefulServiceListener {
  (): void;
}

export abstract class StatefulService<S, IS = Immutable<S>> {
  private listeners: StatefulServiceListener[] = [];

  /**
   * The internal state. You should not need to update this directly since
   * it will not trigger re-renders.
   * It can be useful in constructors in some specific cases.
   */
  protected _state: S;

  constructor(initialState: S) {
    this._state = initialState;
  }
  /**
   * A getter for the internal state. It will return the same internal state
   * object (=== is true), but typed as recursively immutable.
   */
  public get state(): IS {
    return this._state as unknown as IS;
  }

  protected setState(newState: Partial<S>): void {
    this._state = { ...this._state, ...newState };
    for (const listener of this.listeners) {
      listener();
    }
  }

  public addListener(listener: StatefulServiceListener): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: StatefulServiceListener): void {
    this.listeners.splice(this.listeners.indexOf(listener), 1);
  }
}
