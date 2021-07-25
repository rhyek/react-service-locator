import { useState, useEffect, MutableRefObject } from 'react';
import { interfaces } from 'inversify';
import { StatefulService } from '../stateful-service';
import { IsStrictlyAny } from '../types/is-strictly-any';
import { autoCompare } from '../utils/auto-compare';
import { useGetService } from './use-get-service';
import { useForceUpdate } from './use-force-update';

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
  selectorFn: (service: Provider) => SelectorResult,
  compareFn?: (a: SelectorResult, b: SelectorResult) => boolean
): SelectorResult {
  const service = useGetService<Provider>(token);
  const forceUpdate = useForceUpdate();
  const [lastValueRef] = useState<MutableRefObject<SelectorResult>>(() => ({
    current: selectorFn(service),
  }));

  useEffect(() => {
    if (service instanceof StatefulService) {
      const finalCompareFn =
        typeof compareFn === 'undefined' ? autoCompare : compareFn;
      const listener = () => {
        const newValue = selectorFn(service);
        if (!finalCompareFn(lastValueRef.current, newValue)) {
          lastValueRef.current = newValue;
          forceUpdate();
        }
      };
      service.addListener(listener);
      return () => {
        service.removeListener(listener);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service]);

  return lastValueRef.current;
}
