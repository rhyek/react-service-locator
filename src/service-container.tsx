import React, { useContext, useMemo } from 'react';
import { Container, interfaces } from 'inversify';
import { ServiceLocatorContext } from './service-locator-context';
import { Scope } from './types/scope';
import { defaultServices } from './default-services';
import { Constructor } from './types/constructor';

function createContainer() {
  return new Container({
    skipBaseClassChecks: true,
  });
}

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
  const container = useMemo(() => {
    // https://github.com/inversify/InversifyJS/blob/master/wiki/hierarchical_di.md
    const container = parentContainer
      ? parentContainer.createChild()
      : createContainer();
    const finalServices = services.slice();
    defaultServices.forEach(({ cls, scope }, token) => {
      finalServices.unshift({
        provide: token,
        useClass: cls,
        scope,
      });
    });
    const doneTokens: any[] = [];
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
    return container;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentContainer]);

  return (
    <ServiceLocatorContext.Provider value={container}>
      {children}
    </ServiceLocatorContext.Provider>
  );
};
