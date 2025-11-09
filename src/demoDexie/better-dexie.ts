// https://github.com/spion/dexie-better-types/blob/main/index.d.ts

type TupleKeys<T> =
  | [keyof T]
  | [keyof T, keyof T]
  | [keyof T, keyof T, keyof T]
  | [keyof T, keyof T, keyof T, keyof T]
  | [keyof T, keyof T, keyof T, keyof T, keyof T];
export type KeysOf<T> = keyof T | TupleKeys<T>;
type ValuesOfArrayKey<T, K extends TupleKeys<T>> = K extends [
  infer A,
  ...infer B
]
  ? A extends keyof T
    ? B extends TupleKeys<T>
      ? [T[A], ...ValuesOfArrayKey<T, B>]
      : B extends []
      ? [T[A]]
      : [{ a: never }]
    : [{ b: never }]
  : [{ c: never }];
type ValuesOfKey<T, K extends KeysOf<T>> = K extends keyof T
  ? T[K]
  : K extends TupleKeys<T>
  ? ValuesOfArrayKey<T, K>
  : never;

export type UpdateKeyPaths<T> = {
  [P in keyof T]: P extends string
    ? T[P] extends Array<infer K>
      ? K extends object // only drill into the array element if it's an object
        ? P | `${P}.${number}` | `${P}.${number}.${UpdateKeyPaths<K>}`
        : P | `${P}.${number}`
      : T[P] extends (...args: any[]) => any // Method
      ? never
      : T[P] extends object
      ? P | `${P}.${UpdateKeyPaths<T[P]>}`
      : P
    : never;
}[keyof T];

export type UpdateKeyPathValue<T, PATH> = PATH extends `${infer R}.${infer S}`
  ? R extends keyof T
    ? UpdateKeyPathValue<T[R], S>
    : T extends any[]
    ? PATH extends `${number}.${infer S}`
      ? UpdateKeyPathValue<T[number], S>
      : void
    : void
  : PATH extends `${number}`
  ? T extends any[]
    ? T[number]
    : void
  : PATH extends keyof T
  ? T[PATH]
  : void;
