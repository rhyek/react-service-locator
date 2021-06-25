import { useContext, useRef } from 'react';
import { ServiceLocatorContext } from '../service-locator-context';

export function useGetService<T = any>(token: any): T {
  const container = useContext(ServiceLocatorContext);
  if (!container) {
    throw new Error('No DI container found.');
  }
  const { current: service } = useRef(container.get(token));
  return service as T;
}
