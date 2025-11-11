import type { KeyPathValue, PropModSpec, KeyPathIgnoreObject } from "dexie";

declare module "dexie" {
  export type AddRemoveValueType = number | bigint | Array<any>;
  export type PropModificationValueType = string | AddRemoveValueType;

  export class PropModification<T extends PropModificationValueType = any> {
    ["@@propmod"]: PropModSpec;
    constructor(spec: PropModSpec);
    execute(value: T): T;
  }

  export function replacePrefix(
    prefix: string,
    replaced: string
  ): PropModification<string>;

  export function add<T extends AddRemoveValueType>(
    value: T
  ): PropModification<T>;

  export function remove<T extends AddRemoveValueType>(
    value: T
  ): PropModification<T>;

  type MaxDepth<S extends string> = S extends ""
    ? never // empty string is invalid
    : S extends `I${infer Rest}` // starts with "I"
    ? Rest extends "" // if nothing left, ok
      ? S
      : MaxDepth<Rest> extends never // recursively check the rest
      ? never
      : S
    : never; // does not start with "I"

  type DexieKeyPaths<T, MAXDEPTH = "II", CURRDEPTH extends string = ""> = {
    [P in keyof T]: P extends string
      ? CURRDEPTH extends MAXDEPTH
        ? P
        : T[P] extends Array<infer K>
        ? K extends any[] // Array of arrays (issue #2026)
          ? P | `${P}.${number}` | `${P}.${number}.${number}`
          : K extends object // only drill into the array element if it's an object
          ?
              | P
              | `${P}.${number}`
              | `${P}.${number}.${DexieKeyPaths<Required<K>>}`
          : P | `${P}.${number}`
        : T[P] extends (...args: any[]) => any // Method
        ? never
        : T[P] extends KeyPathIgnoreObject // Not valid in update spec or where clause (+ avoid circular reference)
        ? P
        : T[P] extends object
        ? P | `${P}.${DexieKeyPaths<Required<T[P]>, MAXDEPTH, `${CURRDEPTH}I`>}`
        : P
      : never;
  }[keyof T];

  export type KeyPaths<
    T,
    TMAXDEPTH extends string = "II"
  > = TMAXDEPTH extends MaxDepth<TMAXDEPTH>
    ? DexieKeyPaths<T, TMAXDEPTH>
    : never;

  export type UpdateSpec<
    T,
    TMAXDEPTH extends string = "II"
  > = TMAXDEPTH extends MaxDepth<TMAXDEPTH>
    ? {
        [KP in KeyPaths<Required<T>, TMAXDEPTH>]?:
          | KeyPathValue<Required<T>, KP>
          | PropModification<KeyPathValue<Required<T>, KP>>
          | (undefined extends KeyPathValue<T, KP> ? undefined : never); // delete semantics
      }
    : never;
}
