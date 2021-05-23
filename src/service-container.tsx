import React, { useContext, useMemo } from 'react';
import { Container, interfaces } from 'inversify';
import { ServiceLocatorContext } from './service-locator-context';

function createContainer() {
  return new Container({
    skipBaseClassChecks: true,
  });
}

type Provider =
  | (new (...args: any[]) => any)
  | {
      provide: interfaces.ServiceIdentifier<any>;
      useClass?: new (...args: any[]) => any;
      useValue?: any;
      useFactory?: (context: interfaces.Context) => any;
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
        const { provide, useClass, useValue, useFactory } = provider;
        if (useClass) {
          container.bind(provide).to(useClass).inSingletonScope();
        } else if (useValue) {
          container.bind(provide).toConstantValue(useValue);
        } else if (useFactory) {
          container.bind(provide).toDynamicValue(useFactory);
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
