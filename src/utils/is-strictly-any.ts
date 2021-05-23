// https://stackoverflow.com/a/61626123/410224
export type IsStrictlyAny<T> = (T extends never ? true : false) extends false
  ? false
  : true;
