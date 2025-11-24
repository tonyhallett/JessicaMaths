import Dexie, { type PromiseExtended, type Table } from "dexie";
import type { TableInboundBulkTuple } from "./tabletypes";

export function TableInboundBulkTupleAddOn(db: Dexie) {
  const tablePrototype = db.Table.prototype as any;
  const bulkAdd = function (
    this: Table,
    items: readonly any[]
  ): PromiseExtended<any> {
    return db.Table.prototype.bulkAdd.call(this, items);
  } satisfies TableInboundBulkTuple<any, any, any>["bulkAddTuple"];

  const bulkPut = function (
    this: Table,
    items: readonly any[]
  ): PromiseExtended<any> {
    return db.Table.prototype.bulkPut.call(this, items);
  } satisfies TableInboundBulkTuple<any, any, any>["bulkPutTuple"];

  tablePrototype.bulkAddTuple = bulkAdd;
  tablePrototype.bulkPutTuple = bulkPut;
}
