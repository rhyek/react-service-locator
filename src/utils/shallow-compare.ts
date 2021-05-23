export function shallowCompare(
  a: React.DependencyList,
  b: React.DependencyList
) {
  return a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
}
