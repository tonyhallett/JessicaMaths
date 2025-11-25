import type { PromiseExtended } from "dexie";
import type { DexieIndexPaths } from "./indexpaths";
import type { DexiePrimaryKeyPathOrPaths, PrimaryKey } from "./primarykey";
import type { TableBase } from "./TableBase";
import type { NoExcessDataProperties } from "./utilitytypes";

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
  > {
  add<T extends TInsert>(
    item: NoExcessDataProperties<T, TInsert>
  ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
  bulkAdd(
    items: readonly TInsert[]
  ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
}
