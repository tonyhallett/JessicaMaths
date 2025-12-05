import type { PromiseExtended } from "dexie";
import type { DexieIndexPaths } from "./indexpaths";
import type { PrimaryKey } from "./primarykey";
import type { TableBase } from "./TableBase";
import type { NoExcessDataProperties } from "./utilitytypes";
import type { TableInboundBaseBulkTuple } from "./TableBulkTupleAddOn";

export type TableInboundBase<
  TName extends string,
  TDatabase,
  TPKeyPathOrPaths,
  TIndexPaths extends DexieIndexPaths<TDatabase>,
  TGet,
  TInsert,
  TDexie,
  TMaxDepth extends string
> = TableBase<
  TName,
  TGet,
  TDatabase,
  TInsert,
  TPKeyPathOrPaths,
  TIndexPaths,
  PrimaryKey<TDatabase, TPKeyPathOrPaths>,
  TDexie,
  TMaxDepth
> &
  TableInboundBaseBulkTuple<TDatabase, TPKeyPathOrPaths, TInsert> & {
    add<T extends TInsert>(
      item: NoExcessDataProperties<T, TInsert>
    ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
    bulkAdd(
      items: readonly TInsert[]
    ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
    /*
   making the key required, although allowed by the spec to be optional for auto-increment keys
   use add for that case
   */
    put<T extends TDatabase>(
      item: NoExcessDataProperties<T, TDatabase>
    ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
    bulkPut(
      items: readonly TInsert[]
    ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
  };
