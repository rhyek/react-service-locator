import { isPrimitive } from './is-primitive';

function shallowCompareArray<T extends Array<any>>(a: T, b: T) {
  return a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
}

export function shallowCompare<T>(a: T, b: T) {
  if (typeof a !== typeof b || isPrimitive(a) || isPrimitive(b)) {
    return false;
  }
  if (Array.isArray(a)) {
    return Array.isArray(b) && shallowCompareArray(a, b);
  }
  if (typeof a === 'object') {
    return (
      typeof b === 'object' &&
      shallowCompareArray(Object.values(a), Object.values(b))
    );
  }
  return false;
}
