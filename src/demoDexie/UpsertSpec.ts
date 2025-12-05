import type { DeletePrimaryKeys } from "./primarykey";
import type { PropModificationTyped } from "./propmodifications";

export type DeepPropertyOrModification<T> = T extends object
  ? T extends (...args: any[]) => any
    ? T
    : T extends Array<any>
    ? T | PropModificationTyped<T>
    : {
        [K in keyof T]:
          | DeepPropertyOrModification<T[K]>
          | PropModificationTyped<T[K]>;
      }
  : T | PropModificationTyped<T>;

export type UpsertSpec<T, TPKeyPathOrPaths> = DeletePrimaryKeys<
  {
    [K in keyof T]:
      | DeepPropertyOrModification<T[K]>
      | PropModificationTyped<T[K]>;
  },
  TPKeyPathOrPaths
>;
