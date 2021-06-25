import { injectable, interfaces } from 'inversify';
import { defaultServices } from '../default-services';
import { Constructor } from '../types/constructor';
import { Scope } from '../types/scope';

export const Injectable: (
  token?: interfaces.ServiceIdentifier<any>,
  scope?: Scope
) => ClassDecorator = (token, scope = 'singleton') => {
  return (constructor: Function) => {
    if (typeof token === 'undefined') {
      token = constructor;
    }
    defaultServices.set(token, { cls: constructor as Constructor, scope });
    injectable()(constructor);
  };
};
