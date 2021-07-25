import { isPrimitive } from './is-primitive';
import { shallowCompare } from './shallow-compare';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function autoCompare(a: any, b: any): boolean {
  if (typeof a !== typeof b) {
    return false;
  }
  if (isPrimitive(a)) {
    return isPrimitive(b) && Object.is(a, b);
  }
  return shallowCompare(a, b);
}
