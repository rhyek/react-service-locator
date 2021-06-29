import { injectable, interfaces } from 'inversify';
import { defaultServices } from '../default-services';
import { Constructor } from '../types/constructor';
import { Scope } from '../types/scope';

type InjectableOptions = {
  provide?: interfaces.ServiceIdentifier<any>;
  scope?: Scope;
};

export const Injectable: (options?: InjectableOptions) => ClassDecorator = (
  options = {}
) => {
  let { provide, scope = 'singleton' } = options;
  return (constructor: Function) => {
    if (typeof provide === 'undefined') {
      provide = constructor;
    }
    defaultServices.set(provide, { cls: constructor as Constructor, scope });
    injectable()(constructor);
  };
};
