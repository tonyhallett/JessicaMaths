import type { IndexableType, PromiseExtended } from "dexie";
import type { DexieIndexPaths } from "./indexpaths";
import type { NoExcessDataProperties } from "./utilitytypes";
import type { TableOutboundBase } from "./TableOutboundBase";
import type { PromiseExtendedPKeyOrKeys } from "./primarykey";
import type { TableOutboundAutoBulkTuple } from "./TableBulkTupleAddOn";

export type TableOutboundAuto<
  TName extends string,
  TDatabase,
  TPKey extends IndexableType,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet,
  TDexie,
  TMaxDepth extends string
> = TableOutboundBase<
  TName,
  TDatabase,
  TPKey,
  TIndexPaths,
  TGet,
  TDexie,
  TMaxDepth
> &
  TableOutboundAutoBulkTuple<TDatabase, TPKey> & {
    add<T extends TDatabase>(
      item: NoExcessDataProperties<T, TDatabase>,
      key?: TPKey
    ): PromiseExtended<TPKey>;

    bulkAdd<B extends boolean = false>(
      items: readonly TDatabase[],
      options?: {
        allKeys: B;
      }
    ): PromiseExtendedPKeyOrKeys<TPKey, B>;

    bulkAdd<B extends boolean = false>(
      items: readonly TDatabase[],
      keys: readonly (TPKey | undefined)[],
      options?: {
        allKeys: B;
      }
    ): PromiseExtendedPKeyOrKeys<TPKey, B>;

    bulkPut(
      items: readonly TDatabase[],
      keys: readonly TPKey[]
    ): PromiseExtended<TPKey>;

    bulkPut<B extends boolean = false>(
      items: readonly TDatabase[],
      keys: readonly (TPKey | undefined)[],
      options: { allKeys: B }
    ): PromiseExtendedPKeyOrKeys<TPKey, B>;
  };
