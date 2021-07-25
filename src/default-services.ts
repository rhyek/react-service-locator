import { interfaces } from 'inversify';
import { debug } from './debug';
import { Constructor } from './types/constructor';
import { Scope } from './types/scope';

type Value = { cls: Constructor; scope: Scope };

export const defaultServices: Map<
  interfaces.ServiceIdentifier<any>,
  Value
> = new Map();

type Callback = (
  token: interfaces.ServiceIdentifier<any>,
  value: Value
) => void;
const callbacks: Callback[] = [];

export function registerDefaultService(
  token: interfaces.ServiceIdentifier<any>,
  value: Value
) {
  debug('Registering default service', token);
  defaultServices.set(token, value);
  for (const cb of callbacks) {
    debug(`Notifying a cb ${cb.name} about`, token);
    cb(token, value);
  }
}

export function addDefaultServiceRegisteredCallback(cb: Callback) {
  if (callbacks.indexOf(cb) < 0) {
    debug('Adding a cb', cb.name);
    callbacks.push(cb);
  }
}

export function removeDefaultServiceRegisteredCallback(cb: Callback) {
  debug('Removing cb', cb.name);
  callbacks.splice(callbacks.indexOf(cb), 1);
}
