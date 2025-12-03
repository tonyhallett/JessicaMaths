import type { Collection, Dexie, Table } from "dexie";

export function WhereOrEqualityAddOn(db: Dexie) {
  const tablePrototype = db.Table.prototype as Table;
  const collectionPrototype = db.Collection.prototype as Collection;

  (tablePrototype as any).whereEquality = function (
    this: Table,
    equality: any
  ): any {
    return tablePrototype.where.call(this, equality);
  };
  (collectionPrototype as any).orEquality = function (
    this: Collection,
    equality: any
  ): any {
    return collectionPrototype.or.call(this, equality);
  };
}
