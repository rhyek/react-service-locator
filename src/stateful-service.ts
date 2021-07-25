import { Immutable } from './types/immutable';

interface StatefulServiceListener {
  (): void;
}

const notInitialized = Symbol('notInitialized');

export abstract class StatefulService<S, IS = Immutable<S>> {
  private listeners: StatefulServiceListener[] = [];

  private _state: S | typeof notInitialized = notInitialized;

  constructor(initialState?: S) {
    if (typeof initialState !== 'undefined') {
      this._state = initialState;
    }
  }

  private assertIsInitialized<T extends any>(
    d: T
  ): asserts d is Exclude<T, typeof notInitialized> {
    if (d === notInitialized) {
      throw new Error('State has not been initialized.');
    }
  }

  /**
   * A getter for the internal state. It will return the same internal state
   * object (=== is true), but typed as recursively immutable.
   */
  public get state(): IS {
    this.assertIsInitialized(this._state);
    return this._state as unknown as IS;
  }

  /**
   * Set state without triggering re-renders. Should only be used in constructors.
   */
  protected set state(state: S | IS) {
    this._state = state as S;
  }

  protected setState(newState: Partial<S>): void {
    this.assertIsInitialized(this._state);
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
