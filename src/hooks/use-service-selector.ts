import { useState, useEffect } from 'react';
import { interfaces } from 'inversify';
import { StatefulService } from '../stateful-service';
import { IsStrictlyAny } from '../types/is-strictly-any';
import { autoCompare } from '../utils/auto-compare';
import { useGetService } from './use-get-service';

export function useServiceSelector<
  ExplicitProvider = any,
  SelectorResult = any,
  Token extends interfaces.ServiceIdentifier<any> = any,
  Provider = IsStrictlyAny<ExplicitProvider> extends true
    ? Token extends interfaces.ServiceIdentifier<infer InferredProvider>
      ? InferredProvider
      : any
    : ExplicitProvider
>(
  token: Token,
  selectorFn: (provider: Provider) => SelectorResult,
  compareFn?: (a: SelectorResult, b: SelectorResult) => boolean
): SelectorResult {
  const service = useGetService<Provider>(token);
  const [lastValue, setLastValue] = useState<SelectorResult>(() =>
    selectorFn(service)
  );

  useEffect(() => {
    if (service instanceof StatefulService) {
      const finalCompareFn =
        typeof compareFn === 'undefined' ? autoCompare : compareFn;
      const listener = () => {
        const newValue = selectorFn(service);
        if (!finalCompareFn(lastValue, newValue)) {
          setLastValue(newValue);
        }
      };
      service.addListener(listener);
      return () => {
        service.removeListener(listener);
      };
    }
  }, [service]);

  return lastValue;
}
