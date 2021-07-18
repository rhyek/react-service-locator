import { injectable, interfaces } from 'inversify';
import { defaultServices } from '../default-services';
import { Constructor } from '../types/constructor';
import { Scope } from '../types/scope';

type ServiceOptions = {
  provide?: interfaces.ServiceIdentifier<any>;
  scope?: Scope;
};

export const Service: (options?: ServiceOptions) => ClassDecorator = (
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