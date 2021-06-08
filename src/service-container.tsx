import React, { useContext, useMemo } from 'react';
import { Container, interfaces } from 'inversify';
import { ServiceLocatorContext } from './service-locator-context';

function createContainer() {
  return new Container({
    skipBaseClassChecks: true,
  });
}

type Scope = 'singleton' | 'transient';

type Provider =
  | (new (...args: any[]) => any)
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
  services: Provider[];
}

export const ServiceContainer: React.FC<ServiceLocatorProviderProps> = ({
  services,
  children,
}) => {
  const parentContainer = useContext(ServiceLocatorContext);
  const container = useMemo(() => {
    // https://github.com/inversify/InversifyJS/blob/master/wiki/hierarchical_di.md
    const container = parentContainer
      ? parentContainer.createChild()
      : createContainer();
    for (const provider of services) {
      if (typeof provider === 'function') {
        container.bind(provider).to(provider).inSingletonScope();
      } else {
        const { provide } = provider;
        let scope: Scope = 'singleton';
        if ('scope' in provider && provider.scope) {
          scope = provider.scope;
        }
        if ('useClass' in provider && provider.useClass) {
          const binding = container.bind(provide).to(provider.useClass);
          if (scope === 'singleton') {
            binding.inSingletonScope();
          }
        } else if ('useFactory' in provider && provider.useFactory) {
          const binding = container
            .bind(provide)
            .toDynamicValue(provider.useFactory);
          if (scope === 'singleton') {
            binding.inSingletonScope();
          }
        } else if ('useValue' in provider && provider.useValue) {
          container.bind(provide).toConstantValue(provider.useValue);
        } else {
          throw new Error('Unable to determine how to register provider.');
        }
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
