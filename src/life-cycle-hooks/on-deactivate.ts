export interface OnDeactivate {
  onDeactivate(): void;
}

export function implementsOnDeactivate(thing: any): thing is OnDeactivate {
  if (
    thing instanceof Object &&
    thing &&
    (thing as OnDeactivate).onDeactivate &&
    typeof (thing as OnDeactivate).onDeactivate === 'function'
  ) {
    return true;
  }
  return false;
}
