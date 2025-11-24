import Dexie, { type Table } from "dexie";
import type { TableInboundAutoAdd } from "./tabletypes";

export function AddAutoReturnObjectAddon(db: Dexie) {
  const tablePrototype = db.Table.prototype as any;
  const addObject = async function (this: Table, item: any): Promise<any> {
    await db.Table.prototype.add.call(this, item);
    return item;
  } satisfies TableInboundAutoAdd<any, any, any>["addObject"];

  tablePrototype.addObject = addObject;
}
