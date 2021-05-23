import { DependencyList, useEffect, useReducer } from 'react';
import { StatefulService } from '../stateful-service';
import { shallowCompare } from '../utils/shallow-compare';

export function useSetupStatefulService(
  service: unknown,
  depsFn?: (service: StatefulService<any>) => DependencyList
) {
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
    // depsFn should be essentially cached for the lifespan of the hook instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service]);
}
