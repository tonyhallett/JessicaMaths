import type { IndexableType, PromiseExtended } from "dexie";
import type { DexieIndexPaths } from "./indexpaths";
import type { NoExcessDataProperties } from "./utilitytypes";
import type { TableOutboundBase } from "./TableOutboundBase";
import type { TableOutboundBulkTuple } from "./TableBulkTupleAddOn";

export type TableOutbound<
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
  TableOutboundBulkTuple<TInsert, TPKey> & {
    add<T extends TInsert>(
      item: NoExcessDataProperties<T, TInsert>,
      key: TPKey
    ): PromiseExtended<TPKey>;
    // no need for options overloads here as the keys are always provided
    bulkAdd(
      items: readonly TInsert[],
      keys: readonly TPKey[]
    ): PromiseExtended<TPKey>;
    bulkPut(
      items: readonly TInsert[],
      keys: readonly TPKey[]
    ): PromiseExtended<TPKey>;
  };
