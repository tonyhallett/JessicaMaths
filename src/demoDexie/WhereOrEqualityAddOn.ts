import type { Dexie, Table } from "dexie";

export function WhereOrEqualityAddOn(db: Dexie) {
  const tablePrototype = db.Table.prototype as Table;

  (tablePrototype as any).whereEquality = function (
    this: Table,
    equality: any
  ): any {
    return tablePrototype.where.call(this, equality);
  };
}
