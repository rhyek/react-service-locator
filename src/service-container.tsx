import React, { useContext, useMemo, useRef, useEffect } from 'react';
import { interfaces } from 'inversify';
import { ServiceLocatorContext } from './service-locator-context';
import { Scope } from './types/scope';
import {
  addDefaultServiceRegisteredCallback,
  defaultServices,
  removeDefaultServiceRegisteredCallback,
} from './default-services';
import { Constructor } from './types/constructor';
import { createContainer } from './create-container';
import { debug } from './debug';

type Provider =
  | Constructor
  | {
      provide: interfaces.ServiceIdentifier<any>;
      useClass: new (...args: any[]) => any;
      scope?: Scope;
    }
  | {
      provide: interfaces.ServiceIdentifier<any>;
      useFactory: (context: interfaces.Context) => any;
      scope?: Scope;
    }
  | {
      provide: interfaces.ServiceIdentifier<any>;
      useValue: any;
      scope?: never;
    };

interface ServiceLocatorProviderProps {
  services?: Provider[];
}

export const ServiceContainer: React.FC<ServiceLocatorProviderProps> = ({
  services = [],
  children,
}) => {
  const parentContainer = useContext(ServiceLocatorContext);
  const defaultServiceRegisteredCallback = useRef<() => void>();
  const container = useMemo(() => {
    // https://github.com/inversify/InversifyJS/blob/master/wiki/hierarchical_di.md
    const isRoot = parentContainer === null;
    const container = isRoot
      ? createContainer()
      : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        parentContainer!.createChild();
    const doneTokens: any[] = [];
    const registerServicesOnContainer = () => {
      const finalServices = services.slice();
      if (isRoot) {
        // only automatically register decorated services on root service containers
        defaultServices.forEach(({ cls, scope }, token) => {
          finalServices.unshift({
            provide: token,
            useClass: cls,
            scope,
          });
        });
      }
      let nRegistered = 0;
      for (const provider of finalServices.reverse()) {
        let finalProvider: Exclude<Provider, Constructor>;
        if (typeof provider === 'function') {
          finalProvider = {
            provide: provider as Constructor,
            useClass: provider as Constructor,
            scope: 'singleton',
          };
        } else {
          finalProvider = provider;
        }
        const { provide } = finalProvider;
        if (doneTokens.includes(provide)) {
          continue;
        }
        nRegistered++;
        doneTokens.push(provide);
        let scope: Scope = 'singleton';
        if ('scope' in finalProvider && finalProvider.scope) {
          scope = finalProvider.scope;
        }
        if ('useClass' in finalProvider && finalProvider.useClass) {
          const binding = container.bind(provide).to(finalProvider.useClass);
          if (scope === 'singleton') {
            binding.inSingletonScope();
          }
        } else if ('useFactory' in finalProvider && finalProvider.useFactory) {
          const binding = container
            .bind(provide)
            .toDynamicValue(finalProvider.useFactory);
          if (scope === 'singleton') {
            binding.inSingletonScope();
          }
        } else if ('useValue' in finalProvider && finalProvider.useValue) {
          container.bind(provide).toConstantValue(finalProvider.useValue);
        } else {
          throw new Error('Unable to determine how to register provider.');
        }
      }
      debug(`Registered ${nRegistered} services on container.`);
    };
    registerServicesOnContainer();
    defaultServiceRegisteredCallback.current =
      function defaultServiceRegisteredCallback() {
        registerServicesOnContainer();
      };
    addDefaultServiceRegisteredCallback(
      defaultServiceRegisteredCallback.current
    );
    return container;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentContainer]);

  useEffect(() => {
    return () => {
      if (defaultServiceRegisteredCallback.current) {
        removeDefaultServiceRegisteredCallback(
          defaultServiceRegisteredCallback.current
        );
      }
    };
  }, [parentContainer]);

  return (
    <ServiceLocatorContext.Provider value={container}>
      {children}
    </ServiceLocatorContext.Provider>
  );
};
