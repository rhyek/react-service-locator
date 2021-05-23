import { useEffect } from 'react';
import { implementsOnActivate } from '../life-cycle-hooks/on-activate';
import { implementsOnDeactivate } from '../life-cycle-hooks/on-deactivate';

const refCountMap: Map<any, number> = new Map();

export function useSetupLifeCycleHooks(service: any) {
  useEffect(() => {
    const shouldInitialize = implementsOnActivate(service);
    const shouldTeardown = implementsOnDeactivate(service);
    if (shouldInitialize || shouldTeardown) {
      let count = refCountMap.get(service);
      if (typeof count === 'undefined') {
        count = 1;
        refCountMap.set(service, 1);
        if (shouldInitialize) {
          service.onActivate();
        }
      } else {
        refCountMap.set(service, count + 1);
      }
      return () => {
        let count = refCountMap.get(service)!;
        count -= 1;
        if (count === 0) {
          refCountMap.delete(service);
          if (shouldTeardown) {
            service.onDeactivate();
          }
        } else {
          refCountMap.set(service, count);
        }
      };
    }
  }, [service]);
}
