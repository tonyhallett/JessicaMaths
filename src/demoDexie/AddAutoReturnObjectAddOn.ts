import Dexie, { type Table } from "dexie";
import type { PrimaryKey } from "./primarykey";
import type { NoExcessDataProperties } from "./utilitytypes";

export interface TableInboundAutoAdd<TDatabase, TPKeyPathOrPaths, TInsert> {
  addObject<T extends TInsert>(
    item: NoExcessDataProperties<T, TInsert>
  ): Promise<
    T & {
      [K in TPKeyPathOrPaths & string]: PrimaryKey<TDatabase, TPKeyPathOrPaths>;
    }
  >;
}
export function AddAutoReturnObjectAddon(db: Dexie) {
  const tablePrototype = db.Table.prototype as Table &
    TableInboundAutoAdd<any, any, any>;

  tablePrototype.addObject = async function (
    this: Table,
    item: any
  ): Promise<any> {
    await db.Table.prototype.add.call(this, item);
    return item;
  };
}
