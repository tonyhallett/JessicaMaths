import type { KeyPaths, KeyPathValue, PropModSpec } from "dexie";

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

  export type UpdateSpec<T> = {
    [KP in KeyPaths<Required<T>>]?:
      | KeyPathValue<Required<T>, KP>
      | PropModification<KeyPathValue<Required<T>, KP>>
      | (undefined extends KeyPathValue<T, KP> ? undefined : never); // delete semantics
  };
}
