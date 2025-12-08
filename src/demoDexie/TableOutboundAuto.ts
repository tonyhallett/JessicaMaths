import type { IndexableType, PromiseExtended } from "dexie";
import type { DexieIndexPaths } from "./indexpaths";
import type { NoExcessDataProperties } from "./utilitytypes";
import type { TableOutboundBase } from "./TableOutboundBase";
import type { PromiseExtendedPKeyOrKeys } from "./primarykey";
import type { TableOutboundAutoBulkTuple } from "./TableBulkTupleAddOn";

export type TableOutboundAuto<
  TName extends string,
  TDatabase,
  TInsert,
  TPKey extends IndexableType,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet,
  TDexie,
  TMaxDepth extends string
> = TableOutboundBase<
  TName,
  TDatabase,
  TInsert,
  TPKey,
  TIndexPaths,
  TGet,
  TDexie,
  TMaxDepth
> &
  TableOutboundAutoBulkTuple<TInsert, TPKey> & {
    add<T extends TInsert>(
      item: NoExcessDataProperties<T, TInsert>,
      key?: TPKey
    ): PromiseExtended<TPKey>;

    bulkAdd<B extends boolean = false>(
      items: readonly TInsert[],
      options?: {
        allKeys: B;
      }
    ): PromiseExtendedPKeyOrKeys<TPKey, B>;

    bulkAdd<B extends boolean = false>(
      items: readonly TInsert[],
      keys: readonly (TPKey | undefined)[],
      options?: {
        allKeys: B;
      }
    ): PromiseExtendedPKeyOrKeys<TPKey, B>;

    bulkPut(
      items: readonly TInsert[],
      keys: readonly TPKey[]
    ): PromiseExtended<TPKey>;

    bulkPut<B extends boolean = false>(
      items: readonly TInsert[],
      keys: readonly (TPKey | undefined)[],
      options: { allKeys: B }
    ): PromiseExtendedPKeyOrKeys<TPKey, B>;
  };
