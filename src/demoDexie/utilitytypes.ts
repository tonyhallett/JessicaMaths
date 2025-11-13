export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
export type StringKey<T> = keyof T & string;

export type RequiredOnlyDeep<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K] extends Function
    ? T[K] // keep functions as-is
    : T[K] extends Array<infer U>
    ? Array<U> // keep arrays as-is (or optionally wrap elements in RequiredOnlyDeep<U>)
    : T[K] extends object
    ? RequiredOnlyDeep<T[K]> // recurse for objects
    : T[K]; // primitive
};
