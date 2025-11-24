import Dexie from "dexie";

export function AddPutAutoReturnObjectAddon(db: Dexie) {
  const tablePrototype = db.Table.prototype as any;
  tablePrototype.addObject = async function (item: any, ...args: any[]) {
    await db.Table.prototype.add.call(this, item, ...args);
    return item;
  };

  tablePrototype.putObject = async function (item: any, ...args: any[]) {
    await db.Table.prototype.put.call(this, item, ...args);
    return item;
  };
}
