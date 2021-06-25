export function isPrimitive(v: any) {
  // https://developer.mozilla.org/en-US/docs/Glossary/Primitive
  return (
    typeof v === 'string' ||
    typeof v === 'number' ||
    typeof v === 'bigint' ||
    typeof v === 'boolean' ||
    typeof v === 'undefined' ||
    typeof v === 'symbol' ||
    v === null
  );
}
