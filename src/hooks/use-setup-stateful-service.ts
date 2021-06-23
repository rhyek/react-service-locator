import { DependencyList, useEffect, useReducer, useRef } from 'react';
import { StatefulService } from '../stateful-service';
import { shallowCompare } from '../utils/shallow-compare';

export function useSetupStatefulService(
  service: unknown,
  depsFn?: (service: StatefulService<any>) => DependencyList
) {
  // https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const listenerRef = useRef<(() => void) | null>(null);

  if (service instanceof StatefulService && listenerRef.current === null) {
    const finalDepsFn =
      depsFn ?? ((service: StatefulService<any>) => service.state);
    const compareFn =
      typeof depsFn === 'undefined' ? Object.is : shallowCompare;
    let lastValue = finalDepsFn(service);
    listenerRef.current = () => {
      const newValue = finalDepsFn(service);
      const valuesAreEqual = compareFn(lastValue, newValue);
      lastValue = newValue;
      if (!valuesAreEqual) {
        forceUpdate();
      }
    };
  }

  useEffect(() => {
    if (service instanceof StatefulService && listenerRef.current !== null) {
      service.addListener(listenerRef.current);
      return () => {
        if (listenerRef.current !== null) {
          service.removeListener(listenerRef.current);
        }
      };
    }
  }, []);
}
