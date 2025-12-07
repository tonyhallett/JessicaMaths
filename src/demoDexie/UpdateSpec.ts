import type { KeyPathIgnoreObject, KeyPathValue } from "dexie";
import type { PropModificationTyped } from "./propmodifications";
import type { NextDepth, NoDescend } from "./utilitytypes";

export type Level2 = "II";

type UpdateKeyPaths<
  T,
  TMaxDepth = Level2,
  TCurrDepth extends string = NoDescend
> = {
  [P in keyof T]: P extends string
    ? TCurrDepth extends TMaxDepth
      ? P
      : T[P] extends Array<infer K>
      ? K extends any[] // Array of arrays (issue #2026)
        ? P | `${P}.${number}` | `${P}.${number}.${number}`
        : K extends object // only drill into the array element if it's an object
        ? P | `${P}.${number}` | `${P}.${number}.${UpdateKeyPaths<Required<K>>}`
        : P | `${P}.${number}`
      : T[P] extends (...args: any[]) => any // Method
      ? never
      : T[P] extends KeyPathIgnoreObject // Not valid in update spec or where clause (+ avoid circular reference)
      ? P
      : T[P] extends object
      ?
          | P
          | `${P}.${UpdateKeyPaths<
              Required<T[P]>,
              TMaxDepth,
              NextDepth<TCurrDepth>
            >}`
      : P
    : never;
}[keyof T];

export type UpdateSpec<T, TMaxDepth extends string> = {
  [KP in UpdateKeyPaths<Required<T>, TMaxDepth>]?:
    | KeyPathValue<Required<T>, KP>
    | PropModificationTyped<KeyPathValue<T, KP>>
    | (undefined extends KeyPathValue<T, KP> ? undefined : never);
};
