import { isPrimitive } from './is-primitive';
import { shallowCompare } from './shallow-compare';

export function autoCompare(a: any, b: any) {
  if (typeof a !== typeof b) {
    return false;
  }
  if (isPrimitive(a)) {
    return isPrimitive(b) && Object.is(a, b);
  }
  return shallowCompare(a, b);
}
