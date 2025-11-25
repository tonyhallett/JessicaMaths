import Dexie, { type PromiseExtended, type Table } from "dexie";
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
    items: TArr & NoExcessDataPropertiesArray<TArr, TDatabase>
  ): PromiseExtended<PrimaryKey<TDatabase, TPKeyPathOrPaths>>;
}

export function TableInboundBulkTupleAddOn(db: Dexie) {
  const tablePrototype = db.Table.prototype as Table &
    TableInboundBulkTuple<any, any, any>;

  tablePrototype.bulkAddTuple = function (
    this: Table,
    items: readonly any[]
  ): PromiseExtended<any> {
    return db.Table.prototype.bulkAdd.call(this, items);
  };
  tablePrototype.bulkPutTuple = function (
    this: Table,
    items: readonly any[]
  ): PromiseExtended<any> {
    return db.Table.prototype.bulkPut.call(this, items);
  };
}
