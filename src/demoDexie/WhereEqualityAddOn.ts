import type { Dexie, Table } from "dexie";

export function WhereEqualityAddOn(db: Dexie) {
  const tablePrototype = db.Table.prototype as Table;
  const methods = [
    "whereEquality",
    "whereCompositeEquality",
    "whereSingleEquality",
    "whereSingleFilterEquality",
  ];

  for (const method of methods) {
    (tablePrototype as any)[method] = function (
      this: Table,
      equality: any
    ): any {
      return tablePrototype.where.call(this, equality);
    };
  }
}
