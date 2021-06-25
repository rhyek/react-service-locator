import { useEffect, useReducer } from 'react';
import { interfaces } from 'inversify';
import { StatefulService } from '../stateful-service';
import { IsStrictlyAny } from '../types/is-strictly-any';
import { shallowCompare } from '../utils/shallow-compare';
import { useGetService } from './use-get-service';

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
>(
  token: Token,
  depsFn?: (provider: Provider) => React.DependencyList
): Provider;
export function useService(token: any, depsFn?: any): any {
  const service = useGetService(token);

  // https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    if (service instanceof StatefulService) {
      const finalDepsFn =
        depsFn ?? ((service: StatefulService<any>) => service.state);
      const compareFn =
        typeof depsFn === 'undefined' ? Object.is : shallowCompare;
      let lastValue = finalDepsFn(service);
      const listener = () => {
        const newValue = finalDepsFn(service);
        const valuesAreEqual = compareFn(lastValue, newValue);
        lastValue = newValue;
        if (!valuesAreEqual) {
          forceUpdate();
        }
      };
      service.addListener(listener);
      return () => {
        service.removeListener(listener);
      };
    }
  }, [service]);

  return service;
}
