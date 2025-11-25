import type { PromiseExtended } from "dexie";
import type { DexieIndexPaths } from "./indexpaths";
import type { DexiePrimaryKeyPathOrPaths, PrimaryKey } from "./primarykey";
import type { TableBase } from "./TableBase";
import type { NoExcessDataProperties } from "./utilitytypes";
import type { TableInboundBulkTuple } from "./TableInboundBulkTupleAddOn";

export interface TableInboundBase<
  TName extends string,
  TDatabase,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet,
  TInsert
> extends TableBase<
      TName,
      TGet,
      TDatabase,
      TInsert,
      TPKeyPathOrPaths,
      TIndexPaths
    >,
    TableInboundBulkTuple<TDatabase, TPKeyPathOrPaths, TInsert> {
  add<T extends TInsert>(
    item: NoExcessDataProperties<T, TInsert>
  ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
  bulkAdd(
    items: readonly TInsert[]
  ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
  put(
    item: TDatabase
  ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
  bulkPut(
    items: readonly TDatabase[]
  ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
}
