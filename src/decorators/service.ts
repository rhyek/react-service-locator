import { injectable, interfaces } from 'inversify';
import { registerDefaultService } from '../default-services';
import { Constructor } from '../types/constructor';
import { Scope } from '../types/scope';

type ServiceOptions = {
  provide?: interfaces.ServiceIdentifier<any>;
  scope?: Scope;
};

export const Service: (options?: ServiceOptions) => ClassDecorator = (
  options = {}
) => {
  let { provide } = options;
  const { scope = 'singleton' } = options;
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (constructor: Function) => {
    if (typeof provide === 'undefined') {
      provide = constructor;
    }
    injectable()(constructor as new (args: never) => unknown);
    registerDefaultService(provide, { cls: constructor as Constructor, scope });
  };
};
