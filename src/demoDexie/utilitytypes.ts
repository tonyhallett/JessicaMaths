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

// Split a dotted key path into tuple
type Split<Path extends string> = Path extends `${infer Head}.${infer Rest}`
  ? [Head, ...Split<Rest>]
  : [Path];

// Recursively make the property at the path optional
type OptionalByPath<T, Parts extends readonly string[]> = Parts extends [
  infer Head,
  ...infer Rest
]
  ? Head extends keyof T
    ? Rest extends []
      ? Omit<T, Head> & { [K in Head]?: T[K] }
      : Omit<T, Head> & {
          [K in Head]: OptionalByPath<T[Head], Extract<Rest, string[]>>;
        }
    : T
  : T;

export type OptionalPrimaryKeys<
  T,
  TKey extends string | readonly string[]
> = TKey extends readonly string[]
  ? TKey extends [infer First, ...infer Rest]
    ? First extends string
      ? Rest extends readonly string[]
        ? OptionalPrimaryKeys<OptionalByPath<T, Split<First>>, Rest>
        : OptionalByPath<T, Split<First>>
      : T
    : T
  : TKey extends string
  ? OptionalByPath<T, Split<TKey>>
  : T;
