import { injectable, interfaces } from 'inversify';
import { defaultServices } from '../default-services';
import { Constructor } from '../types/constructor';
import { Scope } from '../types/scope';

type InjectableOptions = {
  token?: interfaces.ServiceIdentifier<any>;
  scope?: Scope;
};

export const Injectable: (options?: InjectableOptions) => ClassDecorator = (
  options = {}
) => {
  let { token, scope = 'singleton' } = options;
  return (constructor: Function) => {
    if (typeof token === 'undefined') {
      token = constructor;
    }
    defaultServices.set(token, { cls: constructor as Constructor, scope });
    injectable()(constructor);
  };
};
