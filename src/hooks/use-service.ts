import { useContext, useRef } from 'react';
import { interfaces } from 'inversify';
import { IsStrictlyAny } from '../utils/is-strictly-any';
import { ServiceLocatorContext } from '../service-locator-context';
import { StatefulService } from '../stateful-service';
import { useSetupLifeCycleHooks } from './use-setup-life-cycle-hooks';
import { useSetupStatefulService } from './use-setup-stateful-service';

export function useService<
  ExplicitProvider = any,
  Token extends interfaces.ServiceIdentifier<any> = any,
  Provider = IsStrictlyAny<ExplicitProvider> extends true
    ? Token extends interfaces.ServiceIdentifier<infer InferredProvider>
      ? InferredProvider
      : any
    : ExplicitProvider
>(token: Token): Provider;
export function useService<
  ExplicitProvider extends StatefulService<any> = any,
  Token extends IsStrictlyAny<ExplicitProvider> extends true
    ? interfaces.ServiceIdentifier<StatefulService<any>>
    : interfaces.ServiceIdentifier<any> = any,
  Provider = IsStrictlyAny<ExplicitProvider> extends true
    ? Token extends interfaces.ServiceIdentifier<infer InferredProvider>
      ? InferredProvider extends StatefulService<any>
        ? InferredProvider
        : never
      : any
    : ExplicitProvider
  // State = Provider extends StatefulService<any, infer ImmutableState>
  //   ? ImmutableState
  //   : never
>(
  token: Token,
  depsFn?: (provider: Provider) => React.DependencyList
): Provider;
export function useService(token: any, depsFn?: any): any {
  const container = useContext(ServiceLocatorContext);
  if (!container) {
    throw new Error('No DI container found.');
  }
  const { current: service } = useRef(container.get(token));

  useSetupLifeCycleHooks(service);
  useSetupStatefulService(service, depsFn);

  return service;
}
