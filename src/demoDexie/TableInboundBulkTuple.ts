import type { PromiseExtended } from "dexie";
import type { DexiePrimaryKeyPathOrPaths, PrimaryKey } from "./primarykey";
import type { NoExcessDataPropertiesArray } from "./utilitytypes";

export interface TableInboundBulkTuple<
  TDatabase,
  TPKeyPathOrPaths extends DexiePrimaryKeyPathOrPaths<TDatabase>,
  TInsert
> {
  bulkAddTuple<TArr extends readonly [...any[]]>(
    items: TArr & NoExcessDataPropertiesArray<TArr, TInsert>
  ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
  bulkPutTuple<TArr extends readonly [...any[]]>(
    items: TArr & NoExcessDataPropertiesArray<TArr, TInsert>
  ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
}
