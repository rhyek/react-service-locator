export interface OnActivate {
  onActivate(): void;
}

export function implementsOnActivate(thing: any): thing is OnActivate {
  if (
    thing instanceof Object &&
    thing &&
    (thing as OnActivate).onActivate &&
    typeof (thing as OnActivate).onActivate === 'function'
  ) {
    return true;
  }
  return false;
}
