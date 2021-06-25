import { interfaces } from 'inversify';
import { Constructor } from './types/constructor';
import { Scope } from './types/scope';

export const defaultServices: Map<
  interfaces.ServiceIdentifier<any>,
  { cls: Constructor; scope: Scope }
> = new Map();
